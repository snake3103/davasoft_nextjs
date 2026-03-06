"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import { X, Plus, Trash2, Calendar, User, FileText, Loader2, Search, Package, Save, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useClients, useProducts } from "@/hooks/useDatabase";
import { useQueryClient } from "@tanstack/react-query";
import { ContactSearch } from "@/components/ui/Autocomplete";

// ─── Product Autocomplete ─────────────────────────────────────────────────────
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

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        onChange(e.target.value);
        setOpen(true);
    };

    const handleSelect = (product: any) => {
        setQuery(product.name);
        onSelect({ name: product.name, price: Number(product.price), id: product.id });
        setOpen(false);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar producto o escribir descripción..."
                    value={query}
                    onChange={handleInput}
                    onFocus={handleOpen}
                    className="bg-white border border-border rounded-lg w-full pl-8 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
            </div>
            {open && (
                <div style={dropdownStyle} className="bg-white border border-border rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-slate-400 italic">Sin resultados — se usará el texto como descripción libre</div>
                    ) : (
                        filtered.map((p: any) => (
                            <button
                                key={p.id}
                                type="button"
                                onMouseDown={() => handleSelect(p)}
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

interface EstimateFormProps {
    initialData?: any;
    action: (prevState: any, formData: FormData) => Promise<any>;
    title: string;
}

export function EstimateForm({ initialData, action, title }: EstimateFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: clients = [] } = useClients();
    const { data: products = [] } = useProducts();
    const [state, formAction, isPending] = useActionState(action, null);

    const mapItems = (rawItems: any[]) =>
        rawItems.map((item: any) => ({
            productId: item.productId ?? "",
            description: item.product?.name ?? item.description ?? "",
            quantity: item.quantity ?? 1,
            price: Number(item.price ?? 0),
            total: Number(item.total ?? 0),
        }));

    const [formData, setFormData] = useState({
        clientId: initialData?.clientId ?? "",
        number: initialData?.number ?? `COT-${Math.floor(Math.random() * 90000) + 10000}`,
        date: initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split("T")[0] : "",
        items: initialData?.items?.length > 0 ? mapItems(initialData.items) : [{ productId: "", description: "", quantity: 1, price: 0, total: 0 }],
        notes: initialData?.notes ?? "",
        status: initialData?.status ?? "DRAFT",
    });

    useEffect(() => {
        if (state?.success) {
            queryClient.invalidateQueries({ queryKey: ["estimates"] });
            router.push("/ventas/cotizaciones");
        }
    }, [state, router, queryClient]);

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: "", description: "", quantity: 1, price: 0, total: 0 }]
        });
    };

    const removeItem = (index: number) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === "quantity" || field === "price") {
            newItems[index].total = newItems[index].quantity * newItems[index].price;
        }
        setFormData({ ...formData, items: newItems });
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0);
    };

    return (
        <form action={formAction} className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* Inputs Ocultos para serialización */}
            <input type="hidden" name="clientId" value={formData.clientId} />
            <input type="hidden" name="items" value={JSON.stringify(formData.items)} />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
                        <p className="text-sm text-slate-500">Cotización # {formData.number}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {state?.error && (
                        <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-lg text-xs font-bold border border-rose-100 animate-in fade-in slide-in-from-top-1">
                            {state.error}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {isPending ? (
                            <Loader2 size={18} className="mr-2 animate-spin" />
                        ) : (
                            <Save size={18} className="mr-2" />
                        )}
                        Guardar Cotización
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    onSelect={(c: any) => setFormData({ ...formData, clientId: c.id })}
                                    placeholder="Buscar o seleccionar cliente..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center">
                                    <FileText size={16} className="mr-2 text-primary" /> Número de Cotización
                                </label>
                                <input
                                    type="text"
                                    name="number"
                                    value={formData.number}
                                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                    className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center">
                                    <Calendar size={16} className="mr-2 text-primary" /> Fecha
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center">
                                    <Calendar size={16} className="mr-2 text-primary" /> Vencimiento (Validez)
                                </label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-700">Conceptos y Productos</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-xs font-bold text-primary hover:bg-white px-3 py-1.5 rounded-lg border border-transparent hover:border-border transition-all flex items-center"
                            >
                                <Plus size={14} className="mr-1" /> Agregar Item
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-100/30 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-border">
                                        <th className="px-6 py-3 min-w-[300px]">Descripción / Producto</th>
                                        <th className="px-4 py-3 w-24 text-center">Cant.</th>
                                        <th className="px-4 py-3 w-40 text-center">Precio Unit.</th>
                                        <th className="px-6 py-3 w-40 text-right">Total</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {formData.items.map((item: any, index: number) => (
                                        <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <ProductSearch
                                                    value={item.description}
                                                    products={products}
                                                    onChange={(val) => updateItem(index, "description", val)}
                                                    onSelect={(product) => {
                                                        const newItems = [...formData.items];
                                                        newItems[index] = {
                                                            ...newItems[index],
                                                            description: product.name,
                                                            productId: product.id,
                                                            price: product.price,
                                                            total: Number(product.price) * newItems[index].quantity
                                                        };
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                                    className="w-full bg-white border border-border rounded-lg px-2 py-1.5 text-sm text-center focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(index, "price", Number(e.target.value))}
                                                        className="w-full bg-white border border-border rounded-lg pl-5 pr-2 py-1.5 text-sm text-center focus:ring-2 focus:ring-primary/20 outline-none"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-bold text-slate-700">
                                                    ${(item.quantity * item.price).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-6">
                        <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider">Resumen</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="font-semibold text-slate-700">${calculateSubtotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Impuestos (0%)</span>
                                <span className="font-semibold text-slate-700">$0</span>
                            </div>
                            <div className="pt-4 border-t border-border mt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-bold text-slate-800">Total</span>
                                    <span className="text-2xl font-black text-primary">${calculateSubtotal().toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option value="DRAFT">Borrador</option>
                                    <option value="SENT">Enviada</option>
                                    <option value="ACCEPTED">Aceptada</option>
                                    <option value="REJECTED">Rechazada</option>
                                    <option value="EXPIRED">Vencida</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Notas internas / Términos</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={4}
                                    className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                    placeholder="Agrega notas o condiciones para tu cliente..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
