import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";

const updateCostCenterSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/cost-centers/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  const { id } = await params;

  try {
    const costCenter = await db.costCenter.findFirst({
      where: { id, organizationId },
      include: {
        invoices: {
          orderBy: { date: "desc" },
          take: 10,
          select: { id: true, number: true, date: true, total: true, status: true }
        },
        expenses: {
          orderBy: { date: "desc" },
          take: 10,
          select: { id: true, number: true, date: true, total: true, status: true }
        },
        incomes: {
          orderBy: { date: "desc" },
          take: 10,
          select: { id: true, number: true, date: true, amount: true, status: true }
        },
        _count: {
          select: { invoices: true, expenses: true, incomes: true }
        }
      }
    });

    if (!costCenter) {
      return NextResponse.json({ error: "Centro de costo no encontrado" }, { status: 404 });
    }

    return NextResponse.json(costCenter);
  } catch (error) {
    console.error("Fetch cost center error:", error);
    return errorResponse("Error al obtener centro de costo");
  }
}

// PATCH /api/cost-centers/[id] - Update cost center
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  const { id } = await params;

  try {
    const body = await request.json();
    const result = updateCostCenterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    // Check cost center exists
    const existing = await db.costCenter.findFirst({
      where: { id, organizationId }
    });

    if (!existing) {
      return NextResponse.json({ error: "Centro de costo no encontrado" }, { status: 404 });
    }

    // If changing code, check for duplicates
    if (result.data.code && result.data.code !== existing.code) {
      const duplicate = await db.costCenter.findUnique({
        where: { organizationId_code: { organizationId, code: result.data.code! } }
      });

      if (duplicate) {
        return NextResponse.json({ error: "Ya existe un centro de costo con ese código" }, { status: 400 });
      }
    }

    const costCenter = await db.costCenter.update({
      where: { id },
      data: result.data
    });

    return NextResponse.json(costCenter);
  } catch (error) {
    console.error("Update cost center error:", error);
    return errorResponse("Error al actualizar centro de costo");
  }
}

// DELETE /api/cost-centers/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  const { id } = await params;

  try {
    const costCenter = await db.costCenter.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { invoices: true, expenses: true, incomes: true }
        }
      }
    });

    if (!costCenter) {
      return NextResponse.json({ error: "Centro de costo no encontrado" }, { status: 404 });
    }

    const totalDocs = costCenter._count.invoices + costCenter._count.expenses + costCenter._count.incomes;

    if (totalDocs > 0) {
      return NextResponse.json({ 
        error: `No se puede eliminar. El centro de costo tiene ${totalDocs} documentos asociados. Elimine o reasigne los documentos primero.` 
      }, { status: 400 });
    }

    await db.costCenter.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete cost center error:", error);
    return errorResponse("Error al eliminar centro de costo");
  }
}
