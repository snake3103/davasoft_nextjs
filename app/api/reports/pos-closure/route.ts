import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const invoices = await db.invoice.findMany({
      where: {
        organizationId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ["PAID", "SENT"] },
      },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const summary = {
      totalSales: 0,
      totalItbis: 0,
      totalInvoices: 0,
      cashPayments: 0,
      cardPayments: 0,
      transferPayments: 0,
      otherPayments: 0,
      productsSold: 0,
      averageTicket: 0,
    };

    const invoiceSummary = invoices.map((invoice) => {
      const subtotal = Number(invoice.subtotal);
      const itbis = Number(invoice.tax);
      const total = Number(invoice.total);
      
      summary.totalSales += subtotal;
      summary.totalItbis += itbis;
      summary.totalInvoices += 1;
      summary.productsSold += invoice.items.reduce((sum, item) => sum + item.quantity, 0);

      return {
        id: invoice.id,
        number: invoice.number,
        client: invoice.client?.name || "Consumidor Final",
        subtotal,
        itbis,
        total,
        items: invoice.items.length,
      };
    });

    if (summary.totalInvoices > 0) {
      summary.averageTicket = summary.totalSales / summary.totalInvoices;
    }

    const payments = await db.payment.findMany({
      where: {
        invoice: {
          organizationId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
    });

    payments.forEach((payment) => {
      const amount = Number(payment.amount);
      switch (payment.method) {
        case "CASH":
          summary.cashPayments += amount;
          break;
        case "CREDIT_CARD":
          summary.cardPayments += amount;
          break;
        case "BANK_TRANSFER":
          summary.transferPayments += amount;
          break;
        default:
          summary.otherPayments += amount;
      }
    });

    return NextResponse.json({
      reportDate: date,
      generatedAt: new Date().toISOString(),
      summary: {
        totalInvoices: summary.totalInvoices,
        totalSales: summary.totalSales,
        totalItbis: summary.totalItbis,
        totalCollected: summary.totalSales + summary.totalItbis,
        averageTicket: summary.averageTicket,
        productsSold: summary.productsSold,
      },
      payments: {
        cash: summary.cashPayments,
        card: summary.cardPayments,
        transfer: summary.transferPayments,
        other: summary.otherPayments,
      },
      invoices: invoiceSummary,
    });
  } catch (error) {
    console.error("Error generating Z close:", error);
    return errorResponse("Error generating Z close report");
  }
}