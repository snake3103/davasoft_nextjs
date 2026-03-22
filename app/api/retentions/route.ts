import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { retentionSchema } from "@/lib/schemas/retention";

/**
 * GET /api/retentions - Lista todas las retenciones
 * ?sales=true - Solo aplicables a ventas
 * ?purchases=true - Solo aplicables a compras
 * ?type=ISR_RETENTION - Filtrar por tipo
 */
export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const sales = searchParams.get("sales");
    const purchases = searchParams.get("purchases");
    const type = searchParams.get("type");
    const activeOnly = searchParams.get("active") !== "false";

    const where: any = {};
    
    if (activeOnly) {
      where.isActive = true;
    }
    
    if (type) {
      where.type = type;
    }
    
    // Filtrar por tipo de aplicación
    if (sales === "true" && purchases !== "true") {
      where.appliesTo = { in: ["SALES", "BOTH"] };
    } else if (purchases === "true" && sales !== "true") {
      where.appliesTo = { in: ["PURCHASES", "BOTH"] };
    }

    const retentions = await db.retention.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      retentions.map(r => ({
        ...r,
        percentage: Number(r.percentage),
      }))
    );
  } catch (error) {
    console.error("Fetch retentions error:", error);
    return errorResponse("Error al obtener retenciones");
  }
}

/**
 * POST /api/retentions - Crea una nueva retención
 */
export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = retentionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { 
      name, 
      type, 
      percentage, 
      description,
      accountPayableId,
      accountReceivableId,
      appliesTo,
      isActive,
    } = result.data;

    // Verificar nombre único
    const existing = await db.retention.findUnique({
      where: { organizationId_name: { organizationId, name } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una retención con este nombre" },
        { status: 400 }
      );
    }

    const retention = await db.retention.create({
      data: {
        organizationId,
        name,
        type,
        percentage,
        description,
        accountPayableId,
        accountReceivableId,
        appliesTo,
        isActive,
      },
    });

    return NextResponse.json(
      {
        ...retention,
        percentage: Number(retention.percentage),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create retention error:", error);
    return errorResponse("Error al crear retención");
  }
}
