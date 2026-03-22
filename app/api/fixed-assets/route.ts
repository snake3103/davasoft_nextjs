import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { fixedAssetSchema } from "@/lib/schemas/fixed-asset";
import { Decimal } from "decimal.js";

/**
 * GET /api/fixed-assets - Lista todos los activos fijos con filtros
 */
export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const assets = await db.fixedAsset.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calcular valores actuales
    const assetsWithValues = assets.map(asset => ({
      ...asset,
      currentValue: Number(asset.currentValue),
      accumulatedDepreciation: Number(asset.accumulatedDepreciation),
      acquisitionCost: Number(asset.acquisitionCost),
      salvageValue: Number(asset.salvageValue),
    }));

    return NextResponse.json(assetsWithValues);
  } catch (error) {
    console.error("Fetch fixed assets error:", error);
    return errorResponse("Error al obtener activos fijos");
  }
}

/**
 * POST /api/fixed-assets - Crea un nuevo activo fijo
 */
export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = fixedAssetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const {
      categoryId,
      code,
      name,
      description,
      location,
      responsibleId,
      acquisitionDate,
      acquisitionCost,
      salvageValue,
      usefulLifeYears,
      depreciationMethod,
      depreciationStartDate,
      invoiceId,
      notes,
    } = result.data;

    // Verificar código único
    const existing = await db.fixedAsset.findUnique({
      where: { organizationId_code: { organizationId, code } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un activo con este código" },
        { status: 400 }
      );
    }

    // Obtener categoría para usar valores por defecto
    const category = await db.assetCategory.findFirst({
      where: { id: categoryId, organizationId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 400 }
      );
    }

    const effectiveUsefulLife = usefulLifeYears ?? category.usefulLifeYears;
    const effectiveDepreciationMethod = depreciationMethod ?? category.depreciationMethod;
    const effectiveDepreciationStart = depreciationStartDate 
      ? new Date(depreciationStartDate) 
      : new Date(acquisitionDate);

    const cost = new Decimal(acquisitionCost);
    const salvage = new Decimal(salvageValue ?? 0);
    const depreciableAmount = cost.minus(salvage);

    // Calcular valor actual (al inicio es el costo de adquisición)
    let currentValue = cost;
    
    // Calcular depreciación acumulada desde el inicio hasta hoy
    const startDate = new Date(acquisitionDate);
    const today = new Date();
    const monthsElapsed = (today.getFullYear() - startDate.getFullYear()) * 12 
      + (today.getMonth() - startDate.getMonth());
    
    let accumulatedDepreciation = new Decimal(0);
    
    if (effectiveDepreciationMethod === "STRAIGHT_LINE") {
      const monthlyDepreciation = depreciableAmount.div(effectiveUsefulLife * 12);
      accumulatedDepreciation = monthlyDepreciation.mul(Math.max(0, monthsElapsed));
    } else if (effectiveDepreciationMethod === "DECLINING_BALANCE") {
      const rate = new Decimal(category.depreciationRate).div(100);
      const monthlyRate = new Decimal(1).minus(rate).pow(1/12);
      currentValue = cost.times(monthlyRate.pow(Math.max(0, monthsElapsed)));
      accumulatedDepreciation = cost.minus(currentValue);
    }

    // No depreciar más allá del valor residual
    if (accumulatedDepreciation.greaterThan(depreciableAmount)) {
      accumulatedDepreciation = depreciableAmount;
    }

    const finalCurrentValue = cost.minus(accumulatedDepreciation);

    const asset = await db.fixedAsset.create({
      data: {
        organizationId,
        categoryId,
        code,
        name,
        description,
        location,
        responsibleId,
        acquisitionDate: new Date(acquisitionDate),
        acquisitionCost: Number(acquisitionCost),
        salvageValue: Number(salvageValue ?? 0),
        usefulLifeYears: effectiveUsefulLife,
        depreciationMethod: effectiveDepreciationMethod,
        depreciationStartDate: effectiveDepreciationStart,
        invoiceId,
        notes,
        currentValue: Number(finalCurrentValue.toFixed(2)),
        accumulatedDepreciation: Number(accumulatedDepreciation.toFixed(2)),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Create fixed asset error:", error);
    return errorResponse("Error al crear activo fijo");
  }
}
