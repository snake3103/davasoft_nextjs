import { NextResponse } from "next/server";
import { unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

/**
 * Schema para confirmar import
 */
const confirmImportSchema = z.object({
  date: z.string().or(z.date()).transform(val => new Date(val)),
  initialBalance: z.coerce.number(),
  finalBalance: z.coerce.number(),
  statementTotal: z.coerce.number(),
  notes: z.string().optional(),
  // IDs de transacciones a importar (null = importar todas)
  transactionIndexes: z.array(z.number()).optional(),
});

/**
 * POST /api/bank-statements/[id]/confirm
 * Confirma la importación y crea la conciliación bancaria
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
    
    // Validar input
    const result = confirmImportSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    // Obtener el registro de import
    const importRecord = await prisma.bankStatementImport.findFirst({
      where: { id, organizationId },
    });

    if (!importRecord) {
      return NextResponse.json({ error: "Import no encontrado" }, { status: 404 });
    }

    if (importRecord.status !== "PENDING") {
      return NextResponse.json({ 
        error: "Este import ya fue confirmado o procesado" 
      }, { status: 400 });
    }

    const { date, initialBalance, finalBalance, statementTotal, notes, transactionIndexes } = result.data;

    // Parsear las transacciones del preview
    let transactions: any[] = [];
    if (importRecord.previewData) {
      transactions = JSON.parse(importRecord.previewData);
    }

    // Filtrar transacciones si se especificaron índices
    const filteredTransactions = transactionIndexes && transactionIndexes.length > 0
      ? transactionIndexes.map(idx => transactions[idx]).filter(Boolean)
      : transactions;

    if (filteredTransactions.length === 0) {
      return NextResponse.json({ 
        error: "No hay transacciones para importar" 
      }, { status: 400 });
    }

    // Calcular el total del extracto
    const calcStatementTotal = filteredTransactions.reduce(
      (sum: number, t: any) => sum + (t.amount > 0 ? t.amount : 0),
      0
    );
    const calcTotalDebits = filteredTransactions.reduce(
      (sum: number, t: any) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0),
      0
    );

    // Iniciar transacción
    const reconciliation = await prisma.$transaction(async (tx) => {
      // Actualizar estado del import
      await tx.bankStatementImport.update({
        where: { id },
        data: { status: "PROCESSING" },
      });

      // Calcular totales del sistema
      // Buscar ingresos que coincidan con el rango de fechas
      const incomes = await tx.income.findMany({
        where: {
          organizationId,
          bankAccountId: importRecord.bankAccountId,
          date: {
            gte: date,
            lte: new Date(date.getTime() + 31 * 24 * 60 * 60 * 1000), // ~1 mes
          },
          status: "RECEIVED",
        },
      });

      const systemTotal = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
      const difference = statementTotal - systemTotal;

      // Crear la conciliación
      const newReconciliation = await tx.bankReconciliation.create({
        data: {
          organizationId,
          bankAccountId: importRecord.bankAccountId,
          date,
          initialBalance,
          finalBalance,
          statementTotal,
          systemTotal,
          difference,
          notes: notes || `Importado desde: ${importRecord.filename}`,
          status: "DRAFT",
        },
      });

      // Crear los items de conciliación
      const itemsData = filteredTransactions.map((t: any) => ({
        reconciliationId: newReconciliation.id,
        description: t.description || "",
        reference: t.reference || null,
        statementDate: new Date(t.date),
        statementAmount: t.amount,
      }));

      await tx.reconciliationItem.createMany({
        data: itemsData,
      });

      // Actualizar estado del import a completado
      await tx.bankStatementImport.update({
        where: { id },
        data: { 
          status: "COMPLETED",
          transactions: filteredTransactions.length,
        },
      });

      return newReconciliation;
    });

    // Obtener la conciliación completa con sus items
    const reconciliationWithItems = await prisma.bankReconciliation.findUnique({
      where: { id: reconciliation.id },
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

    return NextResponse.json({
      success: true,
      message: "Importación confirmada y conciliación creada",
      reconciliation: reconciliationWithItems,
      summary: {
        transactionsImported: filteredTransactions.length,
        statementTotal,
        systemTotal: reconciliation.systemTotal,
        difference: reconciliation.difference,
      },
    });

  } catch (error: any) {
    console.error("Confirm import error:", error);
    return errorResponse("Error al confirmar la importación");
  }
}
