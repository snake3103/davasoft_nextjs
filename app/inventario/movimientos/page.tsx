"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Package, 
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

const movementTypeLabels: Record<string, { label: string; color: string; icon: string }> = {
  PURCHASE: { label: "Compra", color: "text-green-600 bg-green-50", icon: "↑" },
  SALE: { label: "Venta", color: "text-red-600 bg-red-50", icon: "↓" },
  ADJUSTMENT_IN: { label: "Ajuste (+)", color: "text-blue-600 bg-blue-50", icon: "+" },
  ADJUSTMENT_OUT: { label: "Ajuste (-)", color: "text-orange-600 bg-orange-50", icon: "-" },
  RETURN_IN: { label: "Devolución (+)", color: "text-purple-600 bg-purple-50", icon: "↩" },
  RETURN_OUT: { label: "Devolución (-)", color: "text-rose-600 bg-rose-50", icon: "↪" },
  TRANSFER_IN: { label: "Transferencia (+)", color: "text-cyan-600 bg-cyan-50", icon: "→" },
  TRANSFER_OUT: { label: "Transferencia (-)", color: "text-amber-600 bg-amber-50", icon: "←" },
};

interface Movement {
  id: string;
  productId: string;
  product: { name: string; sku: string };
  type: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  reference: string | null;
  notes: string | null;
  createdAt: string;
  runningStock?: number;
  avgCost?: number;
  totalValue?: number;
}

interface Valuation {
  productId: string;
  productName: string;
  sku: string | null;
  currentStock: number;
  avgCost: number;
  totalValue: number;
  minStock: number;
  needsRestock: boolean;
}

