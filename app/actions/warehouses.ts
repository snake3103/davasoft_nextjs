"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logCreate, logUpdate, logDelete } from "@/lib/activity-log";

const warehouseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  address: z.string().optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

const transferSchema = z.object({
  productId: z.string().min(1),
  fromWarehouseId: z.string().min(1),
  toWarehouseId: z.string().min(1),
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
});

// --- WAREHOUSE CRUD ---

export async function createWarehouse(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawData = {
      name: formData.get("name") as string,
      address: formData.get("address") as string || undefined,
      isDefault: formData.get("isDefault") === "true",
      isActive: formData.get("isActive") !== "false",
    };

    const result = warehouseSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    // If setting as default, unset others
    if (result.data.isDefault) {
      await prisma.warehouse.updateMany({
        where: { 
          organizationId: session.user.organizationId,
          isDefault: true 
        },
        data: { isDefault: false }
      });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        ...result.data,
        organizationId: session.user.organizationId!,
      },
    });

    await logCreate({
      action: "warehouse.create",
      description: `Creó bodega "${warehouse.name}"`,
      module: "inventory",
      entityType: "Warehouse",
    });

    revalidatePath("/inventario/bodegas");
    return { success: true, warehouse };
  } catch (error: any) {
    console.error("Error creating warehouse:", error);
    if (error.code === "P2002") {
      return { error: "Ya existe una bodega con ese nombre" };
    }
    return { error: "Error interno al crear bodega" };
  }
}

export async function updateWarehouse(id: string, prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawData = {
      name: formData.get("name") as string,
      address: formData.get("address") as string || undefined,
      isDefault: formData.get("isDefault") === "true",
      isActive: formData.get("isActive") === "true",
    };

    const result = warehouseSchema.partial().safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const { isDefault } = result.data;

    // If setting as default, unset others
    if (isDefault === true) {
      await prisma.warehouse.updateMany({
        where: { 
          organizationId: session.user.organizationId,
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    await prisma.warehouse.update({
      where: { id },
      data: result.data,
    });

    revalidatePath("/inventario/bodegas");
    revalidatePath(`/inventario/bodegas/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating warehouse:", error);
    return { error: "Error interno al actualizar bodega" };
  }
}

export async function deleteWarehouse(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const warehouse = await prisma.warehouse.findFirst({
      where: { id, organizationId: session.user.organizationId },
      include: { _count: { select: { inventoryItems: true } } }
    });

    if (!warehouse) {
      return { error: "Bodega no encontrada" };
    }

    if (warehouse.isDefault) {
      return { error: "No se puede eliminar la bodega por defecto" };
    }

    if (warehouse._count.inventoryItems > 0) {
      return { error: "La bodega tiene inventario. Transfiéralo primero." };
    }

    await prisma.warehouse.delete({ where: { id } });

    await logDelete({
      action: "warehouse.delete",
      description: `Eliminó bodega "${warehouse.name}"`,
      module: "inventory",
      entityType: "Warehouse",
    });

    revalidatePath("/inventario/bodegas");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting warehouse:", error);
    return { error: "Error interno al eliminar bodega" };
  }
}

// --- INVENTORY TRANSFER ---

export async function transferInventory(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawData = {
      productId: formData.get("productId") as string,
      fromWarehouseId: formData.get("fromWarehouseId") as string,
      toWarehouseId: formData.get("toWarehouseId") as string,
      quantity: parseInt(formData.get("quantity") as string, 10),
      notes: formData.get("notes") as string || undefined,
    };

    const result = transferSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const { productId, fromWarehouseId, toWarehouseId, quantity } = result.data;

    if (fromWarehouseId === toWarehouseId) {
      return { error: "La bodega de origen y destino no pueden ser la misma" };
    }

    // Get inventory from source warehouse
    const sourceInventory = await prisma.inventoryWarehouse.findUnique({
      where: {
        productId_warehouseId: { productId, warehouseId: fromWarehouseId }
      }
    });

    const available = sourceInventory?.quantity ?? 0;
    if (available < quantity) {
      return { error: `Stock insuficiente. Disponible: ${available}` };
    }

    // Perform transfer
    await prisma.$transaction(async (tx) => {
      // Deduct from source
      await tx.inventoryWarehouse.upsert({
        where: { productId_warehouseId: { productId, warehouseId: fromWarehouseId } },
        create: { productId, warehouseId: fromWarehouseId, quantity: -quantity },
        update: { quantity: { decrement: quantity } }
      });

      // Add to destination
      await tx.inventoryWarehouse.upsert({
        where: { productId_warehouseId: { productId, warehouseId: toWarehouseId } },
        create: { productId, warehouseId: toWarehouseId, quantity },
        update: { quantity: { increment: quantity } }
      });
    });

    // Get warehouse names for logging
    const [fromWh, toWh] = await Promise.all([
      prisma.warehouse.findUnique({ where: { id: fromWarehouseId } }),
      prisma.warehouse.findUnique({ where: { id: toWarehouseId } })
    ]);

    await logCreate({
      action: "inventory.transfer",
      description: `Transferencia: ${quantity} unidades de "${fromWh?.name}" a "${toWh?.name}"`,
      module: "inventory",
      entityType: "InventoryWarehouse",
    });

    revalidatePath("/inventario");
    revalidatePath("/inventario/bodegas");
    return { success: true };
  } catch (error: any) {
    console.error("Error transferring inventory:", error);
    return { error: "Error interno al transferir inventario" };
  }
}

// --- GET WAREHOUSES (for client component) ---

export async function getWarehouses() {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return [];
    }

    const warehouses = await prisma.warehouse.findMany({
      where: { 
        organizationId: session.user.organizationId,
        isActive: true 
      },
      orderBy: [
        { isDefault: "desc" },
        { name: "asc" }
      ],
      include: {
        _count: { select: { inventoryItems: true } }
      }
    });

    return warehouses;
  } catch (error) {
    console.error("Error getting warehouses:", error);
    return [];
  }
}

// --- GET DEFAULT WAREHOUSE ---

export async function getDefaultWarehouse() {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return null;
    }

    const warehouse = await prisma.warehouse.findFirst({
      where: { 
        organizationId: session.user.organizationId,
        isDefault: true,
        isActive: true
      }
    });

    return warehouse;
  } catch (error) {
    console.error("Error getting default warehouse:", error);
    return null;
  }
}
