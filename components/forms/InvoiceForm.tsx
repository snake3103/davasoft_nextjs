"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import { Plus, Trash2, Calendar, User, FileText, Loader2, Search, Package, Save, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useClients, useProducts } from "@/hooks/useDatabase";
import { ContactSearch } from "@/components/ui/Autocomplete";

// ─── Product Autocomplete ──────────────────────────────────────────────────
interface ProductSearchProps {
    value: string;
    onSelect: (product: { name: string; price: number; id: string }) => void;
    onChange: (val: string) => void;
    products: any[];
}

function ProductSearch({ value, onSelect, onChange, products }: ProductSearchProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setQuery(value); }, [value]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = () => {
        if (!inputRef.current) return;
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownStyle({
            position: "fixed",
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
        });
        setOpen(true);
    };

    const filtered = query.trim().length === 0
        ? products
        : products.filter((p: any) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(query.toLowerCase()))
        );

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar producto..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={handleOpen}
                    className="bg-white border border-border rounded-lg w-full pl-8 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
            </div>
            {open && (
                <div style={dropdownStyle} className="bg-white border border-border rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-slate-400 italic">Sin resultados</div>
                    ) : (
                        filtered.map((p: any) => (
                            <button
                                key={p.id}
                                type="button"
                                onMouseDown={() => {
                                    setQuery(p.name);
                                    onSelect({ name: p.name, price: Number(p.price), id: p.id });
                                    setOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors flex items-center gap-3 group"
                            >
                                <span className="w-7 h-7 bg-blue-50 text-primary rounded-lg flex items-center justify-center shrink-0">
                                    <Package size={14} />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">{p.name}</p>
                                    {p.sku && <p className="text-[10px] text-slate-400">SKU: {p.sku}</p>}
                                </div>
                                <span className="text-sm font-bold text-primary shrink-0">
                                    ${Number(p.price).toLocaleString("es-CO")}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Form Component ──────────────────────────────────────────────────────
interface InvoiceFormProps {
    initialData?: any;
    action: (prevState: any, formData: FormData) => Promise<any>;
}

export default function InvoiceForm({ initialData, action }: InvoiceFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: clients = [] } = useClients();
    const { data: products = [] } = useProducts();
    const [state, formAction, isPending] = useActionState(action, null);

    const [formData, setFormData] = useState({
        clientId: initialData?.clientId ?? "",
        number: initialData?.number ?? `FE-${Math.floor(1000 + Math.random() * 9000)}`,
        date: initialData?.date
            ? new Date(initialData.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        dueDate: initialData?.dueDate
            ? new Date(initialData.dueDate).toISOString().split("T")[0]
            : "",
        items: initialData?.items?.length > 0
            ? initialData.items.map((i: any) => ({
                productId: i.productId ?? "",
                description: i.description ?? i.product?.name ?? "",
                quantity: i.quantity ?? 1,
                price: Number(i.price ?? 0),
                tax: Number(i.tax ?? 0),
                total: Number(i.total ?? 0),
            }))
            : [{ productId: "", description: "", quantity: 1, price: 0, tax: 0, total: 0 }],
        notes: initialData?.notes ?? "",
        status: initialData?.status ?? "DRAFT",
    });

    useEffect(() => {
        if (state?.success) {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            router.push("/ventas");
        }
    }, [state, router, queryClient]);

    const subtotal = formData.items.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0);
    const tax = subtotal * 0.19;
    const total = subtotal + tax;

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <form action={formAction}>
                <input type="hidden" name="clientId" value={formData.clientId} />
                <input type="hidden" name="items" value={JSON.stringify(formData.items)} />
                <input type="hidden" name="status" value={formData.status} />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                {initialData ? "Editar Factura" : "Nueva Factura"}
                            </h1>
                            <p className="text-slate-500 text-sm">#{formData.number}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 bg-white border border-border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 transition-all"
                        >
                            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {initialData ? "Guardar Cambios" : "Emitir Factura"}
                        </button>
                    </div>
                </div>

                {state?.error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-sm font-bold">
                        {state.error}
                    </div>
                )}

                <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center">
                                    <User size={16} className="mr-2 text-primary" /> Cliente
                                </label>
                                <ContactSearch
                                    value={clients.find((c: any) => c.id === formData.clientId)?.name || ""}
                                    contacts={clients.filter((c: any) => c.type === "CLIENT" || c.type === "BOTH")}
                                    onChange={(val: string) => {
                                        if (!val) setFormData({ ...formData, clientId: "" });
                                    }}
                                    onSelect={(c: any) => {
                                        setFormData({ ...formData, clientId: c.id });
                                    }}
                                    placeholder="Buscar o seleccionar cliente..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center">
                                        <Calendar size={16} className="mr-2 text-primary" /> Fecha
                                    </label>
                                    <input
                                        name="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Vencimiento</label>
                                    <input
                                        name="dueDate"
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-700 flex items-center">
                                    <FileText size={16} className="mr-2 text-primary" /> Ítems de la Factura
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, items: [...formData.items, { productId: "", description: "", quantity: 1, price: 0, tax: 0, total: 0 }] })}
                                    className="text-xs font-bold text-primary hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center"
                                >
                                    <Plus size={14} className="mr-1" /> Agregar Ítem
                                </button>
                            </div>

                            <div className="border border-border rounded-2xl overflow-hidden">
                                <div className="grid grid-cols-12 gap-2 p-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-border">
                                    <div className="col-span-5">Producto / Descripción</div>
                                    <div className="col-span-2 text-center">Cant.</div>
                                    <div className="col-span-2 text-center">Precio</div>
                                    <div className="col-span-2 text-right">Total (+IVA)</div>
                                    <div className="col-span-1" />
                                </div>
                                <div className="divide-y divide-border">
                                    {formData.items.map((item: any, index: number) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 p-4 items-center">
                                            <div className="col-span-5">
                                                <ProductSearch
                                                    value={item.description}
                                                    products={products}
                                                    onChange={(val) => updateItem(index, "description", val)}
                                                    onSelect={(p) => {
                                                        const items = [...formData.items];
                                                        items[index] = { ...items[index], productId: p.id, description: p.name, price: p.price };
                                                        setFormData({ ...formData, items });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                                    className="w-full bg-slate-50 border border-border rounded-lg text-center py-1.5 text-sm"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={item.price}
                                                    onChange={(e) => updateItem(index, "price", Number(e.target.value))}
                                                    className="w-full bg-slate-50 border border-border rounded-lg text-center py-1.5 text-sm"
                                                />
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <span className="text-sm font-bold text-slate-700">
                                                    ${(item.quantity * item.price * 1.19).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <div className="col-span-1 flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, items: formData.items.filter((_: any, i: number) => i !== index) })}
                                                    disabled={formData.items.length === 1}
                                                    className="text-slate-300 hover:text-rose-500 disabled:opacity-0 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between gap-8 pt-6 border-t border-border">
                            <div className="flex-1">
                                <label className="text-sm font-bold text-slate-700">Notas</label>
                                <textarea
                                    name="notes"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-slate-50 border border-border rounded-xl p-4 text-sm outline-none mt-2"
                                    placeholder="Condiciones de pago, etc..."
                                />
                            </div>
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>IVA (19%)</span>
                                    <span>${tax.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-border">
                                    <span className="text-lg font-bold text-slate-800">Total</span>
                                    <span className="text-2xl font-black text-primary">
                                        ${total.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
