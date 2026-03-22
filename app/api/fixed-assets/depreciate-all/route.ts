import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/api-helpers";
import { depreciationCalculateSchema } from "@/lib/schemas/fixed-asset";
import { Decimal } from "decimal.js";

/**
 * POST /api/fixed-assets/depreciate-all
 * Calcula y registra la depreciación de todos los activos activos para un período
 */
export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = depreciationCalculateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { period, date } = result.data;

    // Obtener todos los activos activos
    const assets = await prisma.fixedAsset.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
      },
      include: { category: true },
    });

    if (assets.length === 0) {
      return NextResponse.json({
        message: "No hay activos activos para depreciar",
        processed: 0,
        results: [],
      });
    }

    const results: any[] = [];
    const errors: any[] = [];

    for (const asset of assets) {
      try {
        // Verificar si ya existe depreciación para este período
        const existingDepreciation = await prisma.assetDepreciation.findUnique({
          where: {
            assetId_period: {
              assetId: asset.id,
              period,
            },
          },
        });

        if (existingDepreciation) {
          errors.push({
            assetId: asset.id,
            code: asset.code,
            error: "Ya existe depreciación para este período",
          });
          continue;
        }

        // Calcular depreciación
        const acquisitionCost = new Decimal(asset.acquisitionCost);
        const salvageValue = new Decimal(asset.salvageValue);
        const depreciableAmount = acquisitionCost.minus(salvageValue);
        const usefulLifeMonths = asset.usefulLifeYears! * 12;

        let periodDepreciation: Decimal;

        switch (asset.depreciationMethod) {
          case "STRAIGHT_LINE":
            periodDepreciation = depreciableAmount.div(usefulLifeMonths);
            break;
          case "SUM_OF_YEARS_DIGITS":
            const currentYear = parseInt(period.split("-")[0]);
            const acquisitionYear = asset.acquisitionDate.getFullYear();
            const yearsRemaining = asset.usefulLifeYears! - (currentYear - acquisitionYear);
            const sumOfYears = (asset.usefulLifeYears! * (asset.usefulLifeYears! + 1)) / 2;
            periodDepreciation = depreciableAmount
              .times(Math.max(0, yearsRemaining))
              .div(sumOfYears);
            break;
          case "DECLINING_BALANCE":
            const rate = new Decimal(asset.category.depreciationRate).div(100);
            const currentBookValue = new Decimal(asset.currentValue);
            periodDepreciation = currentBookValue.times(rate).div(12);
            break;
          default:
            periodDepreciation = depreciableAmount.div(usefulLifeMonths);
        }

        periodDepreciation = periodDepreciation.toDecimalPlaces(2);
        const newAccumulated = new Decimal(asset.accumulatedDepreciation).plus(periodDepreciation);
        const newCurrentValue = acquisitionCost.minus(newAccumulated);

        // Verificar que no exceda el valor residual
        if (newCurrentValue.lessThan(salvageValue)) {
          periodDepreciation = depreciableAmount.minus(
            new Decimal(asset.accumulatedDepreciation)
          );
          periodDepreciation = periodDepreciation.toDecimalPlaces(2);
        }

        // Crear registro
        const [depreciation] = await prisma.$transaction([
          prisma.assetDepreciation.create({
            data: {
              organizationId,
              assetId: asset.id,
              date: date ? new Date(date) : new Date(),
              period,
              amount: Number(periodDepreciation.toFixed(2)),
              accumulated: Number(
                new Decimal(asset.accumulatedDepreciation)
                  .plus(periodDepreciation)
                  .toFixed(2)
              ),
            },
          }),
          prisma.fixedAsset.update({
            where: { id: asset.id },
            data: {
              accumulatedDepreciation: Number(
                new Decimal(asset.accumulatedDepreciation)
                  .plus(periodDepreciation)
                  .toFixed(2)
              ),
              currentValue: Number(
                acquisitionCost
                  .minus(new Decimal(asset.accumulatedDepreciation).plus(periodDepreciation))
                  .toFixed(2)
              ),
            },
          }),
        ]);

        results.push({
          assetId: asset.id,
          code: asset.code,
          name: asset.name,
          depreciation: Number(periodDepreciation.toFixed(2)),
          newAccumulated: Number(
            new Decimal(asset.accumulatedDepreciation)
              .plus(periodDepreciation)
              .toFixed(2)
          ),
          newCurrentValue: Number(
            acquisitionCost
              .minus(new Decimal(asset.accumulatedDepreciation).plus(periodDepreciation))
              .toFixed(2)
          ),
        });
      } catch (assetError) {
        errors.push({
          assetId: asset.id,
          code: asset.code,
          error: String(assetError),
        });
      }
    }

    const totalDepreciation = results.reduce(
      (sum, r) => sum + r.depreciation,
      0
    );

    return NextResponse.json({
      period,
      processed: results.length,
      skipped: errors.length,
      totalDepreciation: Number(totalDepreciation.toFixed(2)),
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Depreciate all assets error:", error);
    return errorResponse("Error al depreciar activos");
  }
}

