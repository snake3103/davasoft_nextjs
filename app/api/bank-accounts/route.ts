import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const bankAccountSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  bankName: z.string().min(1, "El nombre del banco es requerido"),
  accountNumber: z.string().min(1, "El número de cuenta es requerido"),
  accountType: z.enum(["CHECKING", "SAVINGS", "CASH", "CREDIT"]).default("CHECKING"),
  currency: z.string().default("DOP"),
  initialBalance: z.coerce.number().default(0),
  description: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(bankAccounts);
  } catch (error) {
    console.error("Fetch bank accounts error:", error);
    return errorResponse("Error fetching bank accounts");
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const result = bankAccountSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { name, bankName, accountNumber, accountType, currency, initialBalance, description } = result.data;

    const bankAccount = await prisma.bankAccount.create({
      data: {
        name,
        bankName,
        accountNumber,
        accountType,
        currency,
        initialBalance,
        currentBalance: initialBalance,
        description,
        organizationId,
      },
    });

    return NextResponse.json(bankAccount);
  } catch (error: any) {
    console.error("Create bank account error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Ya existe una cuenta con este número" }, { status: 400 });
    }
    return errorResponse("Error creating bank account");
  }
}
