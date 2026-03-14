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

    const purchases = await db.expense.findMany({
      where: {
        organizationId,
        status: { in: ["PAID", "PENDING"] },
        ...dateFilter,
      },
      include: {
        category: true,
      },
      orderBy: { date: "asc" },
    });

    const filteredPurchases = purchases.filter(p => p.type === "PURCHASE");

    const summary = filteredPurchases.reduce(
      (acc, purchase) => {
        const total = Number(purchase.total);
        const subtotal = total / 1.18;
        const itbis = total - subtotal;
        
        acc.subtotal += subtotal;
        acc.itbis += itbis;
        acc.total += total;
        acc.count += 1;
        return acc;
      },
      { subtotal: 0, itbis: 0, total: 0, count: 0 }
    );

    const bookData = purchases.map((purchase) => {
      const total = Number(purchase.total);
      const subtotal = total / 1.18;
      const itbis = total - subtotal;
      
      return {
        id: purchase.id,
        number: purchase.number,
        date: purchase.date,
        provider: purchase.provider,
        category: purchase.category?.name || "General",
        subtotal,
        itbis,
        total,
        status: purchase.status,
      };
    });

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
    console.error("Error generating purchases book:", error);
    return errorResponse("Error generating purchases book");
  }
}