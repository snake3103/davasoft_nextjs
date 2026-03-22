import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { exchangeAdjustmentCalculateSchema } from "@/lib/schemas/exchange-adjustment";
import { Decimal } from "decimal.js";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * GET /api/exchange-adjustments
 * Lista los ajustes de cambio o genera preview
 */
export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period");
    const status = searchParams.get("status");

    const where: any = {};
    if (period) where.period = period;
    if (status) where.status = status;

    const adjustments = await db.exchangeRateAdjustment.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(
      adjustments.map(a => ({
        ...a,
        totalDebit: Number(a.totalDebit),
        totalCredit: Number(a.totalCredit),
        difference: Number(a.difference),
      }))
    );
  } catch (error) {
    console.error("Fetch exchange adjustments error:", error);
    return errorResponse("Error al obtener ajustes de cambio");
  }
}

/**
 * POST /api/exchange-adjustments/calculate
 * Calcula el ajuste de cambio para un período
 */
export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = exchangeAdjustmentCalculateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { period, exchangeRate } = result.data;

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

    // Obtener cuentas en moneda extranjera (cuentas por cobrar, por pagar, etc.)
    // Para esto necesitamos buscar en JournalLines con accounts en otra moneda
    // Assumiendo que tenemos una forma de identificar cuentas en moneda extranjera
    
    // Buscar movimientos en moneda extranjera del período
    // Esta es una implementación simplificada - en producción necesitarías
    // un modelo más complejo para manejar múltiples monedas
    
    const rate = new Decimal(exchangeRate);
    
    // Por ahora, retornamos la estructura para que el frontend
    // pueda hacer los cálculos y presentar el preview
    
    return NextResponse.json({
      period,
      exchangeRate: Number(rate.toFixed(4)),
      message: "Use POST a /api/exchange-adjustments para crear el ajuste",
      previewRequired: true,
    });
  } catch (error) {
    console.error("Calculate exchange adjustment error:", error);
    return errorResponse("Error al calcular ajuste de cambio");
  }
}
