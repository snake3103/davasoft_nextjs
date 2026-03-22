import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { productSchema } from "@/lib/schemas/product";

export async function GET(request: Request) {
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // e.g., "FINISHED,SEMI_FINISHED"

  try {
    const where: any = {};
    
    if (type) {
      const types = type.split(",");
      if (types.length === 1) {
        where.productType = types[0];
      } else {
        where.productType = { in: types };
      }
    }

    const products = await db.product.findMany({ 
      where,
      orderBy: { name: "asc" },
      include: { 
        category: true,
        tax: true 
      }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Fetch products error:", error);
    return errorResponse("Error fetching products");
  }
}

export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { 
      name, description, price, stock, sku, categoryId, taxId, cost, minStock, costMethod,
      hasDimensions, length, width, height, dimensionUnit, pricingType, pricePerUnit 
    } = result.data;

    const product = await db.product.create({
      data: {
        name,
        description,
        price,
        stock,
        sku,
        categoryId,
        taxId,
        cost,
        minStock,
        costMethod,
        hasDimensions: hasDimensions ?? false,
        length,
        width,
        height,
        dimensionUnit: dimensionUnit ?? "CM",
        pricingType: pricingType ?? "FIXED",
        pricePerUnit,
        organizationId,
      },
      include: {
        category: true,
        tax: true
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Create product error:", error);
    return errorResponse("Error creating product");
  }
}
