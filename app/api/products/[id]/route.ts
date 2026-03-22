import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { productSchema } from "@/lib/schemas/product";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  try {
    const product = await db.product.findUnique({
      where: { id },
      include: { 
        category: true,
        tax: true,
        billsOfMaterials: {
          where: { isDefault: true, isActive: true },
          include: {
            boMItems: {
              orderBy: { sequence: 'asc' },
              include: {
                component: true,
                substitutes: {
                  include: {
                    substitute: true,
                  },
                  orderBy: { priority: 'asc' },
                },
              },
            },
          },
        },
      },
    });
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error("Fetch product error:", error);
    return errorResponse("Error fetching product");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = productSchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { 
      name, description, price, stock, sku, categoryId, taxId, cost, minStock, costMethod,
      hasDimensions, length, width, height, dimensionUnit, pricingType, pricePerUnit, productType
    } = result.data;

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(sku !== undefined && { sku }),
        ...(categoryId !== undefined && { categoryId }),
        ...(taxId !== undefined && { taxId }),
        ...(cost !== undefined && { cost }),
        ...(minStock !== undefined && { minStock }),
        ...(costMethod !== undefined && { costMethod }),
        ...(productType !== undefined && { productType }),
        ...(hasDimensions !== undefined && { hasDimensions }),
        ...(length !== undefined && { length }),
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
        ...(dimensionUnit !== undefined && { dimensionUnit }),
        ...(pricingType !== undefined && { pricingType }),
        ...(pricePerUnit !== undefined && { pricePerUnit }),
      },
      include: {
        category: true,
        tax: true,
        billsOfMaterials: {
          where: { isDefault: true, isActive: true },
          include: {
            boMItems: {
              orderBy: { sequence: 'asc' },
              include: {
                component: true,
                substitutes: {
                  include: {
                    substitute: true,
                  },
                  orderBy: { priority: 'asc' },
                },
              },
            },
          },
        },
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return errorResponse("Error updating product");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  try {
    await db.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return errorResponse("Error deleting product");
  }
}
