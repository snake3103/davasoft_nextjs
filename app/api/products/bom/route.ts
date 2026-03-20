import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { calculateMaterialQuantity } from "@/lib/formulas";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const activeOnly = searchParams.get("active") === "true";

    const where: any = {
      organizationId: session.user.organizationId,
    };

    if (productId) {
      where.productId = productId;
    }

    if (activeOnly) {
      where.isActive = true;
    }

    const boms = await prisma.billOfMaterials.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        boMItems: {
          include: {
            component: {
              select: { id: true, name: true, sku: true, stock: true },
            },
          },
          orderBy: { sequence: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(boms);
  } catch (error) {
    console.error("Error fetching BoMs:", error);
    return NextResponse.json({ error: "Error fetching BoMs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, version, isActive, isDefault, items, attributes } = body;

    if (!productId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Product and at least one item are required" },
        { status: 400 }
      );
    }

    // Calculate total cost
    let totalCost = 0;
    const bomItemsData = items.map((item: any, index: number) => {
      let quantity = Number(item.quantity);
      
      // If there's a formula and attributes, calculate quantity
      if (item.quantityFormula && attributes) {
        const calculated = calculateMaterialQuantity(item.quantityFormula, {
          ...attributes,
          quantity: 1,
        });
        quantity = calculated.toNumber();
      }

      const itemCost = Number(item.componentCost || 0) * quantity;
      totalCost += itemCost;

      return {
        componentId: item.componentId,
        quantity: quantity,
        quantityFormula: item.quantityFormula || null,
        isOptional: item.isOptional || false,
        scrapPercent: item.scrapPercent || 0,
        sequence: index,
      };
    });

    // Create BoM with items
    const bom = await prisma.billOfMaterials.create({
      data: {
        organizationId: session.user.organizationId,
        productId,
        version: version || "1.0",
        isActive: isActive ?? true,
        isDefault: isDefault ?? false,
        totalCost,
        boMItems: {
          create: bomItemsData,
        },
      },
      include: {
        boMItems: true,
      },
    });

    return NextResponse.json(bom);
  } catch (error) {
    console.error("Error creating BoM:", error);
    return NextResponse.json({ error: "Error creating BoM" }, { status: 500 });
  }
}
