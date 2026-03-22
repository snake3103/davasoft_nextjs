import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { expenseSchema } from "@/lib/schemas/expense";
import { generateExpenseJournalEntry } from "@/app/actions/accounting";
import { Decimal } from "decimal.js";

export async function GET() {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    // Mostrar todas las expenses (tanto EXPENSE como PURCHASE)
    // porque la página de compras muestra todas las facturas de compra
    const purchases = await db.expense.findMany({
      where: { 
        organizationId,
      },
      include: { category: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(purchases);
  } catch (error) {
    console.error("Fetch purchases error:", error);
    return errorResponse("Error fetching purchases");
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

    const { number, date, type, provider, categoryId, total, subtotal, taxId, taxName, taxRate, taxAmount, status, items } = result.data;

    const purchase = await db.$transaction(async (tx: any) => {
      const newPurchase = await tx.expense.create({
        data: {
          number,
          date: new Date(date),
          type: "PURCHASE",
          provider,
          categoryId,
          subtotal: Number(subtotal || total || 0),
          taxId: taxId || null,
          taxName: taxName || null,
          taxRate: taxRate ? Number(taxRate) : null,
          taxAmount: Number(taxAmount || 0),
          total: Number(total),
          status: status || "PAID",
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
                sourceId: newPurchase.id,
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

      return newPurchase;
    });

    if (purchase.status === "PAID") {
      try {
        await generateExpenseJournalEntry(purchase.id);
      } catch (journalError) {
        console.error("Error generating journal entry:", journalError);
      }
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Create purchase error:", error);
    return errorResponse("Error creating purchase");
  }
}