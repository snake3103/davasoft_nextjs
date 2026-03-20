"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { inventoryMovementSchema } from "@/lib/schemas/product";
import { Decimal } from "decimal.js";
import { logCreate } from "@/lib/activity-log";

export async function createInventoryMovement(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawData = {
      productId: formData.get("productId") as string,
      type: formData.get("type") as any,
      quantity: Number(formData.get("quantity")),
      unitCost: Number(formData.get("unitCost") || 0),
      reference: formData.get("reference") as string || null,
      notes: formData.get("notes") as string || null,
    };

    const result = inventoryMovementSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const { productId, type, quantity, unitCost, reference, notes } = result.data;
    const totalCost = new Decimal(quantity).mul(unitCost);
    const organizationId = session.user.organizationId;

    const product = await prisma.product.findFirst({
      where: { id: productId, organizationId },
    });

    if (!product) {
      return { error: "Producto no encontrado" };
    }

    let newStock = product.stock;
    let isInput = ["PURCHASE", "ADJUSTMENT_IN", "RETURN_IN", "TRANSFER_IN"].includes(type);

    if (isInput) {
      newStock = product.stock + quantity;
    } else {
      newStock = product.stock - quantity;
      if (newStock < 0) {
        return { error: `Stock insuficiente. Stock actual: ${product.stock}` };
      }
    }

    const movement = await prisma.$transaction(async (tx: any) => {
      const newMovement = await tx.inventoryMovement.create({
        data: {
          organizationId,
          productId,
          type,
          quantity,
          unitCost,
          totalCost,
          reference,
          notes,
        },
      });

      await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      return newMovement;
    });

    await logCreate({
      action: "inventory.movement",
      description: `Registró movimiento de inventario: ${movement.type} - ${movement.quantity} unidades`,
      module: "inventory",
      entityType: "InventoryMovement",
      entityId: movement.id,
    });

    revalidatePath("/inventario");
    revalidatePath("/inventario/movimientos");
    return { success: true, movementId: movement.id };
  } catch (error: any) {
    console.error("Error creating inventory movement:", error);
    return { error: "Error interno del servidor al crear movimiento" };
  }
}

export async function getProductKardex(productId: string) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        productId,
        organizationId: session.user.organizationId,
      },
      orderBy: { createdAt: "asc" },
    });

    let runningStock = 0;
    let runningCost = new Decimal(0);
    
    const enrichedMovements = movements.map((m) => {
      const isInput = ["PURCHASE", "ADJUSTMENT_IN", "RETURN_IN", "TRANSFER_IN"].includes(m.type);
      
      if (isInput) {
        runningStock += m.quantity;
        runningCost = runningCost.add(m.totalCost);
      } else {
        runningStock -= m.quantity;
      }

      const avgCost = runningStock > 0 ? runningCost.div(runningStock) : new Decimal(0);

      return {
        ...m,
        runningStock,
        avgCost: avgCost.toNumber(),
        totalValue: avgCost.mul(runningStock).toNumber(),
      };
    });

    return { movements: enrichedMovements };
  } catch (error: any) {
    console.error("Error getting product kardex:", error);
    return { error: "Error al obtener kárdex" };
  }
}

export async function getInventoryValuation(organizationId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { organizationId },
      include: {
        movements: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const valuation = products.map((product) => {
      let totalQuantity = 0;
      let totalCost = new Decimal(0);

      const purchaseMovements = product.movements.filter((m) =>
        ["PURCHASE", "ADJUSTMENT_IN", "RETURN_IN"].includes(m.type)
      );
      const saleMovements = product.movements.filter((m) =>
        ["SALE", "ADJUSTMENT_OUT", "RETURN_OUT"].includes(m.type)
      );

      purchaseMovements.forEach((m) => {
        totalQuantity += m.quantity;
        totalCost = totalCost.add(m.totalCost);
      });

      saleMovements.forEach((m) => {
        totalQuantity -= m.quantity;
      });

      const avgCost = totalQuantity > 0 ? totalCost.div(totalQuantity) : new Decimal(0);
      const totalValue = avgCost.mul(totalQuantity);
      const needsRestock = product.minStock > 0 && totalQuantity <= product.minStock;

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        currentStock: totalQuantity,
        avgCost: avgCost.toNumber(),
        totalValue: totalValue.toNumber(),
        minStock: product.minStock,
        needsRestock,
      };
    });

    const totalInventoryValue = valuation.reduce((sum, v) => sum + v.totalValue, 0);
    const productsNeedingRestock = valuation.filter((v) => v.needsRestock).length;

    return {
      valuation,
      summary: {
        totalProducts: products.length,
        totalValue: totalInventoryValue,
        productsNeedingRestock,
      },
    };
  } catch (error: any) {
    console.error("Error getting inventory valuation:", error);
    return { error: "Error al obtener valoración de inventario" };
  }
}

export async function getLowStockProducts(organizationId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { 
        organizationId,
        minStock: { gt: 0 },
      },
    });

    const lowStock = products.filter((p) => p.stock <= p.minStock);

    return lowStock.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      minStock: p.minStock,
    }));
  } catch (error: any) {
    console.error("Error getting low stock products:", error);
    return [];
  }
}
