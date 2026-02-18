"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Plus, Search, Filter, Download, MoreHorizontal, CheckCircle2, Clock, X, Edit, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuoteModal } from "@/components/modals/QuoteModal";

const initialQuotes = [
    { id: "COT-101", client: "Tech Solutions S.A.S", date: "17 Feb 2026", expiryDate: "17 Mar 2026", total: "$1,250.00", status: "Aceptada" },
    { id: "COT-102", client: "Almacenes Éxito", date: "16 Feb 2026", expiryDate: "16 Mar 2026", total: "$890.00", status: "Pendiente" },
    { id: "COT-103", client: "Inversiones Globales SAS", date: "15 Feb 2026", expiryDate: "15 Mar 2026", total: "$2,400.00", status: "Vencida" },
];

export default function CotizacionesPage() {
    const [quotes, setQuotes] = useState(initialQuotes);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("Todas");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState<any>(null);

    const filteredQuotes = useMemo(() => {
        return quotes.filter((quote) => {
            const matchesSearch =
                quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quote.client.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "Todas" || quote.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [quotes, searchQuery, statusFilter]);

    const handleSaveQuote = (formData: any) => {
        if (editingQuote) {
            setQuotes(quotes.map(q => q.id === editingQuote.id ? {
                ...q,
                client: formData.client,
                date: formData.date,
                expiryDate: formData.expiryDate,
                total: `$${formData.items.reduce((acc: any, item: any) => acc + (item.quantity * item.price), 0).toLocaleString()}`
            } : q));
        } else {
            const newQuote = {
                id: `COT-${Math.floor(Math.random() * 900) + 100}`,
                client: formData.client || "Cliente Nuevo",
                date: formData.date,
                expiryDate: formData.expiryDate || formData.date,
                total: `$${formData.items.reduce((acc: any, item: any) => acc + (item.quantity * item.price), 0).toLocaleString()}`,
                status: "Pendiente"
            };
            setQuotes([newQuote, ...quotes]);
        }
        setIsModalOpen(false);
        setEditingQuote(null);
    };

    const handleEdit = (quote: any) => {
        setEditingQuote(quote);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("¿Estás seguro de que deseas eliminar esta cotización?")) {
            setQuotes(quotes.filter(q => q.id !== id));
        }
    };

    const statuses = ["Todas", "Pendiente", "Aceptada", "Vencida"];

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
                        <button
                            onClick={() => { setEditingQuote(null); setIsModalOpen(true); }}
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20"
                        >
                            <Plus size={18} className="mr-2" />
                            Nueva Cotización
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

                {filteredQuotes.length > 0 ? (
                    <Table headers={["Número", "Cliente", "Fecha", "Validez", "Total", "Estado", "Acciones"]}>
                        {filteredQuotes.map((quote) => (
                            <TableRow key={quote.id}>
                                <TableCell className="font-bold text-primary">{quote.id}</TableCell>
                                <TableCell className="font-medium text-slate-700">{quote.client}</TableCell>
                                <TableCell>{quote.date}</TableCell>
                                <TableCell>{quote.expiryDate}</TableCell>
                                <TableCell className="font-bold">{quote.total}</TableCell>
                                <TableCell>
                                    <div className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                                        quote.status === "Aceptada" ? "bg-emerald-50 text-emerald-600" :
                                            quote.status === "Pendiente" ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                                    )}>
                                        {quote.status === "Aceptada" && <CheckCircle2 size={12} className="mr-1" />}
                                        {quote.status === "Pendiente" && <Clock size={12} className="mr-1" />}
                                        {quote.status}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => handleEdit(quote)}
                                            className="p-1.5 hover:bg-blue-50 hover:text-primary rounded-lg text-slate-400 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(quote.id)}
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

            <QuoteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveQuote}
                initialData={editingQuote}
            />
        </AppLayout>
    );
}
