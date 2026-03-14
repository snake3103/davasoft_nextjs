import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { Decimal } from "decimal.js";

export async function GET() {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      paidInvoices,
      paidExpenses,
      pendingReceivables,
      pendingPayables,
      recentInvoices,
      recentExpenses,
      totalProducts,
      lowStockProducts,
      allInvoices,
    ] = await Promise.all([
      db.invoice.aggregate({
        where: { status: "PAID", organizationId },
        _sum: { total: true },
      }),
      db.expense.aggregate({
        where: { status: "PAID", organizationId },
        _sum: { total: true },
      }),
      db.invoice.aggregate({
        where: { status: { in: ["DRAFT", "SENT", "PARTIAL"] }, organizationId },
        _sum: { total: true },
      }),
      db.expense.aggregate({
        where: { status: "PENDING", organizationId },
        _sum: { total: true },
      }),
      db.invoice.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { organizationId },
        include: { client: true },
      }),
      db.expense.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { organizationId },
      }),
      db.product.count({
        where: { organizationId },
      }),
      db.product.count({
        where: {
          organizationId,
          minStock: { gt: 0 },
        },
      }),
      db.invoice.findMany({
        where: { organizationId },
        select: { date: true, total: true, status: true },
        orderBy: { date: "desc" },
      }),
    ]);

    const totalSales = Number(paidInvoices._sum.total || 0);
    const totalExpenses = Number(paidExpenses._sum.total || 0);
    const netMargin = totalSales - totalExpenses;
    const pendingRec = Number(pendingReceivables._sum.total || 0);
    const pendingPay = Number(pendingPayables._sum.total || 0);

    const recentActivity = [
      ...recentInvoices.map((inv) => ({
        id: inv.id,
        title: `Factura #${inv.number}`,
        entity: inv.client.name,
        amount: Number(inv.total),
        formattedAmount: `$${Number(inv.total).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`,
        type: "Venta",
        time: inv.createdAt,
        status: inv.status,
      })),
      ...recentExpenses.map((exp) => ({
        id: exp.id,
        title: `Gasto #${exp.number}`,
        entity: exp.provider,
        amount: Number(exp.total),
        formattedAmount: `$${Number(exp.total).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`,
        type: "Gasto",
        time: exp.createdAt,
        status: exp.status,
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6);

    const lowStockCount = await db.product.count({
      where: {
        organizationId,
        minStock: { gt: 0 },
      },
    });

    const monthlyData: Record<string, { sales: number; expenses: number }> = {};
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("es-DO", { month: "short" });
      months.push(key);
      monthlyData[key] = { sales: 0, expenses: 0 };
    }

    const invoicesThisMonth = allInvoices.filter(
      (inv) => inv.status === "PAID" && new Date(inv.date) >= startOfMonth
    );
    const salesThisMonth = invoicesThisMonth.reduce((sum, inv) => sum + Number(inv.total), 0);

    const lastMonthInvoices = allInvoices.filter(
      (inv) =>
        inv.status === "PAID" &&
        new Date(inv.date) >= startOfLastMonth &&
        new Date(inv.date) <= endOfLastMonth
    );
    const salesLastMonth = lastMonthInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

    const salesChange =
      salesLastMonth > 0
        ? ((salesThisMonth - salesLastMonth) / salesLastMonth) * 100
        : 0;

    const pendingInvoicesCount = await db.invoice.count({
      where: { status: { in: ["DRAFT", "SENT", "PARTIAL"] }, organizationId },
    });

    const totalClients = await db.client.count({
      where: { organizationId },
    });

    return NextResponse.json({
      financials: {
        totalSales,
        totalExpenses,
        netMargin,
        pendingReceivables: pendingRec,
        pendingPayables: pendingPay,
        salesThisMonth,
        salesLastMonth,
        salesChange,
      },
      inventory: {
        totalProducts,
        lowStockCount,
      },
      sales: {
        pendingInvoicesCount,
        totalClients,
      },
      monthlyChart: months.map((month) => ({
        name: month,
        ingresos: monthlyData[month].sales,
        gastos: monthlyData[month].expenses,
      })),
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return errorResponse("Internal Server Error");
  }
}
