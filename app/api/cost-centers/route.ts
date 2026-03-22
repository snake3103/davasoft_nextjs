import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";

const costCenterSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/cost-centers - List all cost centers
export async function GET() {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const costCenters = await db.costCenter.findMany({
      where: { organizationId },
      orderBy: { code: "asc" },
      include: {
        _count: {
          select: { invoices: true, expenses: true, incomes: true }
        }
      }
    });

    // Add total documents count
    const result = costCenters.map(cc => ({
      ...cc,
      totalDocuments: cc._count.invoices + cc._count.expenses + cc._count.incomes
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fetch cost centers error:", error);
    return errorResponse("Error al obtener centros de costo");
  }
}

// POST /api/cost-centers - Create cost center
export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = costCenterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { code, name, description, isActive } = result.data;

    // Check for duplicate code
    const existing = await db.costCenter.findUnique({
      where: { organizationId_code: { organizationId, code } }
    });

    if (existing) {
      return NextResponse.json({ error: "Ya existe un centro de costo con ese código" }, { status: 400 });
    }

    const costCenter = await db.costCenter.create({
      data: {
        code,
        name,
        description,
        isActive,
        organizationId,
      },
    });

    return NextResponse.json(costCenter);
  } catch (error) {
    console.error("Create cost center error:", error);
    return errorResponse("Error al crear centro de costo");
  }
}
