import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/api-helpers";
import { depreciationCalculateSchema } from "@/lib/schemas/fixed-asset";
import { Decimal } from "decimal.js";

/**
 * POST /api/fixed-assets/[id]/depreciate
 * Calcula y registra la depreciación de un activo para un período
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = depreciationCalculateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { period, date } = result.data;

    // Obtener el activo con su categoría
    const asset = await prisma.fixedAsset.findFirst({
      where: { id, organizationId },
      include: { category: true },
    });

    if (!asset) {
      return NextResponse.json({ error: "Activo no encontrado" }, { status: 404 });
    }

    if (asset.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Solo se puede depreciar activos activos" },
        { status: 400 }
      );
    }

    // Verificar si ya existe depreciación para este período
    const existingDepreciation = await prisma.assetDepreciation.findUnique({
      where: {
        assetId_period: {
          assetId: id,
          period,
        },
      },
    });

    if (existingDepreciation) {
      return NextResponse.json(
        { error: "Ya existe depreciación registrada para este período" },
        { status: 400 }
      );
    }

    // Calcular depreciación del período
    const acquisitionCost = new Decimal(asset.acquisitionCost);
    const salvageValue = new Decimal(asset.salvageValue);
    const depreciableAmount = acquisitionCost.minus(salvageValue);
    const usefulLifeMonths = asset.usefulLifeYears! * 12;

    let periodDepreciation: Decimal;

    switch (asset.depreciationMethod) {
      case "STRAIGHT_LINE":
        // Línea recta: costo depreciable / vida útil en meses
        periodDepreciation = depreciableAmount.div(usefulLifeMonths);
        break;

      case "SUM_OF_YEARS_DIGITS":
        // Suma de dígitos: más depreciación al inicio
        const currentYear = parseInt(period.split("-")[0]);
        const acquisitionYear = asset.acquisitionDate.getFullYear();
        const yearsRemaining = asset.usefulLifeYears! - (currentYear - acquisitionYear);
        const sumOfYears = (asset.usefulLifeYears! * (asset.usefulLifeYears! + 1)) / 2;
        periodDepreciation = depreciableAmount
          .times(Math.max(0, yearsRemaining))
          .div(sumOfYears);
        break;

      case "DECLINING_BALANCE":
        // Saldo decreciente: tasa fija sobre valor en libros
        const rate = new Decimal(asset.category.depreciationRate).div(100);
        const currentBookValue = new Decimal(asset.currentValue);
        periodDepreciation = currentBookValue.times(rate).div(12);
        
        // No depreciar por debajo del valor residual
        if (periodDepreciation.greaterThan(currentBookValue.minus(salvageValue))) {
          periodDepreciation = currentBookValue.minus(salvageValue);
        }
        break;

      default:
        periodDepreciation = depreciableAmount.div(usefulLifeMonths);
    }

    // Redondear a 2 decimales
    periodDepreciation = periodDepreciation.toDecimalPlaces(2);

    // Calcular nueva depreciación acumulada
    const previousAccumulated = new Decimal(asset.accumulatedDepreciation);
    const newAccumulated = previousAccumulated.plus(periodDepreciation);

    // Calcular nuevo valor en libros
    const newCurrentValue = acquisitionCost.minus(newAccumulated);

    // No puede ser menor al valor residual
    if (newCurrentValue.lessThan(salvageValue)) {
      periodDepreciation = previousAccumulated.plus(periodDepreciation).greaterThan(
        depreciableAmount
      )
        ? depreciableAmount.minus(previousAccumulated)
        : periodDepreciation;
    }

    // Crear registro de depreciación y actualizar activo
    const [depreciation, updatedAsset] = await prisma.$transaction([
      prisma.assetDepreciation.create({
        data: {
          organizationId,
          assetId: id,
          date: date ? new Date(date) : new Date(),
          period,
          amount: Number(periodDepreciation.toFixed(2)),
          accumulated: Number(newAccumulated.toFixed(2)),
        },
      }),
      prisma.fixedAsset.update({
        where: { id },
        data: {
          accumulatedDepreciation: Number(newAccumulated.toFixed(2)),
          currentValue: Number(
            acquisitionCost.minus(newAccumulated).toFixed(2)
          ),
        },
        include: { category: true },
      }),
    ]);

    return NextResponse.json({
      depreciation,
      asset: {
        ...updatedAsset,
        currentValue: Number(updatedAsset.currentValue),
        accumulatedDepreciation: Number(updatedAsset.accumulatedDepreciation),
        acquisitionCost: Number(updatedAsset.acquisitionCost),
        salvageValue: Number(updatedAsset.salvageValue),
      },
    });
  } catch (error) {
    console.error("Calculate depreciation error:", error);
    return errorResponse("Error al calcular depreciación");
  }
}

/**
 * GET /api/fixed-assets/[id]/depreciate
 * Vista previa de depreciación sin guardar
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
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period");

    if (!period) {
      return NextResponse.json(
        { error: "Se requiere el parámetro period (YYYY-MM)" },
        { status: 400 }
      );
    }

    const asset = await prisma.fixedAsset.findFirst({
      where: { id, organizationId },
      include: { category: true },
    });

    if (!asset) {
      return NextResponse.json({ error: "Activo no encontrado" }, { status: 404 });
    }

    // Calcular depreciación preview
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

    return NextResponse.json({
      preview: {
        period,
        currentValue: Number(asset.currentValue),
        accumulatedDepreciation: Number(asset.accumulatedDepreciation),
        periodDepreciation: Number(periodDepreciation.toFixed(2)),
        newAccumulated: Number(newAccumulated.toFixed(2)),
        newCurrentValue: Number(
          Math.max(newCurrentValue.toNumber(), Number(asset.salvageValue))
            .toFixed(2)
        ),
        salvageValue: Number(asset.salvageValue),
        method: asset.depreciationMethod,
      },
    });
  } catch (error) {
    console.error("Preview depreciation error:", error);
    return errorResponse("Error al previsualizar depreciación");
  }
}
