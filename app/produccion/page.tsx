"use client";

import { useState, useEffect } from "react";
import { Plus, Package, Loader2, Calendar, AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductionOrderModal } from "@/components/production/ProductionOrderModal";

interface ProductionOrder {
  id: string;
  number: string;
  productId: string;
  product: {
    name: string;
    sku: string | null;
  };
  quantity: any;
  status: string;
  totalCost: any;
  plannedDate: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  reservations: Array<{
    id: string;
    productId: string;
    product: { name: string; stock: number };
    quantity: any;
    isSubstitute: boolean;
  }>;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  DRAFT: { label: "Borrador", color: "bg-slate-100 text-slate-600", icon: Clock },
  CONFIRMED: { label: "Confirmada", color: "bg-blue-100 text-blue-600", icon: CheckCircle2 },
  IN_PROGRESS: { label: "En Proceso", color: "bg-amber-100 text-amber-600", icon: Loader2 },
  DONE: { label: "Completada", color: "bg-emerald-100 text-emerald-600", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelada", color: "bg-rose-100 text-rose-600", icon: XCircle },
};

export default function ProductionPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/production-orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/production-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const filteredOrders = orders.filter(order => 
    filter === "all" || order.status === filter
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Órdenes de Producción</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona la fabricación de productos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          <Plus size={18} />
          Nueva Orden
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-slate-500">Estado:</span>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              filter === "all" ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Todos
          </button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                filter === key ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de órdenes */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Package size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No hay órdenes de producción</h3>
          <p className="text-sm text-slate-500 mb-4">
            Crea tu primera orden para comenzar a fabricar productos
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            Nueva Orden
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Orden</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Costo</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const config = statusConfig[order.status] || statusConfig.DRAFT;
                const StatusIcon = config.icon;
                const hasLowStock = order.reservations.some(r => r.product.stock < Number(r.quantity));
                
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">{order.number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium text-slate-700">{order.product.name}</span>
                        {order.product.sku && (
                          <span className="block text-xs text-slate-400">{order.product.sku}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-700">{Number(order.quantity)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", config.color)}>
                        <StatusIcon size={12} />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-700">
                        RD$ {Number(order.totalCost).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar size={14} />
                        {new Date(order.createdAt).toLocaleDateString("es-DO")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {hasLowStock && (
                          <span title="Algunos materiales tienen stock bajo">
                            <AlertTriangle size={16} className="text-amber-500" />
                          </span>
                        )}
                        
                        {/* Acciones según estado */}
                        {order.status === "DRAFT" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(order.id, "CONFIRMED")}
                              className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => handleStatusChange(order.id, "CANCELLED")}
                              className="px-3 py-1.5 bg-rose-500 text-white text-xs font-medium rounded-lg hover:bg-rose-600 transition-colors"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        
                        {order.status === "CONFIRMED" && (
                          <button
                            onClick={() => handleStatusChange(order.id, "IN_PROGRESS")}
                            className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors"
                          >
                            Iniciar
                          </button>
                        )}
                        
                        {order.status === "IN_PROGRESS" && (
                          <button
                            onClick={() => handleStatusChange(order.id, "DONE")}
                            className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                          >
                            Completar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProductionOrderModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
