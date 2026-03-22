"use client";

import { DollarSign } from "lucide-react";

interface MaterialCostSummaryProps {
    items: Array<{
        componentId: string;
        componentName?: string;
        quantity: number;
        scrapPercent?: number;
    }>;
    products: any[];
}

export function MaterialCostSummary({ items, products }: MaterialCostSummaryProps) {
    const validItems = items.filter(item => item.componentId);
    if (validItems.length === 0) return null;

    let totalCost = 0;
    const itemsWithCost = validItems.map(item => {
        const product = products.find((p: any) => p.id === item.componentId);
        const unitPrice = product ? Number(product.price) : 0;
        const quantityWithScrap = item.quantity * (1 + (item.scrapPercent || 0) / 100);
        const itemCost = unitPrice * quantityWithScrap;
        totalCost += itemCost;
        return { ...item, itemCost, unitPrice };
    });

    return (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-2">
                    <DollarSign size={14} />
                    Costo de Materiales
                </h4>
                <span className="text-[10px] text-emerald-500">Calculado automáticamente</span>
            </div>
            
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {itemsWithCost.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">{item.quantity}x</span>
                            <span className="text-slate-700 truncate max-w-[200px]">{item.componentName}</span>
                            {item.scrapPercent && item.scrapPercent > 0 && (
                                <span className="text-[10px] text-amber-500">(+{item.scrapPercent}% desc.)</span>
                            )}
                        </div>
                        <span className="font-medium text-slate-600">
                            RD$ {item.itemCost.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="border-t border-emerald-200 pt-3 flex items-center justify-between">
                <div>
                    <span className="text-sm font-bold text-emerald-700">Costo Total:</span>
                    <p className="text-[10px] text-emerald-500">RD$ {totalCost.toFixed(2)}</p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-emerald-500">Margen sugerido (30%):</span>
                    <p className="text-sm font-bold text-emerald-600">RD$ {(totalCost * 1.3).toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}
