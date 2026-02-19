import { NextResponse } from "next/server";
import prisma, { getScopedPrisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Get oragnization from session (organizationId must be injected by auth.ts)
  const organizationId = (session.user as any).organizationId;
  if (!organizationId) {
    return new NextResponse("No organization found for this user", { status: 403 });
  }

  // Use scoped client — all queries are automatically filtered by organizationId
  const db = getScopedPrisma(organizationId);

  try {
    // 1. Total Sales (PAID invoices)
    const paidInvoices = await db.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    });

    // 2. Total Expenses (PAID expenses)
    const paidExpenses = await db.expense.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    });

    // 3. Pending Receivables
    const pendingReceivables = await db.invoice.aggregate({
      where: { status: { in: ["DRAFT", "SENT", "PARTIAL"] } },
      _sum: { total: true },
    });

    // 4. Recent Activity (5 items)
    const [recentInvoices, recentExpenses] = await Promise.all([
      db.invoice.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { client: true },
      }),
      db.expense.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const recentActivity = [
      ...recentInvoices.map((inv: any) => ({
        id: inv.id,
        title: `Factura #${inv.number}`,
        entity: inv.client.name,
        amount: `$${Number(inv.total).toLocaleString("es-CO")}`,
        type: "Venta",
        time: inv.createdAt,
        status: inv.status,
      })),
      ...recentExpenses.map((exp: any) => ({
        id: exp.id,
        title: `Gasto #${exp.number}`,
        entity: exp.provider,
        amount: `$${Number(exp.total).toLocaleString("es-CO")}`,
        type: "Gasto",
        time: exp.createdAt,
        status: exp.status,
      })),
    ]
      .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);

    return NextResponse.json({
      totalSales: Number(paidInvoices._sum.total || 0),
      totalExpenses: Number(paidExpenses._sum.total || 0),
      pendingReceivables: Number(pendingReceivables._sum.total || 0),
      netMargin: Number(paidInvoices._sum.total || 0) - Number(paidExpenses._sum.total || 0),
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
