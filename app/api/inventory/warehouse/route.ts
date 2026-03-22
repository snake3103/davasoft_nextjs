import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";

const inventoryUpdateSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  quantity: z.number().int().nonnegative(),
  type: z.enum(["SET", "ADD", "SUBTRACT"]),
});

// PATCH /api/inventory/warehouse - Update inventory in specific warehouse
export async function PATCH(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = inventoryUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { productId, warehouseId, quantity, type } = result.data;

    // Verify warehouse belongs to organization
    const warehouse = await db.warehouse.findFirst({
      where: { id: warehouseId, organizationId, isActive: true }
    });

    if (!warehouse) {
      return NextResponse.json({ error: "Bodega no encontrada" }, { status: 404 });
    }

    // Verify product belongs to organization
    const product = await db.product.findFirst({
      where: { id: productId, organizationId }
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Calculate new quantity
    let newQuantity = quantity;

    if (type === "ADD" || type === "SUBTRACT") {
      const current = await db.inventoryWarehouse.findUnique({
        where: { productId_warehouseId: { productId, warehouseId } }
      });

      const currentQty = current?.quantity ?? 0;

      if (type === "ADD") {
        newQuantity = currentQty + quantity;
      } else {
        newQuantity = currentQty - quantity;
        if (newQuantity < 0) {
          return NextResponse.json({ 
            error: "Stock insuficiente para realizar la operación" 
          }, { status: 400 });
        }
      }
    }

    // Update inventory
    const inventory = await db.inventoryWarehouse.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      create: { productId, warehouseId, quantity: newQuantity },
      update: { quantity: newQuantity }
    });

    // Update total product stock
    const totalStock = await db.inventoryWarehouse.aggregate({
      where: { productId },
      _sum: { quantity: true }
    });

    await db.product.update({
      where: { id: productId },
      data: { stock: totalStock._sum.quantity ?? 0 }
    });

    return NextResponse.json({
      success: true,
      inventory: {
        productId,
        warehouseId,
        warehouseName: warehouse.name,
        quantity: inventory.quantity,
        totalProductStock: totalStock._sum.quantity ?? 0
      }
    });
  } catch (error) {
    console.error("Update warehouse inventory error:", error);
    return errorResponse("Error al actualizar inventario");
  }
}

// GET /api/inventory/warehouse - Get inventory by warehouse for all products
export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const warehouseId = searchParams.get("warehouseId");
  const productId = searchParams.get("productId");

  try {
    const whereClause: any = {
      warehouse: { organizationId, isActive: true }
    };

    if (warehouseId) {
      whereClause.warehouseId = warehouseId;
    }

    if (productId) {
      whereClause.productId = productId;
    }

    const inventory = await db.inventoryWarehouse.findMany({
      where: whereClause,
      include: {
        product: {
          select: { id: true, name: true, sku: true, price: true, stock: true }
        },
        warehouse: {
          select: { id: true, name: true, isDefault: true }
        }
      },
      orderBy: [
        { warehouse: { name: "asc" } },
        { product: { name: "asc" } }
      ]
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Get warehouse inventory error:", error);
    return errorResponse("Error al obtener inventario");
  }
}
