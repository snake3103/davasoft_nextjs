import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";

const TaxSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  shortName: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  value: z.number().min(0, "El valor debe ser mayor o igual a 0"),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/taxes - Obtener todos los impuestos
 */
export async function GET() {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const taxes = await db.tax.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(taxes);
  } catch (error) {
    console.error("Error fetching taxes:", error);
    return errorResponse("Error al obtener impuestos");
  }
}

/**
 * POST /api/taxes - Crear un nuevo impuesto
 */
export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const data = TaxSchema.parse(body);

    // Si es default, quitar default de otros
    if (data.isDefault) {
      await db.tax.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const tax = await db.tax.create({
      data: {
        ...data,
        organizationId,
      },
    });

    return NextResponse.json(tax, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating tax:", error);
    return errorResponse("Error al crear impuesto");
  }
}
