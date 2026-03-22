import prisma from "@/lib/prisma";

/**
 * Calcula el costo de materiales para fabricar un producto
 */
export async function calculateProductMaterialCost(productId: string) {
  const bom = await prisma.billOfMaterials.findFirst({
    where: { productId, isDefault: true, isActive: true },
    include: {
      boMItems: {
        include: {
          component: true,
          substitutes: {
            where: { isActive: true },
            orderBy: { priority: 'asc' },
            include: {
              substitute: true,
            },
          },
        },
      },
    },
  });

  if (!bom || bom.boMItems.length === 0) {
    return {
      productId,
      totalCost: 0,
      items: [],
      hasBom: false,
    };
  }

  let totalCost = 0;
  const items: Array<{
    name: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    scrapPercent: number;
    isOptional: boolean;
    hasSubstitutes: boolean;
    stockStatus: 'available' | 'low' | 'out';
  }> = [];

  for (const item of bom.boMItems) {
    // Verificar si hay stock del material principal
    const mainStock = Number(item.component.stock ?? 0);
    const mainCost = Number(item.component.price);
    const itemQuantity = Number(item.quantity);
    const scrapPercent = Number(item.scrapPercent);
    
    // Verificar stock disponible (considerando sustitutos)
    let availableStock = mainStock;
    let selectedMaterial = item.component;
    
    if (mainStock < itemQuantity && item.substitutes.length > 0) {
      // Buscar sustituto con stock
      for (const sub of item.substitutes) {
        const subStock = Number(sub.substitute.stock ?? 0);
        const subRequired = itemQuantity * Number(sub.quantityRatio);
        if (subStock >= subRequired) {
          availableStock = subStock;
          selectedMaterial = sub.substitute;
          break;
        }
      }
    }

    // Calcular costo del item (considerando desperdicio)
    const quantityWithScrap = itemQuantity * (1 + scrapPercent / 100);
    const itemCost = quantityWithScrap * Number(selectedMaterial.price);
    totalCost += itemCost;

    // Determinar estado del stock
    let stockStatus: 'available' | 'low' | 'out' = 'available';
    if (availableStock <= 0) {
      stockStatus = 'out';
    } else if (availableStock < itemQuantity) {
      stockStatus = 'low';
    }

    items.push({
      name: selectedMaterial.name,
      quantity: quantityWithScrap,
      unitCost: Number(selectedMaterial.price),
      totalCost: itemCost,
      scrapPercent,
      isOptional: item.isOptional,
      hasSubstitutes: item.substitutes.length > 0,
      stockStatus,
    });
  }

  return {
    productId,
    totalCost: Math.round(totalCost * 100) / 100, // Redondear a 2 decimales
    items,
    hasBom: true,
  };
}

/**
 * Verifica si se puede producir una cantidad de un producto
 * Returns: { canProduce: boolean, reasons: string[] }
 */
export async function checkProductionFeasibility(productId: string, quantity: number) {
  const costInfo = await calculateProductMaterialCost(productId);
  
  if (!costInfo.hasBom) {
    return {
      canProduce: false,
      reasons: ['Este producto no tiene lista de materiales configurada'],
    };
  }

  const reasons: string[] = [];
  let canProduce = true;

  for (const item of costInfo.items) {
    if (!item.isOptional && item.stockStatus === 'out') {
      canProduce = false;
      reasons.push(`Sin stock: ${item.name}`);
    } else if (!item.isOptional && item.stockStatus === 'low') {
      reasons.push(`Stock bajo: ${item.name} (puede necesitar sustitutos)`);
    }
  }

  return {
    canProduce,
    reasons,
    totalCost: costInfo.totalCost,
    items: costInfo.items,
  };
}

/**
 * Obtiene los materiales necesarios para producir una cantidad
 * incluyendo los sustitutos a usar
 */
export async function getProductionMaterials(productId: string, quantity: number) {
  const bom = await prisma.billOfMaterials.findFirst({
    where: { productId, isDefault: true, isActive: true },
    include: {
      boMItems: {
        include: {
          component: true,
          substitutes: {
            where: { isActive: true },
            orderBy: { priority: 'asc' },
            include: {
              substitute: true,
            },
          },
        },
      },
    },
  });

  if (!bom) return [];

  const materials: Array<{
    productId: string;
    productName: string;
    sku: string | null;
    quantityNeeded: number;
    currentStock: number;
    useSubstitute: boolean;
    substituteProduct?: {
      id: string;
      name: string;
      stock: number;
    };
  }> = [];

  for (const item of bom.boMItems) {
    const itemQuantity = Number(item.quantity);
    const scrapPercent = Number(item.scrapPercent);
    const quantityNeeded = itemQuantity * quantity * (1 + scrapPercent / 100);
    let useSubstitute = false;
    let selectedProduct = item.component;
    let currentStock = Number(item.component.stock ?? 0);

    // Verificar si necesita usar sustituto
    if (currentStock < quantityNeeded && item.substitutes.length > 0) {
      for (const sub of item.substitutes) {
        const subStock = Number(sub.substitute.stock ?? 0);
        const subRequired = quantityNeeded * Number(sub.quantityRatio);
        if (subStock >= subRequired) {
          useSubstitute = true;
          selectedProduct = sub.substitute;
          currentStock = subStock;
          materials.push({
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            sku: selectedProduct.sku,
            quantityNeeded: subRequired,
            currentStock,
            useSubstitute: true,
            substituteProduct: {
              id: selectedProduct.id,
              name: selectedProduct.name,
              stock: currentStock,
            },
          });
          break;
        }
      }
    }

    if (!useSubstitute) {
      materials.push({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        quantityNeeded,
        currentStock,
        useSubstitute: false,
      });
    }
  }

  return materials;
}
