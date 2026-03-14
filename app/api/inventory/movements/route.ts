import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { inventoryMovementSchema } from "@/lib/schemas/product";
import { createInventoryMovement } from "@/app/actions/inventory";
import { Decimal } from "decimal.js";

export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const type = searchParams.get("type");

    const where: any = { organizationId };
    if (productId) where.productId = productId;
    if (type) where.type = type;

    const movements = await db.inventoryMovement.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error("Fetch inventory movements error:", error);
    return errorResponse("Error fetching movements");
  }
}

export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = inventoryMovementSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { productId, type, quantity, unitCost, reference, sourceType, sourceId, notes } = result.data;
    const totalCost = new Decimal(quantity).mul(unitCost);

    const product = await db.product.findFirst({
      where: { id: productId, organizationId },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 400 });
    }

    let newStock = product.stock;
    let isInput = ["PURCHASE", "ADJUSTMENT_IN", "RETURN_IN", "TRANSFER_IN"].includes(type);

    if (isInput) {
      newStock = product.stock + quantity;
    } else {
      newStock = product.stock - quantity;
      if (newStock < 0) {
        return NextResponse.json(
          { error: `Stock insuficiente. Stock actual: ${product.stock}` },
          { status: 400 }
        );
      }
    }

    const movement = await db.$transaction(async (tx: any) => {
      const newMovement = await tx.inventoryMovement.create({
        data: {
          organizationId,
          productId,
          type,
          quantity,
          unitCost,
          totalCost,
          reference,
          sourceType,
          sourceId,
          notes,
        },
      });

      await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      return newMovement;
    });

    return NextResponse.json(movement);
  } catch (error) {
    console.error("Inventory movement creation error:", error);
    return errorResponse("Error creating movement");
  }
}
