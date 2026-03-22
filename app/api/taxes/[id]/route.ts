import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";

const TaxUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  shortName: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  value: z.number().min(0).optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/taxes/[id] - Obtener un impuesto
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const tax = await db.tax.findFirst({
      where: { id, organizationId },
    });

    if (!tax) {
      return NextResponse.json({ error: "Impuesto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(tax);
  } catch (error) {
    console.error("Error fetching tax:", error);
    return errorResponse("Error al obtener impuesto");
  }
}

/**
 * PATCH /api/taxes/[id] - Actualizar un impuesto
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const data = TaxUpdateSchema.parse(body);

    // Verificar que existe y pertenece a la org
    const existing = await db.tax.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Impuesto no encontrado" }, { status: 404 });
    }

    // Si es default, quitar default de otros
    if (data.isDefault === true) {
      await db.tax.updateMany({
        where: { organizationId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const tax = await db.tax.update({
      where: { id },
      data,
    });

    return NextResponse.json(tax);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error updating tax:", error);
    return errorResponse("Error al actualizar impuesto");
  }
}

/**
 * DELETE /api/taxes/[id] - Eliminar un impuesto
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    // Verificar que existe y pertenece a la org
    const existing = await db.tax.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Impuesto no encontrado" }, { status: 404 });
    }

    await db.tax.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tax:", error);
    return errorResponse("Error al eliminar impuesto");
  }
}
