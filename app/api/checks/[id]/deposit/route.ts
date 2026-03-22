import { NextResponse } from "next/server";
import { unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

/**
 * Schema para depositar un cheque recibido
 */
const depositCheckSchema = z.object({
  depositDate: z.string().or(z.date()).transform(val => new Date(val)).optional(),
  notes: z.string().optional().nullable(),
  // Datos para crear el ingreso asociado (opcional)
  createIncome: z.boolean().optional().default(false),
  incomeDescription: z.string().optional(),
});

/**
 * POST /api/checks/[id]/deposit
 * Deposita un cheque recibido en el banco
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
    
    const result = depositCheckSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    // Verificar que el cheque existe y es de tipo RECEIVED
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

    if (check.type !== "RECEIVED") {
      return NextResponse.json({ 
        error: "Solo se pueden depositar cheques recibidos" 
      }, { status: 400 });
    }

    if (check.status !== "PENDING") {
      return NextResponse.json(
        { error: "Este cheque ya fue depositado, cobrado o cancelado" },
        { status: 400 }
      );
    }

    const depositDate = result.data.depositDate || new Date();

    // Iniciar transacción
    const updatedCheck = await prisma.$transaction(async (tx) => {
      // Actualizar estado del cheque
      const updated = await tx.check.update({
        where: { id },
        data: {
          status: "DEPOSITED",
          notes: result.data.notes 
            ? `${check.notes || ""}\nDepositado: ${result.data.notes}`
            : check.notes,
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

      // Si se solicita crear un ingreso, crearlo
      if (result.data.createIncome) {
        // Generar número de ingreso
        const lastIncome = await tx.income.findFirst({
          where: { organizationId },
          orderBy: { number: "desc" },
        });
        
        const lastNumber = lastIncome 
          ? parseInt(lastIncome.number.replace(/\D/g, "")) || 0 
          : 0;
        const newNumber = `ING-${String(lastNumber + 1).padStart(4, "0")}`;

        await tx.income.create({
          data: {
            organizationId,
            number: newNumber,
            date: depositDate,
            description: result.data.incomeDescription || `Depósito de cheque #${check.number}`,
            amount: check.amount,
            paymentMethod: "BANK_TRANSFER",
            reference: `Cheque #${check.number}`,
            status: "RECEIVED",
            bankAccountId: check.bankAccountId,
          },
        });

        // Actualizar saldo de la cuenta bancaria
        await tx.bankAccount.update({
          where: { id: check.bankAccountId },
          data: {
            currentBalance: {
              increment: check.amount,
            },
          },
        });

        // Actualizar el cheque con la referencia al ingreso
        await tx.check.update({
          where: { id },
          data: {
            notes: `${updated.notes}\nIngreso creado: ${newNumber}`,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: "Cheque depositado exitosamente",
      check: {
        ...updatedCheck,
        amount: Number(updatedCheck.amount),
      },
    });
  } catch (error) {
    console.error("Deposit check error:", error);
    return errorResponse("Error depositing check");
  }
}
