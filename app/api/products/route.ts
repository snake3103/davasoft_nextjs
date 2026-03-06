import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { productSchema } from "@/lib/schemas/product";

export async function GET() {
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  try {
    const products = await db.product.findMany({ 
      orderBy: { name: "asc" },
      include: { category: true }
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

    const { name, description, price, stock, sku, categoryId } = result.data;

    const product = await db.product.create({
      data: {
        name,
        description,
        price,
        stock,
        sku,
        categoryId,
        organizationId,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Create product error:", error);
    return errorResponse("Error creating product");
  }
}
