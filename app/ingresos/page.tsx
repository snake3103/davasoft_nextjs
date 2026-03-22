"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Plus, Search, Download, CheckCircle2, Clock, Edit, Trash2, TrendingUp } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useIncomes, useDeleteIncome } from "@/hooks/useDatabase";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import Link from "next/link";

export default function IngresosPage() {
  const { data: incomes, isLoading, refetch } = useIncomes();
  const deleteIncome = useDeleteIncome();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal de eliminación
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; income: any }>({ open: false, income: null });

  const handleDeleteClick = (income: any) => {
    setDeleteModal({ open: true, income });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.income) return;
    try {
      await deleteIncome.mutateAsync(deleteModal.income.id);
      showToast("success", "Ingreso eliminado exitosamente");
      setDeleteModal({ open: false, income: null });
      refetch();
    } catch (error: any) {
      showToast("error", error.message || "Error al eliminar");
    }
  };

  const filteredIncomes = useMemo(() => {
    if (!incomes) return [];
    return incomes.filter((income: any) =>
      income.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      income.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      income.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [incomes, searchQuery]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "Pendiente",
      RECEIVED: "Recibido",
      CANCELLED: "Anulado"
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: "Efectivo",
      BANK_TRANSFER: "Transferencia",
      CREDIT_CARD: "Tarjeta",
      OTHER: "Otro"
    };
    return labels[method] || method;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Ingresos</h1>
            <p className="text-slate-500 mt-1">Registra y controla los ingresos de tu empresa.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center">
              <Download size={18} className="mr-2" />
              Exportar
            </button>
            <Link
              href="/ingresos/nuevo"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center shadow-sm"
            >
              <Plus size={18} className="mr-2" />
              Nuevo Ingreso
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por número, descripción o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-transparent rounded-lg py-2 pl-10 pr-4 text-sm focus:bg-white focus:border-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 italic">Cargando ingresos...</div>
        ) : filteredIncomes.length > 0 ? (
          <Table headers={["Número", "Descripción", "Cliente", "Fecha", "Método", "Total", "Estado", "Acciones"]}>
            {filteredIncomes.map((income: any) => (
              <TableRow key={income.id}>
                <TableCell className="font-bold text-emerald-600">{income.number}</TableCell>
                <TableCell className="font-medium text-slate-700 max-w-xs truncate">
                  {income.description}
                </TableCell>
                <TableCell className="text-slate-600">
                  {income.client?.name || "-"}
                </TableCell>
                <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {getPaymentMethodLabel(income.paymentMethod)}
                  </span>
                </TableCell>
                <TableCell className="font-bold text-emerald-600">{formatCurrency(income.amount)}</TableCell>
                <TableCell>
                  <div className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                    income.status === "RECEIVED" ? "bg-emerald-50 text-emerald-600" : 
                      income.status === "PENDING" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {income.status === "RECEIVED" && <CheckCircle2 size={12} className="mr-1" />}
                    {income.status === "PENDING" && <Clock size={12} className="mr-1" />}
                    {getStatusLabel(income.status)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleDeleteClick(income)}
                      className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-300 mb-4">
              <TrendingUp size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No hay ingresos registrados</h3>
            <p className="text-slate-500 mt-1">Registra tu primer ingreso para comenzar a controlar tus finanzas.</p>
            <Link
              href="/ingresos/nuevo"
              className="mt-6 inline-flex items-center px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus size={18} className="mr-2" />
              Registrar Ingreso
            </Link>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        title="Eliminar Ingreso"
        description={`¿Estás seguro de que deseas eliminar el ingreso ${deleteModal.income?.number}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={handleConfirmDelete}
        loading={deleteIncome.isPending}
      />
    </AppLayout>
  );
}
