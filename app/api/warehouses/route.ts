import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";

const warehouseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  address: z.string().optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// GET /api/warehouses - List all warehouses
export async function GET() {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const warehouses = await db.warehouse.findMany({
      where: { organizationId },
      orderBy: [
        { isDefault: "desc" },
        { name: "asc" }
      ],
      include: {
        _count: {
          select: { inventoryItems: true }
        }
      }
    });
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error("Fetch warehouses error:", error);
    return errorResponse("Error al obtener bodegas");
  }
}

// POST /api/warehouses - Create warehouse
export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = warehouseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { name, address, isDefault, isActive } = result.data;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db.warehouse.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false }
      });
    }

    // Check for duplicate name
    const existing = await db.warehouse.findUnique({
      where: { organizationId_name: { organizationId, name } }
    });

    if (existing) {
      return NextResponse.json({ error: "Ya existe una bodega con ese nombre" }, { status: 400 });
    }

    const warehouse = await db.warehouse.create({
      data: {
        name,
        address,
        isDefault,
        isActive,
        organizationId,
      },
    });

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error("Create warehouse error:", error);
    return errorResponse("Error al crear bodega");
  }
}
