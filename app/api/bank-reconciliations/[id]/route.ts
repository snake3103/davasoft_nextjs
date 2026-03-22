import { NextResponse } from "next/server";
import { unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

/**
 * Schema para actualizar conciliación bancaria
 */
const updateReconciliationSchema = z.object({
  date: z.string().or(z.date()).transform(val => new Date(val)).optional(),
  initialBalance: z.coerce.number().optional(),
  finalBalance: z.coerce.number().optional(),
  statementTotal: z.coerce.number().optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
});

/**
 * GET /api/bank-reconciliations/[id]
 * Obtiene una conciliación bancaria específica con sus items
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;

    const reconciliation = await prisma.bankReconciliation.findFirst({
      where: { id, organizationId },
      include: {
        bankAccount: {
          select: {
            id: true,
            name: true,
            bankName: true,
            accountNumber: true,
            currency: true,
          },
        },
        items: {
          orderBy: { statementDate: "asc" },
          include: {
            // Aquí se podrían incluir datos de la transacción vinculada si existe
          },
        },
      },
    });

    if (!reconciliation) {
      return NextResponse.json({ error: "Conciliación no encontrada" }, { status: 404 });
    }

    // Calcular estadísticas de matching
    const totalItems = reconciliation.items.length;
    const matchedItems = reconciliation.items.filter(item => item.matched).length;
    const unmatchedItems = totalItems - matchedItems;
    
    const matchedAmount = reconciliation.items
      .filter(item => item.matched)
      .reduce((sum, item) => sum + Number(item.statementAmount), 0);
    
    const unmatchedAmount = reconciliation.items
      .filter(item => !item.matched)
      .reduce((sum, item) => sum + Number(item.statementAmount), 0);

    return NextResponse.json({
      ...reconciliation,
      stats: {
        totalItems,
        matchedItems,
        unmatchedItems,
        matchedAmount,
        unmatchedAmount,
      },
    });
  } catch (error) {
    console.error("Fetch bank reconciliation error:", error);
    return errorResponse("Error fetching bank reconciliation");
  }
}

/**
 * PATCH /api/bank-reconciliations/[id]
 * Actualiza una conciliación bancaria
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    const result = updateReconciliationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    // Verificar que la conciliación existe y pertenece a la organización
    const existing = await prisma.bankReconciliation.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Conciliación no encontrada" }, { status: 404 });
    }

    // No permitir cambios si ya está completada o cancelada
    if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
      return NextResponse.json(
        { error: "No se puede modificar una conciliación completada o cancelada" },
        { status: 400 }
      );
    }

    const updateData = result.data;

    // Recalcular totales si cambian
    let systemTotal = existing.systemTotal;
    let difference: number = Number(existing.difference);

    if (updateData.statementTotal !== undefined || updateData.finalBalance !== undefined) {
      const finalBalance = updateData.finalBalance ?? Number(existing.finalBalance);
      const statementTotal = updateData.statementTotal ?? Number(existing.statementTotal);
      difference = statementTotal - Number(systemTotal);
      
      updateData.initialBalance = updateData.initialBalance ?? Number(existing.initialBalance);
    }

    const reconciliation = await prisma.bankReconciliation.update({
      where: { id },
      data: {
        ...updateData,
        systemTotal: updateData.statementTotal !== undefined ? systemTotal : undefined,
        difference: updateData.statementTotal !== undefined ? difference : undefined,
      },
      include: {
        bankAccount: {
          select: {
            id: true,
            name: true,
            bankName: true,
            accountNumber: true,
          },
        },
        items: {
          orderBy: { statementDate: "asc" },
        },
      },
    });

    return NextResponse.json(reconciliation);
  } catch (error: any) {
    console.error("Update bank reconciliation error:", error);
    return errorResponse("Error updating bank reconciliation");
  }
}

/**
 * DELETE /api/bank-reconciliations/[id]
 * Elimina una conciliación bancaria (solo si está en draft)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;

    const reconciliation = await prisma.bankReconciliation.findFirst({
      where: { id, organizationId },
    });

    if (!reconciliation) {
      return NextResponse.json({ error: "Conciliación no encontrada" }, { status: 404 });
    }

    // Solo permitir eliminar si está en draft
    if (reconciliation.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Solo se pueden eliminar conciliaciones en estado draft" },
        { status: 400 }
      );
    }

    await prisma.bankReconciliation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Conciliación eliminada" });
  } catch (error) {
    console.error("Delete bank reconciliation error:", error);
    return errorResponse("Error deleting bank reconciliation");
  }
}
