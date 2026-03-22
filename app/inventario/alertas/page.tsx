"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Bell, AlertTriangle, Package, Settings, RefreshCw, Check, X, ChevronRight, Eye, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLowStockAlerts, useUpdateProductAlert } from "@/hooks/useDatabase";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type AlertStatus = "out_of_stock" | "critical" | "low";

const statusConfig: Record<AlertStatus, { label: string; className: string; icon: any }> = {
  out_of_stock: {
    label: "Agotado",
    className: "bg-rose-100 text-rose-700 border-rose-200",
    icon: X,
  },
  critical: {
    label: "Crítico",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: AlertTriangle,
  },
  low: {
    label: "Bajo Stock",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Bell,
  },
};

export default function StockAlertsPage() {
  const { data: alerts, isLoading, isError, refetch } = useLowStockAlerts();
  const updateAlert = useUpdateProductAlert();
  
  const [filterStatus, setFilterStatus] = useState<AlertStatus | "all">("all");
  const [editingAlert, setEditingAlert] = useState<any>(null);
  const [editMinQuantity, setEditMinQuantity] = useState<number>(5);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Filtrar alertas
  const filteredAlerts = (alerts || []).filter((alert: any) => {
    if (filterStatus !== "all" && alert.status !== filterStatus) return false;
    if (dismissedAlerts.has(alert.id)) return false;
    return true;
  });

  // Estadísticas
  const stats = {
    total: (alerts || []).length,
    outOfStock: (alerts || []).filter((a: any) => a.status === "out_of_stock").length,
    critical: (alerts || []).filter((a: any) => a.status === "critical").length,
    low: (alerts || []).filter((a: any) => a.status === "low").length,
  };

  // Abrir diálogo de edición
  const handleEditAlert = (alert: any) => {
    setEditingAlert(alert);
    setEditMinQuantity(alert.alertConfig?.minQuantity || alert.minStock || 5);
  };

  // Guardar cambios
  const handleSaveAlert = async () => {
    if (!editingAlert) return;
    
    try {
      await updateAlert.mutateAsync({
        productId: editingAlert.id,
        minQuantity: editMinQuantity,
        isActive: true,
      });
      setEditingAlert(null);
      refetch();
    } catch (error) {
      console.error("Error saving alert:", error);
    }
  };

  // Descartar alerta
  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Bell className="text-amber-500" size={28} />
              Alertas de Stock
            </h1>
            <p className="text-slate-500 mt-1">Productos que requieren atención por bajo inventario.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center"
          >
            <RefreshCw size={18} className="mr-2" />
            Actualizar
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            className={cn(
              "bg-white p-4 rounded-xl border cursor-pointer transition-all",
              filterStatus === "all" ? "border-primary shadow-md" : "border-border hover:border-slate-300"
            )}
            onClick={() => setFilterStatus("all")}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Package size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div 
            className={cn(
              "bg-white p-4 rounded-xl border cursor-pointer transition-all",
              filterStatus === "out_of_stock" ? "border-rose-500 shadow-md" : "border-border hover:border-slate-300"
            )}
            onClick={() => setFilterStatus("out_of_stock")}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <X size={20} className="text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Agotados</p>
                <p className="text-xl font-bold text-rose-600">{stats.outOfStock}</p>
              </div>
            </div>
          </div>
          
          <div 
            className={cn(
              "bg-white p-4 rounded-xl border cursor-pointer transition-all",
              filterStatus === "critical" ? "border-red-500 shadow-md" : "border-border hover:border-slate-300"
            )}
            onClick={() => setFilterStatus("critical")}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Críticos</p>
                <p className="text-xl font-bold text-red-600">{stats.critical}</p>
              </div>
            </div>
          </div>
          
          <div 
            className={cn(
              "bg-white p-4 rounded-xl border cursor-pointer transition-all",
              filterStatus === "low" ? "border-amber-500 shadow-md" : "border-border hover:border-slate-300"
            )}
            onClick={() => setFilterStatus("low")}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Bell size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Bajo Stock</p>
                <p className="text-xl font-bold text-amber-600">{stats.low}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtro activo indicator */}
        {filterStatus !== "all" && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Filtrando por:</span>
            <span className={cn("px-2 py-1 rounded-md text-xs font-bold", statusConfig[filterStatus].className)}>
              {statusConfig[filterStatus].label}
            </span>
            <button
              onClick={() => setFilterStatus("all")}
              className="text-slate-400 hover:text-slate-600 ml-2"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Alerts Table */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <RefreshCw className="mx-auto text-slate-400 animate-spin" size={32} />
            <p className="text-slate-500 mt-2">Cargando alertas...</p>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-xl border border-rose-200 p-12 text-center">
            <AlertTriangle className="mx-auto text-rose-400" size={32} />
            <p className="text-rose-600 mt-2">Error al cargar alertas</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
            <Check className="mx-auto text-emerald-400" size={48} />
            <h3 className="text-lg font-bold text-slate-700 mt-4">¡Todo en orden!</h3>
            <p className="text-slate-500 mt-1">No hay productos con stock bajo.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <Table 
              headers={["Producto", "SKU", "Stock Actual", "Stock Mínimo", "Estado", "Acciones"]}
            >
              {filteredAlerts.map((alert: any) => {
                const config = statusConfig[alert.status as AlertStatus];
                const StatusIcon = config.icon;
                
                return (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Package size={20} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{alert.name}</p>
                          <p className="text-xs text-slate-400">{alert.category?.name || "Sin categoría"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {alert.sku || "-"}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-bold",
                        alert.stock === 0 ? "text-rose-600" : "text-amber-600"
                      )}>
                        {alert.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {alert.minStock}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-1 rounded-md text-xs font-bold border flex items-center gap-1", config.className)}>
                          <StatusIcon size={12} />
                          {config.label}
                        </span>
                        {alert.stockPercentage !== undefined && (
                          <span className="text-xs text-slate-400">
                            ({alert.stockPercentage}%)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditAlert(alert)}
                          className="p-2 hover:bg-blue-50 hover:text-primary rounded-lg text-slate-400 transition-colors"
                          title="Configurar alerta"
                        >
                          <Settings size={16} />
                        </button>
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
                          title="Descartar"
                        >
                          <X size={16} />
                        </button>
                        <Link
                          href={`/inventario/nuevo?id=${alert.id}`}
                          className="p-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400 transition-colors"
                          title="Editar producto"
                        >
                          <Edit size={16} />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </div>
        )}

        {/* Empty state para filtros */}
        {filteredAlerts.length === 0 && filterStatus !== "all" && !isLoading && (
          <div className="text-center py-8">
            <p className="text-slate-500">No hay alertas con el filtro seleccionado.</p>
            <button
              onClick={() => setFilterStatus("all")}
              className="mt-2 text-primary hover:underline text-sm"
            >
              Ver todas las alertas
            </button>
          </div>
        )}
      </div>

      {/* Dialog para editar alerta */}
      <Dialog open={!!editingAlert} onOpenChange={() => setEditingAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="text-primary" size={20} />
              Configurar Alerta
            </DialogTitle>
          </DialogHeader>
          
          {editingAlert && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-semibold text-slate-800">{editingAlert.name}</p>
                <p className="text-sm text-slate-500">Stock actual: {editingAlert.stock}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Cantidad mínima para alerta
                </label>
                <input
                  type="number"
                  min="1"
                  value={editMinQuantity}
                  onChange={(e) => setEditMinQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary/20 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
                <p className="text-xs text-slate-400">
                  Se mostrará una alerta cuando el stock sea igual o menor a esta cantidad.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <button
              onClick={() => setEditingAlert(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAlert}
              disabled={updateAlert.isPending}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {updateAlert.isPending ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Guardar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
