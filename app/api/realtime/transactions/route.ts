import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since");

    // Get recent invoices (last 5 minutes for polling)
    const sinceDate = since 
      ? new Date(since) 
      : new Date(Date.now() - 5 * 60 * 1000);

    const recentInvoices = await db.invoice.findMany({
      where: {
        organizationId,
        createdAt: { gte: sinceDate },
      },
      include: {
        client: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Get recent incomes (payments received)
    const recentIncomes = await db.income.findMany({
      where: {
        organizationId,
        createdAt: { gte: sinceDate },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      invoices: recentInvoices.map(inv => ({
        id: inv.id,
        number: inv.number,
        total: Number(inv.total),
        status: inv.status,
        clientName: inv.client?.name || "Cliente",
        createdAt: inv.createdAt.toISOString(),
      })),
      incomes: recentIncomes.map(inc => ({
        id: inc.id,
        number: inc.number,
        amount: Number(inc.amount),
        description: inc.description,
        createdAt: inc.createdAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Recent transactions error:", error);
    return NextResponse.json({ error: "Error fetching transactions" }, { status: 500 });
  }
}