export default function InventoryMovementsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"movements" | "valuation" | "alerts">("movements");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("");

  const { data: movements, isLoading: isLoadingMovements, error: movementsError } = useQuery({
    queryKey: ["inventory-movements", selectedProductId, filterType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedProductId) params.set("productId", selectedProductId);
      if (filterType) params.set("type", filterType);
      const res = await fetch(`/api/inventory/movements?${params}`);
      if (!res.ok) throw new Error("Error fetching movements");
      return res.json();
    },
    retry: false,
  });

  const { data: valuation } = useQuery({
    queryKey: ["inventory-valuation"],
    queryFn: async () => {
      const res = await fetch("/api/inventory?type=valuation");
      if (!res.ok) throw new Error("Error fetching valuation");
      return res.json();
    },
    enabled: activeTab === "valuation",
  });

  const { data: lowStock } = useQuery({
    queryKey: ["low-stock"],
    queryFn: async () => {
      const res = await fetch("/api/inventory?type=lowstock");
      if (!res.ok) throw new Error("Error fetching low stock");
      return res.json();
    },
    enabled: activeTab === "alerts",
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Error fetching products");
      return res.json();
    },
    retry: false,
  });

  const createMovement = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/inventory/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error creating movement");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-valuation"] });
      queryClient.invalidateQueries({ queryKey: ["low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMovement.mutate({
      productId: formData.get("productId"),
      type: formData.get("type"),
      quantity: Number(formData.get("quantity")),
      unitCost: Number(formData.get("unitCost")),
      reference: formData.get("reference") || null,
      notes: formData.get("notes") || null,
    });
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
            <p className="text-gray-500 mt-1">Movimientos, valoración y control de stock</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            Nuevo Movimiento
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: "movements", label: "Movimientos", icon: RefreshCw },
            { id: "valuation", label: "Valoración", icon: DollarSign },
            { id: "alerts", label: "Alertas de Stock", icon: AlertTriangle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "movements" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Todos los productos</option>
                  {products?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.sku ? `(${p.sku})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Todos los tipos</option>
                <option value="PURCHASE">Compras</option>
                <option value="SALE">Ventas</option>
                <option value="ADJUSTMENT_IN">Ajuste (+)</option>
                <option value="ADJUSTMENT_OUT">Ajuste (-)</option>
              </select>
            </div>

            {isLoadingMovements ? (
              <div className="p-8 text-center text-gray-500">Cargando...</div>
            ) : movementsError ? (
              <div className="p-8 text-center text-red-500">
                Error al cargar movimientos. Por favor, verifica que estés autenticado.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {Array.isArray(movements) && movements.length > 0 ? (
                  movements.map((m: Movement) => (
                    <div key={m.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                        movementTypeLabels[m.type]?.color || "bg-gray-100"
                      )}>
                        {movementTypeLabels[m.type]?.icon || "?"}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{m.product?.name || "Producto"}</p>
                        <p className="text-sm text-gray-500">
                          {movementTypeLabels[m.type]?.label || m.type}
                          {m.reference && ` • Ref: ${m.reference}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-bold",
                          ["PURCHASE", "ADJUSTMENT_IN", "RETURN_IN", "TRANSFER_IN"].includes(m.type)
                            ? "text-green-600"
                            : "text-red-600"
                        )}>
                          {["PURCHASE", "ADJUSTMENT_IN", "RETURN_IN", "TRANSFER_IN"].includes(m.type) ? "+" : "-"}
                          {m.quantity}
                        </p>
                        <p className="text-sm text-gray-500">${Number(m.unitCost).toFixed(2)} c/u</p>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-medium text-gray-900">
                          {m.runningStock !== undefined ? m.runningStock : m.product?.name ? "Ver stock" : "-"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(m.createdAt).toLocaleDateString("es-DO")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No hay movimientos registrados
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "valuation" && (
          <div className="space-y-6">
            {valuation?.summary && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Package className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Productos</p>
                      <p className="text-2xl font-bold">{valuation.summary.totalProducts}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <DollarSign className="text-green-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Valor Total</p>
                      <p className="text-2xl font-bold">${Number(valuation.summary.totalValue).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <AlertTriangle className="text-amber-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Por Reponer</p>
                      <p className="text-2xl font-bold">{valuation.summary.productsNeedingRestock}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Producto</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">Stock</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">Costo Prom.</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">Valor Total</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">Mín. Stock</th>
                    <th className="text-center px-6 py-3 font-medium text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {valuation?.valuation?.map((v: Valuation) => (
                    <tr key={v.productId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{v.productName}</p>
                        <p className="text-sm text-gray-500">{v.sku}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">{v.currentStock}</td>
                      <td className="px-6 py-4 text-right">${Number(v.avgCost).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold">${Number(v.totalValue).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-gray-500">{v.minStock}</td>
                      <td className="px-6 py-4 text-center">
                        {v.needsRestock ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Reponer
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {lowStock && lowStock.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {lowStock.map((p: any) => (
                  <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="text-red-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-sm text-gray-500">{p.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{p.stock} unidades</p>
                      <p className="text-sm text-gray-500">Mínimo: {p.minStock}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="text-green-600" size={32} />
                </div>
                <p className="text-lg font-medium text-gray-900">Todo en orden</p>
                <p className="text-gray-500">No hay productos bajo el stock mínimo</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo Movimiento de Inventario</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                <select
                  name="productId"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Seleccionar producto</option>
                  {products?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento</label>
                <select
                  name="type"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="PURCHASE">Compra</option>
                  <option value="SALE">Venta</option>
                  <option value="ADJUSTMENT_IN">Ajuste (+)</option>
                  <option value="ADJUSTMENT_OUT">Ajuste (-)</option>
                  <option value="RETURN_IN">Devolución (+)</option>
                  <option value="RETURN_OUT">Devolución (-)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo Unitario</label>
                  <input
                    type="number"
                    name="unitCost"
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referencia (opcional)</label>
                <input
                  type="text"
                  name="reference"
                  placeholder="N° factura, orden, etc."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMovement.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {createMovement.isPending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AppLayout>
  );
}
