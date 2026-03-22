import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";

const warehouseUpdateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  address: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/warehouses/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  const { id } = await params;

  try {
    const warehouse = await db.warehouse.findFirst({
      where: { id, organizationId },
      include: {
        inventoryItems: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, stock: true }
            }
          }
        }
      }
    });

    if (!warehouse) {
      return NextResponse.json({ error: "Bodega no encontrada" }, { status: 404 });
    }

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error("Fetch warehouse error:", error);
    return errorResponse("Error al obtener bodega");
  }
}

// PATCH /api/warehouses/[id] - Update warehouse
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  const { id } = await params;

  try {
    const body = await request.json();
    const result = warehouseUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    // Check warehouse exists
    const existing = await db.warehouse.findFirst({
      where: { id, organizationId }
    });

    if (!existing) {
      return NextResponse.json({ error: "Bodega no encontrada" }, { status: 404 });
    }

    const { name, isDefault } = result.data;

    // If setting as default, unset other defaults first
    if (isDefault === true) {
      await db.warehouse.updateMany({
        where: { organizationId, isDefault: true, id: { not: id } },
        data: { isDefault: false }
      });
    }

    // If changing name, check for duplicates
    if (name && name !== existing.name) {
      const duplicate = await db.warehouse.findUnique({
        where: { organizationId_name: { organizationId, name } }
      });

      if (duplicate) {
        return NextResponse.json({ error: "Ya existe una bodega con ese nombre" }, { status: 400 });
      }
    }

    const warehouse = await db.warehouse.update({
      where: { id },
      data: result.data
    });

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error("Update warehouse error:", error);
    return errorResponse("Error al actualizar bodega");
  }
}

// DELETE /api/warehouses/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  const { id } = await params;

  try {
    const warehouse = await db.warehouse.findFirst({
      where: { id, organizationId },
      include: {
        _count: { select: { inventoryItems: true } }
      }
    });

    if (!warehouse) {
      return NextResponse.json({ error: "Bodega no encontrada" }, { status: 404 });
    }

    // Check if warehouse has inventory
    if (warehouse._count.inventoryItems > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar una bodega con inventario. Transfiera o elimine el inventario primero." 
      }, { status: 400 });
    }

    // Cannot delete default warehouse
    if (warehouse.isDefault) {
      return NextResponse.json({ 
        error: "No se puede eliminar la bodega por defecto. Asigne otra bodega como predeterminada primero." 
      }, { status: 400 });
    }

    await db.warehouse.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete warehouse error:", error);
    return errorResponse("Error al eliminar bodega");
  }
}
