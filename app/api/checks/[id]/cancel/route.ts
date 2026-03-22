import { NextResponse } from "next/server";
import { unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

/**
 * Schema para cancelar un cheque
 */
const cancelCheckSchema = z.object({
  reason: z.string().min(1, "El motivo de cancelación es requerido"),
  returnFunds: z.boolean().optional().default(true), // Devolver fondos a la cuenta
});

/**
 * POST /api/checks/[id]/cancel
 * Cancela un cheque emitido
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
    
    const result = cancelCheckSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    // Verificar que el cheque existe
    const check = await prisma.check.findFirst({
      where: { id, organizationId },
      include: {
        bankAccount: {
          select: {
            id: true,
            name: true,
            bankName: true,
            accountNumber: true,
          },
        },
      },
    });

    if (!check) {
      return NextResponse.json({ error: "Cheque no encontrado" }, { status: 404 });
    }

    // Solo permitir cancelar cheques ISSUED o RECEIVED en estado PENDING
    if (check.status !== "PENDING") {
      return NextResponse.json(
        { error: "Este cheque ya fue depositado, cobrado o cancelado" },
        { status: 400 }
      );
    }

    // Iniciar transacción
    const updatedCheck = await prisma.$transaction(async (tx) => {
      // Actualizar estado del cheque
      const updated = await tx.check.update({
        where: { id },
        data: {
          status: "CANCELLED",
          notes: `${check.notes || ""}\nCancelado: ${result.data.reason}`,
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
        },
      });

      // Si es un cheque emitido y se solicita devolver fondos, actualizar saldo
      if (check.type === "ISSUED" && result.data.returnFunds) {
        await tx.bankAccount.update({
          where: { id: check.bankAccountId },
          data: {
            currentBalance: {
              increment: check.amount,
            },
          },
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: "Cheque cancelado exitosamente",
      check: {
        ...updatedCheck,
        amount: Number(updatedCheck.amount),
      },
      details: {
        type: check.type,
        returnedToAccount: check.type === "ISSUED" && result.data.returnFunds,
      },
    });
  } catch (error) {
    console.error("Cancel check error:", error);
    return errorResponse("Error cancelling check");
  }
}
