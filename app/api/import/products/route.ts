import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { parseExcelFile, validateProductRow, ProductImportRow } from "@/lib/excel-utils";
import { logCreate } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/import/products - Import products from Excel
export async function POST(request: Request) {
  const { db, organizationId, session } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Archivo no proporcionado" }, { status: 400 });
    }

    // Check file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel"
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json({ error: "Formato de archivo inválido. Use .xlsx o .xls" }, { status: 400 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Parse Excel (now async)
    const rows = await parseExcelFile<ProductImportRow>(buffer);

    if (rows.length === 0) {
      return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 });
    }

    // Get existing categories for mapping
    const categories = await db.category.findMany({
      where: { organizationId },
      select: { id: true, name: true }
    });
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

    // Process rows
    const results = {
      created: 0,
      updated: 0,
      errors: [] as { row: number; name: string; error: string }[]
    };

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // Excel rows start at 1, +1 for header

        // Validate row
        const validation = validateProductRow(row);
        if (!validation.valid) {
          results.errors.push({ row: rowNumber, name: row.name || "Sin nombre", error: validation.error! });
          continue;
        }

        const productData = {
          name: row.name.trim(),
          sku: row.sku?.trim() || null,
          price: Number(row.price) || 0,
          cost: Number(row.cost) || 0,
          stock: Math.floor(Number(row.stock)) || 0,
          description: row.description?.trim() || null,
          categoryId: row.category ? categoryMap.get(row.category.toLowerCase()) || null : null,
        };

        // Check if product exists by SKU (if provided)
        if (productData.sku) {
          const existing = await tx.product.findFirst({
            where: { organizationId, sku: productData.sku }
          });

          if (existing) {
            // Update existing product
            await tx.product.update({
              where: { id: existing.id },
              data: {
                name: productData.name,
                price: productData.price,
                cost: productData.cost,
                stock: productData.stock,
                description: productData.description,
                categoryId: productData.categoryId,
              }
            });
            results.updated++;
            continue;
          }
        }

        // Create new product
        await tx.product.create({
          data: {
            ...productData,
            organizationId,
          }
        });
        results.created++;
      }
    });

    // Log activity
    await logCreate({
      action: "products.import",
      description: `Importó ${results.created} productos (${results.updated} actualizados)`,
      module: "products",
      entityType: "Product",
    });

    return NextResponse.json({
      success: true,
      message: `Importación completada`,
      results: {
        created: results.created,
        updated: results.updated,
        totalProcessed: rows.length,
        errors: results.errors
      }
    });
  } catch (error) {
    console.error("Import products error:", error);
    return errorResponse("Error al importar productos");
  }
}
