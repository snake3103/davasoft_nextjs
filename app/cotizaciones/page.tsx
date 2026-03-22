"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Plus, Search, Filter, Download, X, Edit, Trash, CheckCircle2, Clock, Ban, AlertCircle, Loader2, FileCheck, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEstimates, useDeleteEstimate, useConvertToInvoice } from "@/hooks/useDatabase";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReprintModal } from "@/components/modals/ReprintModal";

export default function CotizacionesPage() {
    const router = useRouter();
    const { data: quotes = [], isLoading, refetch } = useEstimates();
    const deleteEstimate = useDeleteEstimate();
    const convertToInvoice = useConvertToInvoice();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("Todas");
    const [reprintQuote, setReprintQuote] = useState<any>(null);
    
    // Modal de eliminación
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; quote: any }>({ open: false, quote: null });
    
    // Modal de convertir a factura
    const [convertModal, setConvertModal] = useState<{ open: boolean; quote: any }>({ open: false, quote: null });

    const filteredQuotes = useMemo(() => {
        return quotes.filter((quote: any) => {
            const matchesSearch =
                quote.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quote.client?.name?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "Todas" || quote.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [quotes, searchQuery, statusFilter]);

    const handleDeleteClick = (quote: any) => {
        setDeleteModal({ open: true, quote });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.quote) return;
        try {
            await deleteEstimate.mutateAsync(deleteModal.quote.id);
            showToast("success", "Cotización eliminada exitosamente");
            setDeleteModal({ open: false, quote: null });
            refetch();
        } catch (error) {
            showToast("error", "Error al eliminar la cotización");
        }
    };

    const handleConvertClick = (quote: any) => {
        setConvertModal({ open: true, quote });
    };

    const handleConfirmConvert = async () => {
        if (!convertModal.quote) return;
        try {
            await convertToInvoice.mutateAsync(convertModal.quote.id);
            showToast("success", "Cotización convertida a factura exitosamente");
            setConvertModal({ open: false, quote: null });
            router.push("/ventas");
        } catch (error: any) {
            showToast("error", error.message || "Error al convertir a factura");
        }
    };

    const statuses = ["Todas", "DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"];

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            DRAFT: "Borrador",
            SENT: "Enviada",
            ACCEPTED: "Aceptada",
            REJECTED: "Rechazada",
            EXPIRED: "Vencida"
        };
        return labels[status] || status;
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Cotizaciones</h1>
                        <p className="text-slate-500 mt-1">Crea y gestiona tus presupuestos para clientes.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center">
                            <Download size={18} className="mr-2" />
                            Exportar
                        </button>
                        <Link
                            href="/cotizaciones/nueva"
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20"
                        >
                            <Plus size={18} className="mr-2" />
                            Nueva Cotización
                        </Link>
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
                                    {status === "Todas" ? "Todas" : getStatusLabel(status)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : filteredQuotes.length > 0 ? (
                    <Table headers={["Número", "Cliente", "Fecha", "Validez", "Total", "Estado", "Acciones"]}>
                        {filteredQuotes.map((quote: any) => (
                            <TableRow key={quote.id}>
                                <TableCell className="font-bold text-primary">{quote.number}</TableCell>
                                <TableCell className="font-medium text-slate-700">{quote.client?.name}</TableCell>
                                <TableCell>{new Date(quote.date).toLocaleDateString()}</TableCell>
                                <TableCell>{quote.dueDate ? new Date(quote.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell className="font-bold">${Number(quote.total).toLocaleString()}</TableCell>
                                <TableCell>
                                    <div className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                                        quote.status === "ACCEPTED" ? "bg-emerald-50 text-emerald-600" :
                                            quote.status === "REJECTED" ? "bg-rose-50 text-rose-600" :
                                                quote.status === "EXPIRED" ? "bg-slate-50 text-slate-400" :
                                                    quote.status === "SENT" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                                    )}>
                                        {quote.status === "ACCEPTED" && <CheckCircle2 size={12} className="mr-1" />}
                                        {quote.status === "REJECTED" && <Ban size={12} className="mr-1" />}
                                        {quote.status === "EXPIRED" && <AlertCircle size={12} className="mr-1" />}
                                        {quote.status === "SENT" && <Clock size={12} className="mr-1" />}
                                        {getStatusLabel(quote.status)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => setReprintQuote(quote)}
                                            className="p-1.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400 transition-colors"
                                            title="Reimprimir"
                                        >
                                            <Printer size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleConvertClick(quote)}
                                            className="p-1.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400 transition-colors"
                                            title="Facturar"
                                            disabled={convertToInvoice.isPending || quote.status === "ACCEPTED"}
                                        >
                                            <FileCheck size={16} />
                                        </button>
                                        <Link
                                            href={`/cotizaciones/${quote.id}/editar`}
                                            className="p-1.5 hover:bg-blue-50 hover:text-primary rounded-lg text-slate-400 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteClick(quote)}
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
                        <h3 className="text-lg font-bold text-slate-700">No se encontraron cotizaciones</h3>
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
                isOpen={!!reprintQuote}
                onClose={() => setReprintQuote(null)}
                invoice={reprintQuote}
                type="estimate"
            />

            <ConfirmDialog
                open={deleteModal.open}
                onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
                title="Eliminar Cotización"
                description={`¿Estás seguro de que deseas eliminar la cotización ${deleteModal.quote?.number}? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                onConfirm={handleConfirmDelete}
                loading={deleteEstimate.isPending}
            />

            <ConfirmDialog
                open={convertModal.open}
                onOpenChange={(open) => setConvertModal({ ...convertModal, open })}
                title="Convertir a Factura"
                description={`¿Deseas convertir la cotización ${convertModal.quote?.number} en una factura?`}
                confirmText="Convertir"
                onConfirm={handleConfirmConvert}
                loading={convertToInvoice.isPending}
                variant="info"
            />
        </AppLayout>
    );
}
