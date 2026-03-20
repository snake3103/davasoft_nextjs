"use client";

import { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Plus, Search, Car, Wrench, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkOrders, useUpdateWorkOrderStatus, useDeleteWorkOrder } from "@/hooks/useDatabase";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  DELIVERED: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En Proceso",
  COMPLETED: "Completada",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
};

export default function WorkOrdersPage() {
  const { data: workOrders = [], isLoading } = useWorkOrders();
  const updateStatus = useUpdateWorkOrderStatus();
  const deleteWorkOrder = useDeleteWorkOrder();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = workOrders.filter((order: any) => {
    const matchesSearch = 
      order.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vehicle?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vehicle?.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vehicle?.plates?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
    } catch (error: any) {
      alert("Error al cambiar estado: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta orden de servicio?")) {
      try {
        await deleteWorkOrder.mutateAsync(id);
      } catch (error: any) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="w-4 h-4" />;
      case "IN_PROGRESS": return <Wrench className="w-4 h-4" />;
      case "COMPLETED": return <CheckCircle className="w-4 h-4" />;
      case "DELIVERED": return <CheckCircle className="w-4 h-4" />;
      case "CANCELLED": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const statuses = ["all", "PENDING", "IN_PROGRESS", "COMPLETED", "DELIVERED", "CANCELLED"];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Órdenes de Servicio</h1>
            <p className="text-slate-500 mt-1">Gestión de recepción de vehículos y talleres.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/ordenes-servicio/nuevo"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20"
            >
              <Plus size={18} className="mr-2" />
              Nueva Orden
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full bg-white p-1 rounded-xl border border-border flex items-center shadow-sm">
            <div className="flex items-center px-4 space-x-2 border-r border-border mr-2 min-w-[140px]">
              <select
                className="bg-transparent text-xs font-bold text-slate-400 uppercase outline-none cursor-pointer w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map(s => (
                  <option key={s} value={s}>
                    {s === "all" ? "Todos" : statusLabels[s]}
                  </option>
                ))}
              </select>
            </div>
            <Search className="text-slate-400 ml-2" size={18} />
            <input
              type="text"
              placeholder="Buscar por número, vehículo, placa o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-3 outline-none text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Cargando...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Car className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No hay órdenes de servicio</p>
          </div>
        ) : (
          <Table headers={["Orden", "Fecha", "Cliente", "Vehículo", "Estado", "Acciones"]}>
            {filteredOrders.map((order: any) => (
              <TableRow key={order.id} className="hover:bg-slate-50">
                <TableCell>
                  <div className="font-medium text-slate-800">{order.number}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-slate-600">
                    {new Date(order.entryDate).toLocaleDateString("es-DO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{order.client?.name}</div>
                  <div className="text-xs text-slate-500">{order.client?.phone}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Car className="w-4 h-4 mr-2 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium">
                        {order.vehicle?.brand} {order.vehicle?.model}
                      </div>
                      {order.vehicle?.plates && (
                        <div className="text-xs text-slate-500">{order.vehicle.plates}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    statusColors[order.status]
                  )}>
                    {getStatusIcon(order.status)}
                    {statusLabels[order.status]}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs border border-border rounded px-2 py-1 bg-white"
                    >
                      {statuses.filter(s => s !== "all").map(s => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}

        <div className="text-sm text-slate-500 text-center">
          Total: {filteredOrders.length} órdenes de servicio
        </div>
      </div>
    </AppLayout>
  );
}