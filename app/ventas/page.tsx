"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Plus, Search, Filter, Download, MoreHorizontal, CheckCircle2, Clock, X, Edit, Trash, Printer, FileText } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useInvoices, useDeleteInvoice } from "@/hooks/useDatabase";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useRouter } from "next/navigation";
import { ReprintModal } from "@/components/modals/ReprintModal";

export default function VentasPage() {
  const router = useRouter();
  const { data: invoices, isLoading, refetch } = useInvoices();
  const deleteInvoice = useDeleteInvoice();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todas");
  const [reprintInvoice, setReprintInvoice] = useState<any>(null);
  
  // Modal de eliminación
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; invoice: any }>({ open: false, invoice: null });

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter((invoice: any) => {
      const matchesSearch =
        invoice.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "Todas" ||
        (statusFilter === "Pagada" && invoice.status === "PAID") ||
        (statusFilter === "Abierta" && ["DRAFT", "SENT"].includes(invoice.status)) ||
        (statusFilter === "Vencida" && invoice.status === "OVERDUE") ||
        (statusFilter === "Parcial" && invoice.status === "PARTIAL");

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const handleEdit = (invoice: any) => {
    router.push(`/ventas/${invoice.id}/editar`);
  };

  const handleDeleteClick = (invoice: any) => {
    setDeleteModal({ open: true, invoice });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.invoice) return;
    try {
      await deleteInvoice.mutateAsync(deleteModal.invoice.id);
      showToast("success", "Factura eliminada exitosamente");
      setDeleteModal({ open: false, invoice: null });
      refetch();
    } catch (error: any) {
      showToast("error", error.message || "Error al eliminar");
    }
  };

  const statuses = ["Todas", "Pagada", "Abierta", "Vencida", "Parcial"];


  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Facturas de Venta</h1>
            <p className="text-slate-500 mt-1">Gestiona tus ingresos y facturación de clientes.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center">
              <Download size={18} className="mr-2" />
              Exportar
            </button>
            <button
              onClick={() => router.push("/ventas/nueva")}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20"
            >
              <Plus size={18} className="mr-2" />
              Nueva Factura
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por número o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-transparent rounded-lg py-2 pl-10 pr-10 text-sm focus:bg-white focus:border-primary/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-100">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap",
                    statusFilter === status
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 italic">Cargando facturas...</div>
        ) : filteredInvoices.length > 0 ? (
          <Table headers={["Número", "Cliente", "Fecha", "Vencimiento", "Total", "Saldo", "Estado", "Acciones"]}>
            {filteredInvoices.map((invoice: any) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-bold text-primary">#{invoice.number}</TableCell>
                <TableCell className="font-medium text-slate-700">{invoice.client?.name}</TableCell>
                <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                <TableCell>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}</TableCell>
                <TableCell className="font-bold">${Number(invoice.total).toLocaleString()}</TableCell>
                <TableCell className={cn("font-medium", invoice.balance > 0 ? "text-rose-600" : "text-slate-600")}>
                  {formatCurrency(invoice.balance)}
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                    invoice.status === "PAID" ? "bg-emerald-50 text-emerald-600" :
                      ["DRAFT", "SENT"].includes(invoice.status) ? "bg-blue-50 text-blue-600" :
                        invoice.status === "OVERDUE" ? "bg-rose-50 text-rose-600" : 
                          invoice.status === "PARTIAL" ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-600"
                  )}>
                    {invoice.status === "PAID" && <CheckCircle2 size={12} className="mr-1" />}
                    {["DRAFT", "SENT"].includes(invoice.status) && <Clock size={12} className="mr-1" />}
                    {invoice.status === "PAID" ? "Pagada" :
                      invoice.status === "DRAFT" ? "Borrador" :
                        invoice.status === "SENT" ? "Abierta" :
                          invoice.status === "PARTIAL" ? "Parcial" :
                            invoice.status === "OVERDUE" ? "Vencida" : invoice.status}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setReprintInvoice(invoice)}
                      className="p-1.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400 transition-colors"
                      title="Reimprimir"
                    >
                      <Printer size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(invoice)}
                      className="p-1.5 hover:bg-blue-50 hover:text-primary rounded-lg text-slate-400 transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(invoice)}
                      className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No se encontraron facturas</h3>
            <p className="text-slate-500 mt-1">Intenta ajustar tus filtros o términos de búsqueda.</p>
            <button
              onClick={() => { setSearchQuery(""); setStatusFilter("Todas"); }}
              className="mt-6 text-primary font-bold hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <ReprintModal
        isOpen={!!reprintInvoice}
        onClose={() => setReprintInvoice(null)}
        invoice={reprintInvoice}
        type="invoice"
      />

      <ConfirmDialog
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        title="Eliminar Factura"
        description={`¿Estás seguro de que deseas eliminar la factura ${deleteModal.invoice?.number}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={handleConfirmDelete}
        loading={deleteInvoice.isPending}
      />

    </AppLayout>
  );
}
