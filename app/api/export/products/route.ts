import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { createProductsExcel, exportToExcelBuffer } from "@/lib/excel-utils";
import { logCreate } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/export/products - Export products to Excel
export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    // Build where clause
    const whereClause: any = { organizationId };
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // Fetch products
    const products = await db.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: { name: true }
        }
      },
      orderBy: { name: "asc" }
    });

    if (products.length === 0) {
      return NextResponse.json({ error: "No hay productos para exportar" }, { status: 404 });
    }

    // Create Excel (now async)
    const buffer = await createProductsExcel(products);

    // Log activity
    await logCreate({
      action: "products.export",
      description: `Exportó ${products.length} productos a Excel`,
      module: "products",
      entityType: "Product",
    });

    // Return file
    const timestamp = new Date().toISOString().split("T")[0];
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="productos_${timestamp}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export products error:", error);
    return errorResponse("Error al exportar productos");
  }
}
