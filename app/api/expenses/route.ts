import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { expenseSchema } from "@/lib/schemas/expense";

export async function GET() {
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  try {
    const expenses = await db.expense.findMany({
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
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = expenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { number, date, provider, categoryId, total, status, items } = result.data;

    const expense = await db.$transaction(async (tx: any) => {
      // 1. Create the expense
      const newExpense = await tx.expense.create({
        data: {
          number,
          date: new Date(date),
          provider,
          categoryId,
          total: Number(total),
          status: status || "PAID", // Purchases are usually paid or pending
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

      // 2. Adjust stock for each item that has a productId
      if (items && items.length > 0) {
        for (const item of items) {
          if (item.productId) {
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

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    return errorResponse("Error creating expense");
  }
}
