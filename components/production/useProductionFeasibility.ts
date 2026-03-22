/**
 * Helper para verificar factibilidad de producción
 * Se usa desde el cliente a través de fetch
 */

export interface FeasibilityResult {
  canProduce: boolean;
  reasons: string[];
  totalCost: number;
  items: Array<{
    name: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    stockStatus: 'available' | 'low' | 'out';
    isOptional: boolean;
  }>;
}

export async function checkProductionFeasibility(productId: string, quantity: number): Promise<FeasibilityResult> {
  const res = await fetch("/api/production-orders/feasibility", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });
  
  if (!res.ok) {
    throw new Error("Error checking feasibility");
  }
  
  return res.json();
}
