import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

/**
 * GET /api/products/low-stock
 * Retorna productos con stock bajo o agotado
 * Productos con minStock > 0 y stock <= minStock
 */
export async function GET() {
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  try {
    // Obtener productos donde stock <= minStock
    const allProducts = await db.product.findMany({
      include: {
        category: true,
        warehouseItems: {
          include: {
            warehouse: true,
          },
        },
        alerts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Filtrar productos agotados (stock = 0) O con stock bajo (stock <= minStock Y minStock > 0)
    const lowStockProducts = allProducts.filter(
      (p: any) => p.stock === 0 || (p.minStock > 0 && p.stock <= p.minStock)
    );

    // Ordenar: primero sin stock, luego bajo stock, luego por nombre
    lowStockProducts.sort((a: any, b: any) => {
      if (a.stock === 0 && b.stock > 0) return -1;
      if (b.stock === 0 && a.stock > 0) return 1;
      return a.name.localeCompare(b.name);
    });

    // Obtener configuración de alertas por defecto
    const defaultMinQuantity = 5;

    // Formatear respuesta con información de alerta
    const response = lowStockProducts.map((product: any) => {
      const activeAlert = product.alerts.find((a: any) => a.isActive);
      const stockPercentage = product.minStock > 0 
        ? Math.round((product.stock / product.minStock) * 100) 
        : 0;
      
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        minStock: product.minStock,
        price: product.price,
        category: product.category,
        warehouseItems: product.warehouseItems,
        alertConfig: activeAlert ? {
          id: activeAlert.id,
          minQuantity: activeAlert.minQuantity,
          warehouseId: activeAlert.warehouseId,
          isActive: activeAlert.isActive,
        } : {
          minQuantity: defaultMinQuantity,
          isActive: false,
        },
        stockPercentage,
        status: product.stock === 0 
          ? "out_of_stock" 
          : stockPercentage <= 25 
            ? "critical" 
            : "low",
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Low stock products error:", error);
    return errorResponse("Error fetching low stock products");
  }
}

/**
 * POST /api/products/low-stock
 * Crear o actualizar configuración de alerta para un producto
 */
export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { productId, minQuantity, warehouseId, isActive } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId es requerido" }, { status: 400 });
    }

    // Verificar que el producto existe y pertenece a la organización
    const product = await db.product.findFirst({
      where: { id: productId, organizationId },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Buscar alerta existente
    const existingAlert = await db.productAlert.findFirst({
      where: { productId, warehouseId: warehouseId || null },
    });

    let alert;
    if (existingAlert) {
      // Actualizar alerta existente
      alert = await db.productAlert.update({
        where: { id: existingAlert.id },
        data: {
          minQuantity: minQuantity ?? existingAlert.minQuantity,
          isActive: isActive ?? existingAlert.isActive,
        },
      });
    } else {
      // Crear nueva alerta
      alert = await db.productAlert.create({
        data: {
          productId,
          warehouseId: warehouseId || null,
          minQuantity: minQuantity ?? defaultMinQuantity,
          isActive: isActive ?? true,
        },
      });
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error("Update product alert error:", error);
    return errorResponse("Error updating product alert");
  }
}

// Valor por defecto
const defaultMinQuantity = 5;
