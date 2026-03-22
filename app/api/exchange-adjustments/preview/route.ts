import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/api-helpers";
import { Decimal } from "decimal.js";

/**
 * POST /api/exchange-adjustments/preview
 * Genera preview del ajuste de cambio basándose en cuentas en moneda extranjera
 * 
 * Body: {
 *   period: "2026-01",  // Período a ajustar (formato YYYY-MM)
 *   previousRate: 58.50,  // Tasa de cambio anterior
 *   currentRate: 60.25,   // Tasa de cambio actual
 * }
 * 
 * Este preview busca saldos en cuentas de moneda extranjera y calcula
 * la diferencia a ajustar.
 */
export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { period, previousRate, currentRate } = body;

    if (!period || !previousRate || !currentRate) {
      return NextResponse.json(
        { error: "Se requiere period, previousRate y currentRate" },
        { status: 400 }
      );
    }

    const prevRate = new Decimal(previousRate);
    const currRate = new Decimal(currentRate);
    const rateDifference = currRate.minus(prevRate);
    const rateChangePercent = rateDifference.div(prevRate).times(100);

    // Buscar cuentas que típicamente usan moneda extranjera
    // En un sistema real, tendrías un campo isForeignCurrency en AccountingAccount
    // Por ahora, buscamos cuentas de tipo ACTIVO y PASIVO (típicamente clientes y proveedores en $)
    
    const foreignAccounts = await prisma.accountingAccount.findMany({
      where: {
        organizationId,
        isActive: true,
        type: { in: ["ASSET", "LIABILITY"] },
        // En producción, filtrar por isForeignCurrency: true
      },
      include: {
        journalLines: {
          where: {
            // Últimos movimientos para calcular saldo
            entry: {
              date: {
                lte: new Date(`${period}-31`), // Hasta fin del período
              },
            },
          },
          include: {
            entry: true,
          },
          orderBy: {
            entry: {
              date: "desc",
            },
          },
        },
      },
    });

    const adjustments: any[] = [];
    
    for (const account of foreignAccounts) {
      if (account.journalLines.length === 0) continue;

      // Calcular saldo en moneda local basado en las líneas
      let totalDebit = new Decimal(0);
      let totalCredit = new Decimal(0);

      for (const line of account.journalLines) {
        totalDebit = totalDebit.plus(line.debit);
        totalCredit = totalCredit.plus(line.credit);
      }

      const currentBalance = totalDebit.minus(totalCredit);
      
      if (currentBalance.abs().isZero()) continue;

      // Calcular ajuste necesario
      // Si la moneda se apreció (rate subió), las cuentas en moneda extranjera
      // en pesos deben ajustar según la diferencia
      // Esta es una simplificación - en realidad necesitarías el monto en USD
      const adjustmentAmount = currentBalance.times(rateDifference).div(currRate);
      
      if (adjustmentAmount.abs().lessThan(0.01)) continue;

      const isDebitAdjustment = adjustmentAmount.greaterThan(0);

      adjustments.push({
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        currentBalance: Number(currentBalance.toFixed(2)),
        adjustmentAmount: Number(adjustmentAmount.toDecimalPlaces(2).toFixed(2)),
        type: isDebitAdjustment ? "DEBIT" : "CREDIT",
        description: `${account.name} - Diferencia en cambio ${period}`,
      });
    }

    // Agrupar débitos y créditos
    const totalDebits = adjustments
      .filter(a => a.type === "DEBIT")
      .reduce((sum, a) => sum + a.adjustmentAmount, 0);
    
    const totalCredits = adjustments
      .filter(a => a.type === "CREDIT")
      .reduce((sum, a) => sum + a.adjustmentAmount, 0);

    // Crear líneas de asiento para balancear
    const entries = adjustments.map(a => ({
      accountId: a.accountId,
      description: a.description,
      debit: a.type === "DEBIT" ? a.adjustmentAmount : 0,
      credit: a.type === "CREDIT" ? a.adjustmentAmount : 0,
    }));

    // Si no balancea, agregar cuenta de diferencia cambiaria
    const difference = new Decimal(totalDebits).minus(totalCredits);
    if (difference.abs().greaterThan(0.01)) {
      entries.push({
        accountId: "", // Cuenta de diferencia cambiaria (configurable)
        description: `Diferencia redondeo ${period}`,
        debit: difference.greaterThan(0) ? Number(difference.toFixed(2)) : 0,
        credit: difference.lessThan(0) ? Number(difference.abs().toFixed(2)) : 0,
      });
    }

    return NextResponse.json({
      period,
      exchangeRateInfo: {
        previousRate: Number(prevRate.toFixed(4)),
        currentRate: Number(currRate.toFixed(4)),
        difference: Number(rateDifference.toFixed(4)),
        changePercent: Number(rateChangePercent.toFixed(2)),
      },
      accountsAffected: adjustments.length,
      entries,
      summary: {
        totalDebits: Number(
          adjustments
            .filter(a => a.type === "DEBIT")
            .reduce((sum, a) => sum + a.adjustmentAmount, 0)
            .toFixed(2)
        ),
        totalCredits: Number(
          adjustments
            .filter(a => a.type === "CREDIT")
            .reduce((sum, a) => sum + a.adjustmentAmount, 0)
            .toFixed(2)
        ),
      },
      accounts: adjustments,
    });
  } catch (error) {
    console.error("Preview exchange adjustment error:", error);
    return errorResponse("Error al generar preview de ajuste de cambio");
  }
}
