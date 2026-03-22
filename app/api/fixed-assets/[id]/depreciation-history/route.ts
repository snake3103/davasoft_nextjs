import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/api-helpers";

/**
 * GET /api/fixed-assets/[id]/depreciation-history
 * Obtiene el historial de depreciación de un activo
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) return unauthorizedResponse();

  try {
    const asset = await prisma.fixedAsset.findFirst({
      where: { id, organizationId },
      include: {
        category: true,
        depreciations: {
          orderBy: { period: "desc" },
          include: {
            // journalEntry si existe
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Activo no encontrado" }, { status: 404 });
    }

    // Calcular depreciación proyectada futura
    const projections: any[] = [];
    const acquisitionCost = Number(asset.acquisitionCost);
    const salvageValue = Number(asset.salvageValue);
    const usefulLifeMonths = (asset.usefulLifeYears || 5) * 12;
    const usefulLifeYears = asset.usefulLifeYears || 5;
    
    const currentDate = new Date();
    const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    
    // Proyecciones para los próximos 12 meses o hasta fin de vida útil
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() + i);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      // Verificar si ya existe depreciación para este período
      const existingDep = asset.depreciations.find(d => d.period === period);
      if (existingDep) continue;
      
      // Calcular depreciación proyectada
      let periodDepreciation: number;
      
      switch (asset.depreciationMethod) {
        case "STRAIGHT_LINE":
          periodDepreciation = (acquisitionCost - salvageValue) / usefulLifeMonths;
          break;
        case "DECLINING_BALANCE":
          const rate = Number(asset.category.depreciationRate) / 100;
          // Suponer depreciación mensual
          periodDepreciation = Number(asset.currentValue) * rate / 12;
          break;
        case "SUM_OF_YEARS_DIGITS":
          const currentYear = date.getFullYear();
          const acquisitionYear = asset.acquisitionDate.getFullYear();
          const yearsRemaining = usefulLifeYears - (currentYear - acquisitionYear);
          const sumOfYears = (usefulLifeYears * (usefulLifeYears + 1)) / 2;
          periodDepreciation = (acquisitionCost - salvageValue) * Math.max(0, yearsRemaining) / sumOfYears / 12;
          break;
        default:
          periodDepreciation = (acquisitionCost - salvageValue) / usefulLifeMonths;
      }
      
      const accumulated = Number(asset.accumulatedDepreciation) + projections.reduce((sum, p) => sum + p.amount, 0) + periodDepreciation;
      const bookValue = acquisitionCost - accumulated;
      
      if (bookValue <= salvageValue) break;
      
      projections.push({
        period,
        date: date.toISOString(),
        amount: Math.round(periodDepreciation * 100) / 100,
        accumulated: Math.round(accumulated * 100) / 100,
        projected: true,
      });
    }

    return NextResponse.json({
      asset: {
        id: asset.id,
        code: asset.code,
        name: asset.name,
        acquisitionDate: asset.acquisitionDate,
        acquisitionCost: Number(asset.acquisitionCost),
        salvageValue: Number(asset.salvageValue),
        currentValue: Number(asset.currentValue),
        accumulatedDepreciation: Number(asset.accumulatedDepreciation),
        depreciationMethod: asset.depreciationMethod,
        usefulLifeYears: asset.usefulLifeYears,
      },
      history: asset.depreciations.map(d => ({
        id: d.id,
        period: d.period,
        date: d.date,
        amount: Number(d.amount),
        accumulated: Number(d.accumulated),
        hasJournalEntry: !!d.journalEntryId,
        notes: d.notes,
      })),
      projections,
    });
  } catch (error) {
    console.error("Fetch depreciation history error:", error);
    return errorResponse("Error al obtener historial de depreciación");
  }
}
