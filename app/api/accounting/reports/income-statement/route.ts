import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const accounts = await db.accountingAccount.findMany({
      where: { organizationId, isActive: true },
      include: {
        journalLines: {
          where: {
            entry: {
              status: "POSTED",
              ...(startDate || endDate ? { date: dateFilter } : {}),
            },
          },
        },
      },
      orderBy: { code: "asc" },
    });

    const calculateTotal = (lines: any[], isCredit: boolean = true) => {
      return lines.reduce((sum, line) => {
        return sum + (isCredit ? Number(line.credit) : Number(line.debit));
      }, 0);
    };

    const revenueAccounts = accounts.filter(a => a.type === "REVENUE");
    const expenseAccounts = accounts.filter(a => a.type === "EXPENSE");

    const revenues = revenueAccounts.map(acc => {
      const total = calculateTotal(acc.journalLines, true);
      const debits = calculateTotal(acc.journalLines, false);
      const net = total - debits;
      return {
        code: acc.code,
        name: acc.name,
        amount: net,
      };
    }).filter(a => a.amount !== 0);

    const expenses = expenseAccounts.map(acc => {
      const total = calculateTotal(acc.journalLines, false);
      const credits = calculateTotal(acc.journalLines, true);
      const net = total - credits;
      return {
        code: acc.code,
        name: acc.name,
        amount: net,
      };
    }).filter(a => a.amount !== 0);

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const grossProfit = totalRevenue - totalExpenses;
    const netProfit = grossProfit;

    const isProfitable = netProfit >= 0;

    return NextResponse.json({
      revenues,
      expenses,
      summary: {
        totalRevenue,
        totalExpenses,
        grossProfit,
        netProfit,
        isProfitable,
      },
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });
  } catch (error) {
    console.error("Error getting income statement:", error);
    return errorResponse("Error fetching income statement");
  }
}
