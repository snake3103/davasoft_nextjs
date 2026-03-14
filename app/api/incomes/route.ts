import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { incomeSchema } from "@/lib/schemas/income";
import { generateIncomeJournalEntry } from "@/app/actions/accounting";

export async function GET() {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const incomes = await db.income.findMany({
      where: { organizationId },
      include: { 
        client: true,
        category: true,
        bankAccount: true,
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(incomes);
  } catch (error) {
    console.error("Fetch incomes error:", error);
    return errorResponse("Error fetching incomes");
  }
}

export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    
    const result = incomeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { 
      number, 
      date, 
      description, 
      clientId, 
      categoryId, 
      amount, 
      paymentMethod, 
      reference, 
      status, 
      bankAccountId 
    } = result.data;

    const income = await db.income.create({
      data: {
        number,
        date: new Date(date),
        description,
        clientId: clientId || null,
        categoryId: categoryId || null,
        amount: Number(amount),
        paymentMethod: paymentMethod || "CASH",
        reference: reference || null,
        status: status || "RECEIVED",
        bankAccountId: bankAccountId || null,
        organizationId,
      },
      include: { client: true, category: true, bankAccount: true },
    });

    if (income.status === "RECEIVED") {
      try {
        await generateIncomeJournalEntry(income.id);
      } catch (journalError) {
        console.error("Error generating journal entry for income:", journalError);
      }
    }

    return NextResponse.json(income);
  } catch (error) {
    console.error("Create income error:", error);
    return errorResponse("Error creating income");
  }
}