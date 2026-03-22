import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { checkProductionFeasibility, getProductionMaterials } from "@/lib/production";

export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const productId = searchParams.get("productId");

  try {
    const orders = await db.productionOrder.findMany({
      where: {
        organizationId,
        ...(status && { status: status as any }),
        ...(productId && { productId }),
      },
      include: {
        product: true,
        productionConsumptions: {
          include: {
            component: true,
          },
        },
        reservations: {
          where: { status: "RESERVED" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Fetch production orders error:", error);
    return errorResponse("Error fetching production orders");
  }
}

export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { productId, quantity, notes, plannedDate } = body;

    if (!productId || !quantity) {
      return NextResponse.json({ error: "Producto y cantidad son requeridos" }, { status: 400 });
    }

    // Verificar que el producto existe y es manufacturable
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    if (product.productType !== "FINISHED" && product.productType !== "SEMI_FINISHED") {
      return NextResponse.json({ error: "Este producto no puede ser manufacturado" }, { status: 400 });
    }

    // Verificar factibilidad de producción
    const feasibility = await checkProductionFeasibility(productId, quantity);
    
    if (!feasibility.canProduce && feasibility.reasons.length > 0) {
      // Permitir continuar pero con advertencias
      console.log("Production warnings:", feasibility.reasons);
    }

    // Generar número de orden
    const lastOrder = await db.productionOrder.findFirst({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    
    const lastNumber = lastOrder 
      ? parseInt(lastOrder.number.replace("OP-", "")) 
      : 0;
    const orderNumber = `OP-${String(lastNumber + 1).padStart(4, "0")}`;

    // Obtener materiales necesarios
    const materials = await getProductionMaterials(productId, quantity);

    // Calcular costo total
    const totalCost = (feasibility.totalCost || 0) * quantity;

    // Crear la orden de producción en una transacción
    const order = await db.$transaction(async (tx) => {
      // Crear la orden
      const newOrder = await tx.productionOrder.create({
        data: {
          organizationId,
          number: orderNumber,
          productId,
          quantity,
          totalCost,
          status: "DRAFT",
          notes,
          plannedDate: plannedDate ? new Date(plannedDate) : null,
        },
      });

      // Crear las reservaciones de inventario
      for (const material of materials) {
        await tx.productionReservation.create({
          data: {
            organizationId,
            productionOrderId: newOrder.id,
            productId: material.productId,
            quantity: material.quantityNeeded,
            isSubstitute: material.useSubstitute,
            status: "RESERVED",
          },
        });
      }

      return newOrder;
    });

    // Obtener la orden completa con relaciones
    const fullOrder = await db.productionOrder.findUnique({
      where: { id: order.id },
      include: {
        product: true,
        reservations: {
          where: { status: "RESERVED" },
          include: { product: true },
        },
      },
    });

    return NextResponse.json(fullOrder, { status: 201 });
  } catch (error) {
    console.error("Create production order error:", error);
    return errorResponse("Error creating production order");
  }
}
