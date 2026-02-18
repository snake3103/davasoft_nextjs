import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 1. Calculate Total Sales (sum of all PAID invoices)
    const paidInvoices = await prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    });

    // 2. Calculate Total Expenses (sum of all PAID expenses)
    const paidExpenses = await prisma.expense.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    });

    // 3. Pending Receivables (sum of DRAFT, SENT, PARTIAL invoices)
    const pendingReceivables = await prisma.invoice.aggregate({
      where: { 
        status: { in: ["DRAFT", "SENT", "PARTIAL"] } 
      },
      _sum: { total: true },
    });

    // 4. Get Recent Activity (limited to 5)
    // We'll combine invoices and expenses and sort by date
    const [recentInvoices, recentExpenses] = await Promise.all([
      prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { client: true },
      }),
      prisma.expense.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const recentActivity = [
      ...recentInvoices.map((inv: any) => ({
        id: inv.id,
        title: `Factura #${inv.number}`,
        entity: inv.client.name,
        amount: `$${Number(inv.total).toLocaleString()}`,
        type: "Venta",
        time: inv.createdAt,
        status: inv.status,
      })),
      ...recentExpenses.map((exp: any) => ({
        id: exp.id,
        title: `Gasto #${exp.number}`,
        entity: exp.provider,
        amount: `$${Number(exp.total).toLocaleString()}`,
        type: "Gasto",
        time: exp.createdAt,
        status: exp.status,
      })),
    ].sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

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
