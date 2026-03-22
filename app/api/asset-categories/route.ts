import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { assetCategorySchema } from "@/lib/schemas/fixed-asset";
import { Decimal } from "decimal.js";

/**
 * GET /api/asset-categories - Lista todas las categorías de activos
 */
export async function GET() {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const categories = await db.assetCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Fetch asset categories error:", error);
    return errorResponse("Error al obtener categorías");
  }
}

/**
 * POST /api/asset-categories - Crea una nueva categoría de activo
 */
export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = assetCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { 
      name, 
      code, 
      depreciationMethod, 
      usefulLifeYears, 
      depreciationRate,
      accountAssetId,
      accountDepreciationId,
      accountExpenseId,
    } = result.data;

    // Verificar código único
    const existing = await db.assetCategory.findUnique({
      where: { organizationId_code: { organizationId, code } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una categoría con este código" },
        { status: 400 }
      );
    }

    const category = await db.assetCategory.create({
      data: {
        organizationId,
        name,
        code,
        depreciationMethod,
        usefulLifeYears,
        depreciationRate: depreciationRate ?? new Decimal(20),
        accountAssetId,
        accountDepreciationId,
        accountExpenseId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Create asset category error:", error);
    return errorResponse("Error al crear categoría");
  }
}
