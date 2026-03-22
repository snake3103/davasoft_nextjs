import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/api-helpers";

/**
 * GET /api/fixed-assets/report
 * Genera reporte de activos fijos
 */
export async function GET(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "summary"; // summary, detailed, depreciation
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const asOfDate = searchParams.get("asOfDate");

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const assets = await prisma.fixedAsset.findMany({
      where,
      include: {
        category: true,
        depreciations: {
          orderBy: { period: "desc" },
        },
      },
      orderBy: [{ category: { name: "asc" } }, { code: "asc" }],
    });

    // Calcular totales
    let totalAcquisitionCost = 0;
    let totalCurrentValue = 0;
    let totalAccumulatedDepreciation = 0;

    const assetsWithCalculations = assets.map(asset => {
      const acquisitionCost = Number(asset.acquisitionCost);
      const currentValue = Number(asset.currentValue);
      const accumulatedDepreciation = Number(asset.accumulatedDepreciation);
      const salvageValue = Number(asset.salvageValue);

      totalAcquisitionCost += acquisitionCost;
      totalCurrentValue += currentValue;
      totalAccumulatedDepreciation += accumulatedDepreciation;

      // Calcular depreciación del período seleccionado (si aplica)
      let periodDepreciation = 0;
      if (asOfDate) {
        const asOf = new Date(asOfDate);
        const period = `${asOf.getFullYear()}-${String(asOf.getMonth() + 1).padStart(2, "0")}`;
        const dep = asset.depreciations.find(d => d.period === period);
        if (dep) periodDepreciation = Number(dep.amount);
      }

      return {
        id: asset.id,
        code: asset.code,
        name: asset.name,
        description: asset.description,
        category: {
          id: asset.category.id,
          name: asset.category.name,
          code: asset.category.code,
        },
        status: asset.status,
        location: asset.location,
        acquisitionDate: asset.acquisitionDate,
        acquisitionCost,
        salvageValue,
        usefulLifeYears: asset.usefulLifeYears,
        depreciationMethod: asset.depreciationMethod,
        currentValue,
        accumulatedDepreciation,
        depreciationRate: Number(asset.category.depreciationRate),
        percentageDepreciated: acquisitionCost > 0 
          ? Math.round((accumulatedDepreciation / acquisitionCost) * 10000) / 100 
          : 0,
        lastDepreciation: asset.depreciations[0] 
          ? { period: asset.depreciations[0].period, amount: Number(asset.depreciations[0].amount) }
          : null,
        periodDepreciation,
        yearsInService: Math.floor(
          (new Date().getTime() - new Date(asset.acquisitionDate).getTime()) 
          / (365.25 * 24 * 60 * 60 * 1000)
        ),
      };
    });

    // Agrupar por categoría
    const byCategory = assetsWithCalculations.reduce((acc, asset) => {
      const catName = asset.category.name;
      if (!acc[catName]) {
        acc[catName] = {
          category: asset.category,
          assets: [],
          totals: {
            acquisitionCost: 0,
            currentValue: 0,
            accumulatedDepreciation: 0,
          },
        };
      }
      acc[catName].assets.push(asset);
      acc[catName].totals.acquisitionCost += asset.acquisitionCost;
      acc[catName].totals.currentValue += asset.currentValue;
      acc[catName].totals.accumulatedDepreciation += asset.accumulatedDepreciation;
      return acc;
    }, {} as Record<string, any>);

    // Agrupar por estado
    const byStatus = assetsWithCalculations.reduce((acc, asset) => {
      if (!acc[asset.status]) {
        acc[asset.status] = {
          count: 0,
          acquisitionCost: 0,
          currentValue: 0,
        };
      }
      acc[asset.status].count++;
      acc[asset.status].acquisitionCost += asset.acquisitionCost;
      acc[asset.status].currentValue += asset.currentValue;
      return acc;
    }, {} as Record<string, any>);

    // Depreciación por período (últimos 12 meses)
    const depreciationByPeriod: Record<string, number> = {};
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const allDepreciations = await prisma.assetDepreciation.findMany({
      where: {
        organizationId,
        period: {
          gte: `${twelveMonthsAgo.getFullYear()}-${String(twelveMonthsAgo.getMonth() + 1).padStart(2, "0")}`,
        },
      },
    });

    for (const dep of allDepreciations) {
      depreciationByPeriod[dep.period] = (depreciationByPeriod[dep.period] || 0) + Number(dep.amount);
    }

    const report = {
      generatedAt: new Date().toISOString(),
      asOfDate: asOfDate || new Date().toISOString(),
      summary: {
        totalAssets: assets.length,
        totalAcquisitionCost: Math.round(totalAcquisitionCost * 100) / 100,
        totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
        totalAccumulatedDepreciation: Math.round(totalAccumulatedDepreciation * 100) / 100,
        overallPercentageDepreciated: totalAcquisitionCost > 0
          ? Math.round((totalAccumulatedDepreciation / totalAcquisitionCost) * 10000) / 100
          : 0,
      },
      byCategory: Object.values(byCategory).map((cat: any) => ({
        ...cat.category,
        assetCount: cat.assets.length,
        totals: {
          acquisitionCost: Math.round(cat.totals.acquisitionCost * 100) / 100,
          currentValue: Math.round(cat.totals.currentValue * 100) / 100,
          accumulatedDepreciation: Math.round(cat.totals.accumulatedDepreciation * 100) / 100,
        },
      })),
      byStatus,
      depreciationByPeriod: Object.entries(depreciationByPeriod)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, amount]) => ({ period, amount: Math.round(amount * 100) / 100 })),
      assets: reportType === "detailed" || reportType === "depreciation" 
        ? assetsWithCalculations 
        : undefined,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Fixed assets report error:", error);
    return errorResponse("Error al generar reporte de activos fijos");
  }
}
