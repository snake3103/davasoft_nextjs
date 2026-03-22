import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "Producto y cantidad son requeridos" },
        { status: 400 }
      );
    }

    // Obtener la lista de materiales del producto
    const bom = await db.billOfMaterials.findFirst({
      where: { productId, isDefault: true, isActive: true },
      include: {
        boMItems: {
          include: {
            component: true,
            substitutes: {
              where: { isActive: true },
              orderBy: { priority: 'asc' },
              include: { substitute: true },
            },
          },
        },
      },
    });

    if (!bom || bom.boMItems.length === 0) {
      return NextResponse.json({
        canProduce: false,
        reasons: ["Este producto no tiene lista de materiales configurada"],
        totalCost: 0,
        items: [],
      });
    }

    const reasons: string[] = [];
    let canProduce = true;
    let totalCost = 0;
    const items: any[] = [];

    for (const item of bom.boMItems) {
      const mainStock = Number(item.component.stock ?? 0);
      const mainCost = Number(item.component.price);
      const itemQuantity = Number(item.quantity);
      const scrapPercent = Number(item.scrapPercent);
      
      // Cantidad necesaria considerando cantidad a producir y desperdicio
      const quantityNeeded = itemQuantity * quantity * (1 + scrapPercent / 100);
      
      // Verificar stock disponible
      let availableStock = mainStock;
      let selectedMaterial = item.component;
      let useSubstitute = false;
      
      if (mainStock < quantityNeeded && item.substitutes.length > 0) {
        // Buscar sustituto con stock suficiente
        for (const sub of item.substitutes) {
          const subStock = Number(sub.substitute.stock ?? 0);
          const subRequired = quantityNeeded * Number(sub.quantityRatio);
          if (subStock >= subRequired) {
            availableStock = subStock;
            selectedMaterial = sub.substitute;
            useSubstitute = true;
            break;
          }
        }
      }

      // Determinar estado del stock
      let stockStatus: 'available' | 'low' | 'out' = 'available';
      if (availableStock <= 0) {
        stockStatus = 'out';
        if (!item.isOptional) {
          canProduce = false;
          reasons.push(`Sin stock: ${selectedMaterial.name}`);
        }
      } else if (availableStock < quantityNeeded) {
        stockStatus = 'low';
        if (!item.isOptional) {
          reasons.push(`Stock bajo: ${selectedMaterial.name} (${availableStock} disponible, necesita ${quantityNeeded.toFixed(2)})`);
        }
      }

      // Calcular costo
      const itemCost = quantityNeeded * Number(selectedMaterial.price);
      totalCost += itemCost;

      items.push({
        name: selectedMaterial.name,
        quantity: quantityNeeded,
        unitCost: Number(selectedMaterial.price),
        totalCost: itemCost,
        stockStatus,
        isOptional: item.isOptional,
        useSubstitute,
      });
    }

    return NextResponse.json({
      canProduce,
      reasons,
      totalCost,
      items,
    });
  } catch (error) {
    console.error("Feasibility check error:", error);
    return NextResponse.json(
      { error: "Error al verificar factibilidad" },
      { status: 500 }
    );
  }
}
