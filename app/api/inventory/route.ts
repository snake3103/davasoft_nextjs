import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { Decimal } from "decimal.js";

export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const type = searchParams.get("type");

    if (productId) {
      const movements = await db.inventoryMovement.findMany({
        where: {
          productId,
          organizationId,
        },
        orderBy: { createdAt: "asc" },
      });

      let runningStock = 0;
      let runningCost = new Decimal(0);
      
      const enrichedMovements = movements.map((m) => {
        const isInput = ["PURCHASE", "ADJUSTMENT_IN", "RETURN_IN", "TRANSFER_IN"].includes(m.type);
        
        if (isInput) {
          runningStock += m.quantity;
          runningCost = runningCost.add(m.totalCost);
        } else {
          runningStock -= m.quantity;
        }

        const avgCost = runningStock > 0 ? runningCost.div(runningStock) : new Decimal(0);

        return {
          ...m,
          runningStock,
          avgCost: avgCost.toNumber(),
          totalValue: avgCost.mul(runningStock).toNumber(),
        };
      });

      return NextResponse.json({ movements: enrichedMovements });
    }

    if (type === "valuation") {
      const products = await db.product.findMany({
        where: { organizationId },
        include: {
          movements: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      const valuation = products.map((product) => {
        let totalQuantity = 0;
        let totalCost = new Decimal(0);

        const purchaseMovements = product.movements.filter((m) =>
          ["PURCHASE", "ADJUSTMENT_IN", "RETURN_IN"].includes(m.type)
        );
        const saleMovements = product.movements.filter((m) =>
          ["SALE", "ADJUSTMENT_OUT", "RETURN_OUT"].includes(m.type)
        );

        purchaseMovements.forEach((m) => {
          totalQuantity += m.quantity;
          totalCost = totalCost.add(m.totalCost);
        });

        saleMovements.forEach((m) => {
          totalQuantity -= m.quantity;
        });

        const avgCost = totalQuantity > 0 ? totalCost.div(totalQuantity) : new Decimal(0);
        const totalValue = avgCost.mul(totalQuantity);
        const needsRestock = product.minStock > 0 && totalQuantity <= product.minStock;

        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          currentStock: totalQuantity,
          avgCost: avgCost.toNumber(),
          totalValue: totalValue.toNumber(),
          minStock: product.minStock,
          needsRestock,
        };
      });

      const totalInventoryValue = valuation.reduce((sum, v) => sum + v.totalValue, 0);
      const productsNeedingRestock = valuation.filter((v) => v.needsRestock).length;

      return NextResponse.json({
        valuation,
        summary: {
          totalProducts: products.length,
          totalValue: totalInventoryValue,
          productsNeedingRestock,
        },
      });
    }

    if (type === "lowstock") {
      const products = await db.product.findMany({
        where: { 
          organizationId,
          minStock: { gt: 0 },
        },
      });

      const lowStock = products.filter((p) => p.stock <= p.minStock);

      return NextResponse.json(
        lowStock.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          stock: p.stock,
          minStock: p.minStock,
        }))
      );
    }

    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  } catch (error) {
    console.error("Inventory API error:", error);
    return errorResponse("Error en el servidor");
  }
}
