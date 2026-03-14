import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    let dateFilter = {};
    
    if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      dateFilter = {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
    } else if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    }

    const invoices = await db.invoice.findMany({
      where: {
        organizationId,
        status: { in: ["PAID", "SENT"] },
        ...dateFilter,
      },
      include: {
        client: true,
      },
      orderBy: { date: "asc" },
    });

    const summary = invoices.reduce(
      (acc, invoice) => {
        acc.subtotal += Number(invoice.subtotal);
        acc.itbis += Number(invoice.tax);
        acc.total += Number(invoice.total);
        acc.count += 1;
        return acc;
      },
      { subtotal: 0, itbis: 0, total: 0, count: 0 }
    );

    const bookData = invoices.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      date: invoice.date,
      clientName: invoice.client.name,
      clientIdNumber: invoice.client.idNumber || "",
      subtotal: Number(invoice.subtotal),
      itbis: Number(invoice.tax),
      total: Number(invoice.total),
      status: invoice.status,
    }));

    return NextResponse.json({
      period: month && year ? `${year}-${month.padStart(2, "0")}` : "custom",
      startDate: month && year 
        ? new Date(parseInt(year), parseInt(month) - 1, 1).toISOString()
        : startDate,
      endDate: month && year
        ? new Date(parseInt(year), parseInt(month), 0).toISOString()
        : endDate,
      entries: bookData,
      summary: {
        totalInvoices: summary.count,
        totalSubtotal: summary.subtotal,
        totalItbis: summary.itbis,
        total: summary.total,
      },
    });
  } catch (error) {
    console.error("Error generating sales book:", error);
    return errorResponse("Error generating sales book");
  }
}