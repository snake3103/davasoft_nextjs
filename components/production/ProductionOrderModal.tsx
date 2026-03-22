"use client";

import { useState, useEffect } from "react";
import { X, Search, Package, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { checkProductionFeasibility, FeasibilityResult } from "@/components/production/useProductionFeasibility";

interface ProductionOrderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  productType: string;
}

export function ProductionOrderModal({ onClose, onSuccess }: ProductionOrderModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [plannedDate, setPlannedDate] = useState("");
  
  const [feasibility, setFeasibility] = useState<FeasibilityResult | null>(null);
  const [checkingFeasibility, setCheckingFeasibility] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct && quantity > 0) {
      checkFeasibility();
    } else {
      setFeasibility(null);
    }
  }, [selectedProduct, quantity]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?type=FINISHED,SEMI_FINISHED");
      if (res.ok) {
        const data = await res.json();
        // Filter products that have a Bill of Materials
        const manufacturable = data.filter((p: Product) => 
          p.productType === "FINISHED" || p.productType === "SEMI_FINISHED"
        );
        setProducts(manufacturable);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkFeasibility = async () => {
    if (!selectedProduct) return;
    
    setCheckingFeasibility(true);
    try {
      const result = await checkProductionFeasibility(selectedProduct.id, quantity);
      // La API ya devuelve el costo total para la cantidad solicitada
      setFeasibility(result);
    } catch (error) {
      console.error("Error checking feasibility:", error);
    } finally {
      setCheckingFeasibility(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProduct || quantity <= 0) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/production-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity,
          notes,
          plannedDate: plannedDate || null,
        }),
      });

      if (res.ok) {
        showToast("success", "Orden de producción creada exitosamente");
        onSuccess();
      } else {
        const error = await res.json();
        showToast("error", error.error || "Error al crear la orden");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      showToast("error", "Error al crear la orden");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Nueva Orden de Producción</h2>
            <p className="text-sm text-slate-500">Selecciona el producto a fabricar</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Product Selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Producto a Fabricar</label>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all",
                      selectedProduct?.id === product.id
                        ? "bg-primary/5 border-primary/30"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        selectedProduct?.id === product.id ? "bg-primary/20" : "bg-slate-200"
                      )}>
                        <Package size={18} className={selectedProduct?.id === product.id ? "text-primary" : "text-slate-500"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{product.name}</p>
                        {product.sku && (
                          <p className="text-xs text-slate-400">{product.sku}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Cantidad a Producir</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Fecha Planeada (opcional)</label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones o instrucciones especiales..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          {/* Feasibility Check */}
          {selectedProduct && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-700">Verificación de Materiales</h3>
                {checkingFeasibility && <Loader2 size={14} className="animate-spin text-slate-400" />}
              </div>

              {feasibility && (
                <div className={cn(
                  "rounded-xl border p-4",
                  feasibility.canProduce 
                    ? "bg-emerald-50 border-emerald-200" 
                    : "bg-amber-50 border-amber-200"
                )}>
                  {/* Status */}
                  <div className="flex items-center gap-2 mb-3">
                    {feasibility.canProduce ? (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    ) : (
                      <AlertTriangle size={18} className="text-amber-600" />
                    )}
                    <span className={cn(
                      "text-sm font-bold",
                      feasibility.canProduce ? "text-emerald-700" : "text-amber-700"
                    )}>
                      {feasibility.canProduce 
                        ? "✓ Todos los materiales disponibles"
                        : "⚠️ Hay problemas con algunos materiales"
                      }
                    </span>
                  </div>

                  {/* Warnings */}
                  {feasibility.reasons.length > 0 && (
                    <ul className="space-y-1 mb-3">
                      {feasibility.reasons.map((reason, idx) => (
                        <li key={idx} className="text-xs text-amber-700 flex items-center gap-1">
                          <span>•</span> {reason}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Materials List */}
                  <div className="space-y-2">
                    {feasibility.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            item.stockStatus === "out" ? "bg-rose-500" :
                            item.stockStatus === "low" ? "bg-amber-500" : "bg-emerald-500"
                          )} />
                          <span className="text-slate-600">
                            {item.quantity.toFixed(2)}x {item.name}
                          </span>
                          {item.isOptional && (
                            <span className="text-[10px] text-slate-400">(opcional)</span>
                          )}
                        </div>
                        <span className="font-medium text-slate-600">
                          RD$ {item.totalCost.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total Cost */}
                  <div className="border-t border-emerald-200/50 mt-3 pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-700">Costo Total:</span>
                    <span className="text-lg font-bold text-emerald-600">
                      RD$ {feasibility.totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedProduct || quantity <= 0 || submitting}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Package size={16} />
                Crear Orden
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
