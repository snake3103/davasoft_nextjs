import { NextResponse } from "next/server";
import { unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

/**
 * Schema para vincular item con transacción
 */
const matchItemSchema = z.object({
  itemId: z.string().min(1, "El ID del item es requerido"),
  transactionId: z.string().min(1, "El ID de la transacción es requerido"),
  transactionType: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  systemAmount: z.coerce.number(),
});

/**
 * POST /api/bank-reconciliations/[id]/match
 * Vincula un item de conciliación con una transacción del sistema
 */
export async function POST(
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
    
    const result = matchItemSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { itemId, transactionId, transactionType, systemAmount } = result.data;

    // Verificar que la conciliación existe y pertenece a la organización
    const reconciliation = await prisma.bankReconciliation.findFirst({
      where: { id, organizationId },
    });

    if (!reconciliation) {
      return NextResponse.json({ error: "Conciliación no encontrada" }, { status: 404 });
    }

    // No permitir cambios si ya está completada o cancelada
    if (reconciliation.status === "COMPLETED" || reconciliation.status === "CANCELLED") {
      return NextResponse.json(
        { error: "No se puede modificar una conciliación completada o cancelada" },
        { status: 400 }
      );
    }

    // Verificar que el item existe y pertenece a esta conciliación
    const item = await prisma.reconciliationItem.findFirst({
      where: { id: itemId, reconciliationId: id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item de conciliación no encontrado" }, { status: 404 });
    }

    // Verificar que la transacción existe (buscar en incomes)
    if (transactionType === "INCOME") {
      const income = await prisma.income.findFirst({
        where: { id: transactionId, organizationId },
      });
      if (!income) {
        return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
      }
    }

    // Actualizar el item con la información de matching
    const updatedItem = await prisma.reconciliationItem.update({
      where: { id: itemId },
      data: {
        transactionId,
        transactionType,
        systemAmount,
        matched: true,
        matchDate: new Date(),
      },
    });

    // Actualizar el estado de la conciliación a IN_PROGRESS si estaba en DRAFT
    if (reconciliation.status === "DRAFT") {
      await prisma.bankReconciliation.update({
        where: { id },
        data: { status: "IN_PROGRESS" },
      });
    }

    // Recalcular la diferencia de la conciliación
    const allItems = await prisma.reconciliationItem.findMany({
      where: { reconciliationId: id },
    });

    const matchedAmount = allItems
      .filter(i => i.matched)
      .reduce((sum, i) => sum + Number(i.statementAmount), 0);

    const unmatchedCount = allItems.filter(i => !i.matched).length;

    // Actualizar totales de la conciliación
    const newDifference = Number(reconciliation.statementTotal) - matchedAmount;

    await prisma.bankReconciliation.update({
      where: { id },
      data: {
        systemTotal: matchedAmount,
        difference: newDifference,
      },
    });

    return NextResponse.json({
      item: updatedItem,
      reconciliationStats: {
        totalItems: allItems.length,
        matchedItems: allItems.filter(i => i.matched).length,
        unmatchedItems: unmatchedCount,
        difference: newDifference,
      },
    });
  } catch (error) {
    console.error("Match reconciliation item error:", error);
    return errorResponse("Error matching reconciliation item");
  }
}
