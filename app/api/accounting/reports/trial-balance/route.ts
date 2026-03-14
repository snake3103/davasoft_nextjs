import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    // Obtener todas las cuentas con sus movimientos
    const accounts = await db.accountingAccount.findMany({
      where: { organizationId, isActive: true },
      include: {
        journalLines: true,
      },
      orderBy: { code: "asc" },
    });

    // Obtener todos los asientos publicados para filtrar
    const postedEntries = await db.journalEntry.findMany({
      where: { organizationId, status: "POSTED" },
      select: { id: true },
    });

    const postedEntryIds = new Set(postedEntries.map((e) => e.id));

    // Calcular el balance para cada cuenta (solo asientos publicados)
    const trialBalance = accounts.map((account) => {
      const relevantLines = account.journalLines.filter((line) =>
        postedEntryIds.has(line.entryId)
      );

      const totalDebit = relevantLines.reduce(
        (sum, line) => sum + Number(line.debit),
        0
      );
      const totalCredit = relevantLines.reduce(
        (sum, line) => sum + Number(line.credit),
        0
      );
      const balance = totalDebit - totalCredit;

      return {
        code: account.code,
        name: account.name,
        type: account.type,
        debit: totalDebit,
        credit: totalCredit,
        balance: balance > 0 ? balance : 0,
        balanceCredit: balance < 0 ? Math.abs(balance) : 0,
      };
    });

    const totalDebit = trialBalance.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredit = trialBalance.reduce((sum, acc) => sum + acc.credit, 0);

    return NextResponse.json({
      accounts: trialBalance,
      totalDebit,
      totalCredit,
      balanced: Math.abs(totalDebit - totalCredit) < 0.01,
    });
  } catch (error) {
    console.error("Error getting trial balance:", error);
    return errorResponse("Error fetching trial balance");
  }
}
