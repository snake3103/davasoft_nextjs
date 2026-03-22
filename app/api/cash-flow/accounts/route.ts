import { NextResponse } from "next/server";
import { unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/cash-flow/accounts
 * Lista las cuentas bancarias disponibles para flujo de caja
 */
export async function GET() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const accounts = await prisma.bankAccount.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        bankName: true,
        accountNumber: true,
        currency: true,
        currentBalance: true,
      },
      orderBy: { name: "asc" },
    });

    const accountsWithBalance = accounts.map((account) => ({
      id: account.id,
      name: account.name,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      currency: account.currency,
      currentBalance: Number(account.currentBalance),
    }));

    return NextResponse.json(accountsWithBalance);
  } catch (error) {
    console.error("Cash flow accounts error:", error);
    return errorResponse("Error fetching cash flow accounts");
  }
}
