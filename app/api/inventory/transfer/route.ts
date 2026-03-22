import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { logCreate } from "@/lib/activity-log";

const transferSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  fromWarehouseId: z.string().min(1, "Bodega de origen requerida"),
  toWarehouseId: z.string().min(1, "Bodega de destino requerida"),
  quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
  notes: z.string().optional(),
});

// POST /api/inventory/transfer - Transfer inventory between warehouses
export async function POST(request: Request) {
  const { db, organizationId, session } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = transferSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { productId, fromWarehouseId, toWarehouseId, quantity, notes } = result.data;

    // Cannot transfer to same warehouse
    if (fromWarehouseId === toWarehouseId) {
      return NextResponse.json({ 
        error: "La bodega de origen y destino no pueden ser la misma" 
      }, { status: 400 });
    }

    // Verify both warehouses exist and belong to organization
    const [fromWarehouse, toWarehouse] = await Promise.all([
      db.warehouse.findFirst({
        where: { id: fromWarehouseId, organizationId, isActive: true }
      }),
      db.warehouse.findFirst({
        where: { id: toWarehouseId, organizationId, isActive: true }
      })
    ]);

    if (!fromWarehouse) {
      return NextResponse.json({ error: "Bodega de origen no encontrada" }, { status: 404 });
    }

    if (!toWarehouse) {
      return NextResponse.json({ error: "Bodega de destino no encontrada" }, { status: 404 });
    }

    // Get or create inventory records
    const [fromInventory, toInventory] = await Promise.all([
      db.inventoryWarehouse.findUnique({
        where: { productId_warehouseId: { productId, warehouseId: fromWarehouseId } }
      }),
      db.inventoryWarehouse.findUnique({
        where: { productId_warehouseId: { productId, warehouseId: toWarehouseId } }
      })
    ]);

    const availableQuantity = fromInventory?.quantity ?? 0;

    if (availableQuantity < quantity) {
      return NextResponse.json({ 
        error: `Stock insuficiente. Disponible: ${availableQuantity}, Solicitado: ${quantity}` 
      }, { status: 400 });
    }

    // Perform transfer in transaction
    await prisma.$transaction(async (tx) => {
      // Deduct from source warehouse
      await tx.inventoryWarehouse.upsert({
        where: { productId_warehouseId: { productId, warehouseId: fromWarehouseId } },
        create: { productId, warehouseId: fromWarehouseId, quantity: -quantity },
        update: { quantity: { decrement: quantity } }
      });

      // Add to destination warehouse
      await tx.inventoryWarehouse.upsert({
        where: { productId_warehouseId: { productId, warehouseId: toWarehouseId } },
        create: { productId, warehouseId: toWarehouseId, quantity },
        update: { quantity: { increment: quantity } }
      });

      // Create movement records for audit
      await tx.inventoryMovement.create({
        data: {
          organizationId,
          productId,
          type: "TRANSFER_OUT",
          quantity,
          unitCost: 0,
          totalCost: 0,
          reference: `Transfer to ${toWarehouse.name}`,
          notes: notes || `Transferencia de inventario a ${toWarehouse.name}`,
          sourceType: "TRANSFER",
          sourceId: toWarehouseId
        }
      });

      await tx.inventoryMovement.create({
        data: {
          organizationId,
          productId,
          type: "TRANSFER_IN",
          quantity,
          unitCost: 0,
          totalCost: 0,
          reference: `Transfer from ${fromWarehouse.name}`,
          notes: notes || `Transferencia de inventario desde ${fromWarehouse.name}`,
          sourceType: "TRANSFER",
          sourceId: fromWarehouseId
        }
      });
    });

    // Get updated inventory
    const [updatedFrom, updatedTo] = await Promise.all([
      db.inventoryWarehouse.findUnique({
        where: { productId_warehouseId: { productId, warehouseId: fromWarehouseId } }
      }),
      db.inventoryWarehouse.findUnique({
        where: { productId_warehouseId: { productId, warehouseId: toWarehouseId } }
      })
    ]);

    // Log the activity
    await logCreate({
      action: "inventory.transfer",
      description: `Transferencia: ${quantity} unidades de ${fromWarehouse.name} a ${toWarehouse.name}`,
      module: "inventory",
      entityType: "InventoryWarehouse"
    });

    return NextResponse.json({
      success: true,
      transfer: {
        fromWarehouse: fromWarehouse.name,
        toWarehouse: toWarehouse.name,
        quantity,
        fromNewQuantity: updatedFrom?.quantity ?? 0,
        toNewQuantity: updatedTo?.quantity ?? 0
      }
    });
  } catch (error) {
    console.error("Transfer inventory error:", error);
    return errorResponse("Error al realizar transferencia");
  }
}

// GET /api/inventory/transfer - Get available stock for transfer
export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId es requerido" }, { status: 400 });
  }

  try {
    // Get stock in all warehouses for this product
    const inventory = await db.inventoryWarehouse.findMany({
      where: {
        productId,
        warehouse: { organizationId, isActive: true }
      },
      include: {
        warehouse: {
          select: { id: true, name: true, isDefault: true }
        }
      }
    });

    // Get total stock
    const totalStock = inventory.reduce((sum, inv) => sum + inv.quantity, 0);

    return NextResponse.json({
      productId,
      totalStock,
      byWarehouse: inventory.map(inv => ({
        warehouseId: inv.warehouseId,
        warehouseName: inv.warehouse.name,
        isDefault: inv.warehouse.isDefault,
        quantity: inv.quantity
      }))
    });
  } catch (error) {
    console.error("Get transfer stock error:", error);
    return errorResponse("Error al obtener stock para transferencia");
  }
}
