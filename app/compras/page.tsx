"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Plus, Search, Filter, Download, X, Edit, Trash, ShoppingBag, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExpenses } from "@/hooks/useDatabase"; // We'll use expenses for Compras
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ComprasPage() {
    const { data: expenses = [], isLoading } = useExpenses();
    const [searchQuery, setSearchQuery] = useState("");

    // Consider dynamic filtering for "Compras" vs "Gastos Generales" if needed
    // For now, list all to show the entries
    const filteredCompras = useMemo(() => {
        return expenses.filter((expense: any) => {
            const matchesSearch =
                expense.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                expense.provider.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [expenses, searchQuery]);

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
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : filteredCompras.length > 0 ? (
                    <Table headers={["Número", "Proveedor", "Fecha", "Total", "Estado", "Acciones"]}>
                        {filteredCompras.map((expense: any) => (
                            <TableRow key={expense.id}>
                                <TableCell className="font-bold text-primary">{expense.number}</TableCell>
                                <TableCell className="font-medium text-slate-700">{expense.provider}</TableCell>
                                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                <TableCell className="font-bold">${Number(expense.total).toLocaleString()}</TableCell>
                                <TableCell>
                                    <div className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                                        expense.status === "PAID" ? "bg-emerald-50 text-emerald-600" :
                                            expense.status === "PENDING" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                    )}>
                                        {getStatusLabel(expense.status)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                            <Edit size={16} />
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
        </AppLayout>
    );
}
