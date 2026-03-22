import { NextResponse } from "next/server";
import { unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * POST /api/bank-reconciliations/[id]/complete
 * Finaliza/completa una conciliación bancaria
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

    // Verificar que la conciliación existe y pertenece a la organización
    const reconciliation = await prisma.bankReconciliation.findFirst({
      where: { id, organizationId },
      include: {
        items: true,
      },
    });

    if (!reconciliation) {
      return NextResponse.json({ error: "Conciliación no encontrada" }, { status: 404 });
    }

    // No permitir si ya está completada o cancelada
    if (reconciliation.status === "COMPLETED" || reconciliation.status === "CANCELLED") {
      return NextResponse.json(
        { error: "La conciliación ya está completada o cancelada" },
        { status: 400 }
      );
    }

    // Validaciones antes de completar
    const body = await request.json().catch(() => ({}));
    const forceComplete = body.force === true;

    const unmatchedItems = reconciliation.items.filter(item => !item.matched);
    const hasUnmatched = unmatchedItems.length > 0;

    // Si hay items sin conciliar y no se fuerza el cierre, devolver error
    if (hasUnmatched && !forceComplete) {
      const unmatchedAmount = unmatchedItems.reduce(
        (sum, item) => sum + Number(item.statementAmount),
        0
      );

      return NextResponse.json({
        error: "Hay transacciones sin conciliar",
        warning: true,
        details: {
          unmatchedItems: unmatchedItems.length,
          unmatchedAmount,
          items: unmatchedItems.map(item => ({
            id: item.id,
            description: item.description,
            amount: item.statementAmount,
            date: item.statementDate,
          })),
        },
      }, { status: 400 });
    }

    // Verificar si hay diferencia significativa
    const difference = Number(reconciliation.difference);
    const hasSignificantDifference = Math.abs(difference) > 0.01; // Tolerancia de 1 centavo

    if (hasSignificantDifference && !forceComplete) {
      return NextResponse.json({
        error: "Existe una diferencia entre el saldo del banco y el sistema",
        warning: true,
        details: {
          statementTotal: reconciliation.statementTotal,
          systemTotal: reconciliation.systemTotal,
          difference,
        },
      }, { status: 400 });
    }

    // Completar la conciliación
    const completedReconciliation = await prisma.bankReconciliation.update({
      where: { id },
      data: {
        status: "COMPLETED",
        finalBalance: reconciliation.finalBalance,
      },
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
        },
      },
    });

    // Aquí se podría agregar lógica adicional como:
    // - Crear registros contables de ajuste si hay diferencias
    // - Actualizar saldos de cuentas bancarias
    // - Enviar notificaciones

    return NextResponse.json({
      success: true,
      message: "Conciliación completada exitosamente",
      reconciliation: completedReconciliation,
      summary: {
        totalItems: reconciliation.items.length,
        matchedItems: reconciliation.items.filter(i => i.matched).length,
        unmatchedItems: unmatchedItems.length,
        statementTotal: reconciliation.statementTotal,
        systemTotal: reconciliation.systemTotal,
        difference,
      },
    });
  } catch (error) {
    console.error("Complete bank reconciliation error:", error);
    return errorResponse("Error completing bank reconciliation");
  }
}
