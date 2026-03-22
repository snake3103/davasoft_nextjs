import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/api-helpers";
import { exchangeAdjustmentCalculateSchema } from "@/lib/schemas/exchange-adjustment";
import { Decimal } from "decimal.js";

/**
 * POST /api/exchange-adjustments
 * Crea un ajuste de cambio con preview
 * 
 * Body: {
 *   period: "2026-01",
 *   date: "2026-01-31",
 *   entries: [
 *     { accountId: "...", description: "...", debit: 100, credit: 0 }
 *   ],
 *   notes: "Ajuste mensual por diferencia en cambio"
 * }
 */
export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { period, date, entries, notes } = body;

    if (!period || !entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: "Parámetros inválidos" },
        { status: 400 }
      );
    }

    // Verificar que no exista ya un ajuste para este período
    const existing = await prisma.exchangeRateAdjustment.findFirst({
      where: { organizationId, period, status: { in: ["DRAFT", "POSTED"] } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un ajuste para este período" },
        { status: 400 }
      );
    }

    // Calcular totales
    const totalDebit = entries.reduce((sum: number, e: any) => sum + (e.debit || 0), 0);
    const totalCredit = entries.reduce((sum: number, e: any) => sum + (e.credit || 0), 0);
    const difference = new Decimal(totalDebit).minus(totalCredit).abs();

    // Verificar que débitos = créditos
    if (new Decimal(totalDebit).minus(totalCredit).abs().greaterThan(0.01)) {
      return NextResponse.json(
        { error: "Los débitos y créditos no balancean", totalDebit, totalCredit, difference },
        { status: 400 }
      );
    }

    // Crear el ajuste y el asiento contable en una transacción
    const [adjustment, journalEntry] = await prisma.$transaction(async (tx) => {
      // Crear el registro de ajuste
      const newAdjustment = await tx.exchangeRateAdjustment.create({
        data: {
          organizationId,
          date: new Date(date),
          period,
          totalDebit,
          totalCredit,
          difference,
          status: "POSTED",
          notes,
        },
      });

      // Crear el asiento contable
      const newJournalEntry = await tx.journalEntry.create({
        data: {
          organizationId,
          date: new Date(date),
          description: `Ajuste por diferencia en cambio - ${period}`,
          sourceType: "EXCHANGE_ADJUSTMENT",
          sourceId: newAdjustment.id,
          reference: `ADC-${period}`,
          status: "POSTED",
          lines: {
            create: entries.map((entry: any) => ({
              accountId: entry.accountId,
              debit: entry.debit || 0,
              credit: entry.credit || 0,
              description: entry.description || "",
            })),
          },
        },
        include: {
          lines: {
            include: {
              account: true,
            },
          },
        },
      });

      // Actualizar el ajuste con el journalEntryId
      await tx.exchangeRateAdjustment.update({
        where: { id: newAdjustment.id },
        data: { journalEntryId: newJournalEntry.id },
      });

      return [newAdjustment, newJournalEntry];
    });

    return NextResponse.json({
      adjustment: {
        id: adjustment.id,
        period: adjustment.period,
        date: adjustment.date,
        status: adjustment.status,
        totalDebit: Number(adjustment.totalDebit),
        totalCredit: Number(adjustment.totalCredit),
        difference: Number(adjustment.difference),
      },
      journalEntry: {
        id: journalEntry.id,
        reference: journalEntry.reference,
        description: journalEntry.description,
        date: journalEntry.date,
        lines: journalEntry.lines.map(line => ({
          id: line.id,
          accountId: line.accountId,
          accountName: line.account.name,
          accountCode: line.account.code,
          debit: Number(line.debit),
          credit: Number(line.credit),
          description: line.description,
        })),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create exchange adjustment error:", error);
    return errorResponse("Error al crear ajuste de cambio");
  }
}
