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

    const calculateBalance = (lines: any[], type: string) => {
      const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit), 0);
      const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit), 0);
      
      if (type === "ASSET" || type === "EXPENSE") {
        return totalDebit - totalCredit;
      }
      return totalCredit - totalDebit;
    };

    const assets = accounts.filter(a => a.type === "ASSET");
    const liabilities = accounts.filter(a => a.type === "LIABILITY");
    const equity = accounts.filter(a => a.type === "EQUITY");

    const assetsTotal = assets.reduce((sum, acc) => sum + calculateBalance(acc.journalLines, "ASSET"), 0);
    const liabilitiesTotal = liabilities.reduce((sum, acc) => sum + calculateBalance(acc.journalLines, "LIABILITY"), 0);
    const equityTotal = equity.reduce((sum, acc) => sum + calculateBalance(acc.journalLines, "EQUITY"), 0);

    const balanceTotal = liabilitiesTotal + equityTotal;

    return NextResponse.json({
      assets: assets.map(acc => ({
        code: acc.code,
        name: acc.name,
        balance: calculateBalance(acc.journalLines, "ASSET"),
      })).filter(a => a.balance !== 0),
      liabilities: liabilities.map(acc => ({
        code: acc.code,
        name: acc.name,
        balance: calculateBalance(acc.journalLines, "LIABILITY"),
      })).filter(a => a.balance !== 0),
      equity: equity.map(acc => ({
        code: acc.code,
        name: acc.name,
        balance: calculateBalance(acc.journalLines, "EQUITY"),
      })).filter(a => a.balance !== 0),
      totals: {
        assets: assetsTotal,
        liabilities: liabilitiesTotal,
        equity: equityTotal,
        balance: balanceTotal,
      },
    });
  } catch (error) {
    console.error("Error getting balance sheet:", error);
    return errorResponse("Error fetching balance sheet");
  }
}