/**
 * GET /api/fixed-assets/depreciate-all
 * Vista previa de depreciación masiva
 */
export async function GET(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period");

    if (!period) {
      return NextResponse.json(
        { error: "Se requiere el parámetro period (YYYY-MM)" },
        { status: 400 }
      );
    }

    const assets = await prisma.fixedAsset.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
      },
      include: { category: true },
    });

    if (assets.length === 0) {
      return NextResponse.json({
        period,
        totalAssets: 0,
        preview: [],
        totalDepreciation: 0,
      });
    }

    const preview: any[] = [];
    let totalDepreciation = 0;

    for (const asset of assets) {
      const acquisitionCost = new Decimal(asset.acquisitionCost);
      const salvageValue = new Decimal(asset.salvageValue);
      const depreciableAmount = acquisitionCost.minus(salvageValue);
      const usefulLifeMonths = asset.usefulLifeYears! * 12;

      let periodDepreciation: Decimal;

      switch (asset.depreciationMethod) {
        case "STRAIGHT_LINE":
          periodDepreciation = depreciableAmount.div(usefulLifeMonths);
          break;
        case "SUM_OF_YEARS_DIGITS":
          const currentYear = parseInt(period.split("-")[0]);
          const acquisitionYear = asset.acquisitionDate.getFullYear();
          const yearsRemaining = asset.usefulLifeYears! - (currentYear - acquisitionYear);
          const sumOfYears = (asset.usefulLifeYears! * (asset.usefulLifeYears! + 1)) / 2;
          periodDepreciation = depreciableAmount
            .times(Math.max(0, yearsRemaining))
            .div(sumOfYears);
          break;
        case "DECLINING_BALANCE":
          const rate = new Decimal(asset.category.depreciationRate).div(100);
          const currentBookValue = new Decimal(asset.currentValue);
          periodDepreciation = currentBookValue.times(rate).div(12);
          break;
        default:
          periodDepreciation = depreciableAmount.div(usefulLifeMonths);
      }

      periodDepreciation = periodDepreciation.toDecimalPlaces(2);
      totalDepreciation += periodDepreciation.toNumber();

      preview.push({
        assetId: asset.id,
        code: asset.code,
        name: asset.name,
        currentValue: Number(asset.currentValue),
        periodDepreciation: Number(periodDepreciation.toFixed(2)),
        newAccumulated: Number(
          new Decimal(asset.accumulatedDepreciation)
            .plus(periodDepreciation)
            .toFixed(2)
        ),
        newCurrentValue: Number(
          acquisitionCost
            .minus(new Decimal(asset.accumulatedDepreciation).plus(periodDepreciation))
            .toFixed(2)
        ),
        alreadyDepreciated: false,
      });
    }

    return NextResponse.json({
      period,
      totalAssets: assets.length,
      totalDepreciation: Number(totalDepreciation.toFixed(2)),
      preview,
    });
  } catch (error) {
    console.error("Preview depreciate all error:", error);
    return errorResponse("Error al previsualizar depreciación");
  }
}
