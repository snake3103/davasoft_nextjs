import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { expenseSchema } from "@/lib/schemas/expense";
import { generateExpenseJournalEntry } from "@/app/actions/accounting";
import { Decimal } from "decimal.js";

export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "EXPENSE", "PURCHASE", or null for all
    
    const whereClause: any = { organizationId };
    if (type) {
      whereClause.type = type;
    }
    // Si no hay tipo, muestra todos (EXPENSE y PURCHASE)
    
    const expenses = await db.expense.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Fetch expenses error:", error);
    return errorResponse("Error fetching expenses");
  }
}

export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) {
    console.error("No database or organizationId:", { db: !!db, organizationId });
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    console.log("Expense request body:", body);
    
    const result = expenseSchema.safeParse(body);

    if (!result.success) {
      console.error("Expense validation failed:", result.error.flatten());
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { number, date, type, provider, categoryId, total, subtotal, taxId, taxName, taxRate, taxAmount, status, items } = result.data;
    console.log("Creating expense with status:", status);

    const expense = await db.$transaction(async (tx: any) => {
      // 1. Create the expense
      const newExpense = await tx.expense.create({
        data: {
          number,
          date: new Date(date),
          type: type || "EXPENSE", // Default to EXPENSE for regular expenses
          provider,
          categoryId,
          subtotal: Number(subtotal || total || 0),
          taxId: taxId || null,
          taxName: taxName || null,
          taxRate: taxRate ? Number(taxRate) : null,
          taxAmount: Number(taxAmount || 0),
          total: Number(total),
          status: status || "PENDING", // Regular expenses are usually pending
          organizationId,
          items: items ? {
            create: items.map((item: any) => ({
              productId: item.productId || null,
              description: item.description,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            })),
          } : undefined,
        },
        include: { items: true, category: true },
      });

      console.log("Expense created:", newExpense.id, "status:", newExpense.status);

      // 2. Adjust stock for each item that has a productId and create inventory movement
      if (items && items.length > 0) {
        for (const item of items) {
          if (item.productId) {
            const unitCost = Number(item.price) || 0;
            const totalCost = new Decimal(item.quantity).mul(unitCost);
            
            await tx.inventoryMovement.create({
              data: {
                organizationId,
                productId: item.productId,
                type: "PURCHASE",
                quantity: item.quantity,
                unitCost,
                totalCost,
                reference: number,
                sourceType: "EXPENSE",
                sourceId: newExpense.id,
              },
            });

            await tx.product.update({
              where: { id: item.productId, organizationId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }
      }

      return newExpense;
    });

    // 3. Generate journal entry automatically if expense is paid
    console.log("Checking if should generate journal entry. Status:", expense.status, "Is PAID?", expense.status === "PAID");
    
    if (expense.status === "PAID") {
      try {
        console.log("Attempting to generate journal entry for expense:", expense.id);
        const journalResult = await generateExpenseJournalEntry(expense.id);
        console.log("Journal entry result:", journalResult);
        
        if (journalResult.error) {
          console.error("Error generating journal entry:", journalResult.error);
        } else {
          console.log("Journal entry created successfully:", journalResult.journalEntryId);
        }
      } catch (journalError) {
        console.error("Exception generating journal entry:", journalError);
        // No fallar la creación de la factura, solo loguear el error contable
      }
    } else {
      console.log("Expense not PAID, skipping journal entry generation");
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    return errorResponse("Error creating expense");
  }
}
