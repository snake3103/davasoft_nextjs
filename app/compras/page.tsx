"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Plus, Search, Download, Edit, Trash, ShoppingBag, Loader2, CheckCircle2, Clock, X, AlertTriangle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { usePurchases, useDeletePurchase } from "@/hooks/useDatabase";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

export default function ComprasPage() {
    const { data: purchases = [], isLoading, refetch } = usePurchases();
    const deletePurchase = useDeletePurchase();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    
    // Modal de confirmación de eliminación
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; purchase: any }>({ open: false, purchase: null });
    const [deleting, setDeleting] = useState(false);

    const handleDeleteClick = (purchase: any) => {
        setDeleteModal({ open: true, purchase });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.purchase) return;
        setDeleting(true);
        try {
            await deletePurchase.mutateAsync(deleteModal.purchase.id);
            showToast("success", "Compra eliminada exitosamente");
            setDeleteModal({ open: false, purchase: null });
            refetch();
        } catch (error: any) {
            showToast("error", error.message || "Error al eliminar");
        } finally {
            setDeleting(false);
        }
    };

    const filteredCompras = useMemo(() => {
        return purchases.filter((purchase: any) =>
            purchase.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            purchase.provider?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [purchases, searchQuery]);

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            PENDING: "Pendiente",
            PAID: "Pagado",
            CANCELLED: "Anulado"
        };
        return labels[status] || status;
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Facturas de Compra</h1>
                        <p className="text-slate-500 mt-1">Registra las adquisiciones de productos de tus proveedores.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center">
                            <Download size={18} className="mr-2" />
                            Exportar
                        </button>
                        <Link
                            href="/compras/nueva"
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20"
                        >
                            <Plus size={18} className="mr-2" />
                            Nueva Factura de Compra
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por número o proveedor..."
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
                    <button
                        onClick={() => refetch()}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                        title="Actualizar"
                    >
                        <Loader2 size={18} className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : filteredCompras.length > 0 ? (
                    <Table headers={["Número", "Proveedor", "Fecha", "Categoría", "Total", "Estado", "Acciones"]}>
                        {filteredCompras.map((purchase: any) => (
                            <TableRow key={purchase.id}>
                                <TableCell className="font-bold text-primary">{purchase.number}</TableCell>
                                <TableCell className="font-medium text-slate-700">{purchase.provider}</TableCell>
                                <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                        {purchase.category?.name || "Compra"}
                                    </span>
                                </TableCell>
                                <TableCell className="font-bold">{formatCurrency(purchase.total)}</TableCell>
                                <TableCell>
                                    <div className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                                        purchase.status === "PAID" ? "bg-emerald-50 text-emerald-600" :
                                            purchase.status === "PENDING" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                    )}>
                                        {purchase.status === "PAID" && <CheckCircle2 size={12} className="mr-1" />}
                                        {purchase.status === "PENDING" && <Clock size={12} className="mr-1" />}
                                        {getStatusLabel(purchase.status)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link
                                            href={`/compras/nueva?edit=${purchase.id}`}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteClick(purchase)}
                                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
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
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No hay facturas de compra registradas</h3>
                        <p className="text-slate-500 mt-1">Registra tu primera compra para alimentar tu inventario.</p>
                        <Link
                            href="/compras/nueva"
                            className="mt-6 inline-flex items-center px-6 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors"
                        >
                            <Plus size={18} className="mr-2" />
                            Registrar Compra
                        </Link>
                    </div>
                )}
            </div>

            {/* Modal de confirmación de eliminación */}
            <Dialog open={deleteModal.open} onOpenChange={() => setDeleteModal({ open: false, purchase: null })}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <AlertTriangle size={24} />
                            Eliminar Compra
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-slate-600">
                            ¿Estás seguro de que deseas eliminar la factura <strong>{deleteModal.purchase?.number}</strong> de <strong>{deleteModal.purchase?.provider}</strong>?
                        </p>
                        <p className="text-sm text-slate-400 mt-2">Esta acción no se puede deshacer.</p>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteModal({ open: false, purchase: null })}>
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <>
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                <>
                                    <Trash size={16} className="mr-2" />
                                    Eliminar
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
