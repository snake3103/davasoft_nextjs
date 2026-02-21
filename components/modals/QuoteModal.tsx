"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, Calendar, User, FileText, Loader2, Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";

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

    // Sync external value changes (e.g. when form resets)
    useEffect(() => { setQuery(value); }, [value]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Compute fixed position from input bounding rect
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

interface QuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (quote: any) => void;
    initialData?: any;
}

export function QuoteModal({ isOpen, onClose, onSave, initialData }: QuoteModalProps) {
    const [clients, setClients] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);
    // Map initialData items from backend format → form format
    const mapItems = (rawItems: any[]) =>
        rawItems.map((item: any) => ({
            productId: item.productId ?? "",
            description: item.product?.name ?? item.description ?? "",
            quantity: item.quantity ?? 1,
            price: Number(item.price ?? 0),
        }));
    const [formData, setFormData] = useState({
        client: initialData?.client || "",
        date: initialData?.date || new Date().toISOString().split("T")[0],
        expiryDate: initialData?.expiryDate || "",
        items: initialData?.items || [{ description: "", quantity: 1, price: 0 }],
        notes: initialData?.notes || "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load clients and products from the API
    useEffect(() => {
        if (!isOpen) return;
        setLoadingClients(true);
        Promise.all([
            fetch("/api/clients").then((r) => r.json()),
            fetch("/api/products").then((r) => r.json()),
        ])
            .then(([clientData, productData]) => {
                setClients(Array.isArray(clientData) ? clientData : []);
                setProducts(Array.isArray(productData) ? productData : []);
            })
            .catch(() => { })
            .finally(() => setLoadingClients(false));
    }, [isOpen]);

    // Reset form when initialData changes
    useEffect(() => {
        setFormData({
            client: initialData?.clientId ?? initialData?.client?.id ?? "",
            date: initialData?.date
                ? new Date(initialData.date).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            expiryDate: initialData?.dueDate
                ? new Date(initialData.dueDate).toISOString().split("T")[0]
                : "",
            items:
                initialData?.items?.length > 0
                    ? mapItems(initialData.items)
                    : [{ productId: "", description: "", quantity: 1, price: 0 }],
            notes: initialData?.notes ?? "",
        });
        setErrors({});
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.client) newErrors.client = "Seleccione un cliente";

        const validItems = formData.items.filter((item: any) => item.description.trim() !== "" && item.price > 0);
        if (validItems.length === 0) newErrors.items = "Agregue al menos un item válido";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: "", quantity: 1, price: 0 }]
        });
        if (errors.items) setErrors({ ...errors, items: "" });
    };

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
        if (errors.items) setErrors({ ...errors, items: "" });
    };

    const calculateTotal = () => {
        return formData.items.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{initialData ? "Editar Cotización" : "Nueva Cotización de Venta"}</h2>
                        <p className="text-sm text-slate-500">Completa los campos para generar el presupuesto.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Client Info */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                <User size={16} className="mr-2 text-primary" /> Cliente
                            </label>
                            <select
                                value={formData.client}
                                onChange={(e) => {
                                    setFormData({ ...formData, client: e.target.value });
                                    if (errors.client) setErrors({ ...errors, client: "" });
                                }}
                                className={cn(
                                    "w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all",
                                    errors.client && "border-rose-300 bg-rose-50"
                                )}
                            >
                                <option value="">Seleccionar cliente...</option>
                                <option value="Tech Solutions S.A.S">Tech Solutions S.A.S</option>
                                <option value="Almacenes Éxito">Almacenes Éxito</option>
                                <option value="Inversiones Globales SAS">Inversiones Globales SAS</option>
                            </select>
                            {errors.client && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase">{errors.client}</p>}
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 flex items-center">
                                    <Calendar size={16} className="mr-2 text-primary" /> Fecha
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700">Validez hasta</label>
                                <input
                                    type="date"
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                    className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center">
                                <FileText size={16} className="mr-2 text-primary" /> Conceptos y Productos
                            </h3>
                            <button
                                onClick={addItem}
                                className="text-xs font-bold text-primary hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center"
                            >
                                <Plus size={14} className="mr-1" /> Agregar Item
                            </button>
                        </div>

                        <div className={cn(
                            "bg-slate-50 rounded-2xl border border-border overflow-hidden",
                            errors.items && "border-rose-300 ring-2 ring-rose-300/10"
                        )}>
                            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-100/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <div className="col-span-6">Descripción</div>
                                <div className="col-span-2">Cant</div>
                                <div className="col-span-2">Precio</div>
                                <div className="col-span-2 text-right">Total</div>
                            </div>
                            <div className="divide-y divide-border">
                                {formData.items.map((item: any, index: number) => (
                                    <div key={index} className="grid grid-cols-12 gap-4 p-4 items-center group">
                                        <div className="col-span-6">
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
                                                    };
                                                    setFormData({ ...formData, items: newItems });
                                                    if (errors.items) setErrors({ ...errors, items: "" });
                                                }}
                                            />
                                            {/* <input
                                                type="text"
                                                placeholder="Ej: Servicios de consultoría"
                                                value={item.description}
                                                onChange={(e) => updateItem(index, "description", e.target.value)}
                                                className="bg-transparent border-none w-full text-sm font-medium focus:ring-0 outline-none"
                                            /> */}
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                                className="bg-white border border-border rounded-lg w-full text-center py-1 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => updateItem(index, "price", Number(e.target.value))}
                                                className="bg-white border border-border rounded-lg w-full text-center py-1 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <div className="col-span-2 flex items-center justify-end space-x-2">
                                            <span className="text-sm font-bold text-slate-700">
                                                ${(item.quantity * item.price).toLocaleString()}
                                            </span>
                                            <button
                                                onClick={() => removeItem(index)}
                                                className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {errors.items && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase">{errors.items}</p>}
                    </div>

                    {/* Footer Info */}
                    <div className="flex flex-col md:flex-row justify-between gap-8 pt-6 border-t border-border">
                        <div className="flex-1 space-y-4">
                            <label className="text-sm font-bold text-slate-700">Notas y condiciones</label>
                            <textarea
                                rows={3}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Información adicional para la cotización..."
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                            />
                        </div>
                        <div className="w-full md:w-64 space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                <span>Subtotal</span>
                                <span>${calculateTotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                <span>Impuestos (0%)</span>
                                <span>$0</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-border">
                                <span className="text-lg font-bold text-slate-800">Total</span>
                                <span className="text-2xl font-black text-primary">${calculateTotal().toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-8 py-6 bg-slate-50 border-t border-border flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
                    >
                        {initialData ? "Guardar Cambios" : "Guardar Cotización"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// export function QuoteModal({ isOpen, onClose, onSave, initialData }: QuoteModalProps) {
//     const [formData, setFormData] = useState({
//         client: initialData?.client || "",
//         date: initialData?.date || new Date().toISOString().split("T")[0],
//         expiryDate: initialData?.expiryDate || "",
//         items: initialData?.items || [{ description: "", quantity: 1, price: 0 }],
//         notes: initialData?.notes || "",
//     });

//     const [errors, setErrors] = useState<Record<string, string>>({});

//     if (!isOpen) return null;

//     const validate = () => {
//         const newErrors: Record<string, string> = {};
//         if (!formData.client) newErrors.client = "Seleccione un cliente";

//         const validItems = formData.items.filter((item: any) => item.description.trim() !== "" && item.price > 0);
//         if (validItems.length === 0) newErrors.items = "Agregue al menos un item válido";

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSave = () => {
//         if (validate()) {
//             onSave(formData);
//         }
//     };

//     const addItem = () => {
//         setFormData({
//             ...formData,
//             items: [...formData.items, { description: "", quantity: 1, price: 0 }]
//         });
//         if (errors.items) setErrors({ ...errors, items: "" });
//     };

//     const removeItem = (index: number) => {
//         const newItems = formData.items.filter((_: any, i: number) => i !== index);
//         setFormData({ ...formData, items: newItems });
//     };

//     const updateItem = (index: number, field: string, value: any) => {
//         const newItems = [...formData.items];
//         newItems[index] = { ...newItems[index], [field]: value };
//         setFormData({ ...formData, items: newItems });
//         if (errors.items) setErrors({ ...errors, items: "" });
//     };

//     const calculateTotal = () => {
//         return formData.items.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0);
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
//             <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
//                 {/* Header */}
//                 <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10">
//                     <div>
//                         <h2 className="text-xl font-bold text-slate-800">{initialData ? "Editar Cotización" : "Nueva Cotización de Venta"}</h2>
//                         <p className="text-sm text-slate-500">Completa los campos para generar el presupuesto.</p>
//                     </div>
//                     <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
//                         <X size={24} />
//                     </button>
//                 </div>

//                 {/* Content */}
//                 <div className="flex-1 overflow-y-auto p-8 space-y-8">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                         {/* Client Info */}
//                         <div className="space-y-4">
//                             <label className="text-sm font-bold text-slate-700 flex items-center">
//                                 <User size={16} className="mr-2 text-primary" /> Cliente
//                             </label>
//                             <select
//                                 value={formData.client}
//                                 onChange={(e) => {
//                                     setFormData({ ...formData, client: e.target.value });
//                                     if (errors.client) setErrors({ ...errors, client: "" });
//                                 }}
//                                 className={cn(
//                                     "w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all",
//                                     errors.client && "border-rose-300 bg-rose-50"
//                                 )}
//                             >
//                                 <option value="">Seleccionar cliente...</option>
//                                 <option value="Tech Solutions S.A.S">Tech Solutions S.A.S</option>
//                                 <option value="Almacenes Éxito">Almacenes Éxito</option>
//                                 <option value="Inversiones Globales SAS">Inversiones Globales SAS</option>
//                             </select>
//                             {errors.client && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase">{errors.client}</p>}
//                         </div>

//                         {/* Dates */}
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="space-y-4">
//                                 <label className="text-sm font-bold text-slate-700 flex items-center">
//                                     <Calendar size={16} className="mr-2 text-primary" /> Fecha
//                                 </label>
//                                 <input
//                                     type="date"
//                                     value={formData.date}
//                                     onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//                                     className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
//                                 />
//                             </div>
//                             <div className="space-y-4">
//                                 <label className="text-sm font-bold text-slate-700">Validez hasta</label>
//                                 <input
//                                     type="date"
//                                     value={formData.expiryDate}
//                                     onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
//                                     className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Items Table */}
//                     <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                             <h3 className="text-sm font-bold text-slate-700 flex items-center">
//                                 <FileText size={16} className="mr-2 text-primary" /> Conceptos y Productos
//                             </h3>
//                             <button
//                                 onClick={addItem}
//                                 className="text-xs font-bold text-primary hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center"
//                             >
//                                 <Plus size={14} className="mr-1" /> Agregar Item
//                             </button>
//                         </div>

//                         <div className={cn(
//                             "bg-slate-50 rounded-2xl border border-border overflow-hidden",
//                             errors.items && "border-rose-300 ring-2 ring-rose-300/10"
//                         )}>
//                             <div className="grid grid-cols-12 gap-4 p-4 bg-slate-100/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
//                                 <div className="col-span-6">Descripción</div>
//                                 <div className="col-span-2">Cant</div>
//                                 <div className="col-span-2">Precio</div>
//                                 <div className="col-span-2 text-right">Total</div>
//                             </div>
//                             <div className="divide-y divide-border">
//                                 {formData.items.map((item: any, index: number) => (
//                                     <div key={index} className="grid grid-cols-12 gap-4 p-4 items-center group">
//                                         <div className="col-span-6">
//                                             <ProductSearch
//                                                 value={item.description}
//                                                 products={products}
//                                                 onChange={(val) => updateItem(index, "description", val)}
//                                                 onSelect={(product) => {
//                                                     const newItems = [...formData.items];
//                                                     newItems[index] = {
//                                                         ...newItems[index],
//                                                         description: product.name,
//                                                         productId: product.id,
//                                                         price: product.price,
//                                                     };
//                                                     setFormData({ ...formData, items: newItems });
//                                                     if (errors.items) setErrors({ ...errors, items: "" });
//                                                 }}
//                                             />
//                                             {/* <input
//                                                 type="text"
//                                                 placeholder="Ej: Servicios de consultoría"
//                                                 value={item.description}
//                                                 onChange={(e) => updateItem(index, "description", e.target.value)}
//                                                 className="bg-transparent border-none w-full text-sm font-medium focus:ring-0 outline-none"
//                                             /> */}
//                                         </div>
//                                         <div className="col-span-2">
//                                             <input
//                                                 type="number"
//                                                 value={item.quantity}
//                                                 onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
//                                                 className="bg-white border border-border rounded-lg w-full text-center py-1 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
//                                             />
//                                         </div>
//                                         <div className="col-span-2">
//                                             <input
//                                                 type="number"
//                                                 value={item.price}
//                                                 onChange={(e) => updateItem(index, "price", Number(e.target.value))}
//                                                 className="bg-white border border-border rounded-lg w-full text-center py-1 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
//                                             />
//                                         </div>
//                                         <div className="col-span-2 flex items-center justify-end space-x-2">
//                                             <span className="text-sm font-bold text-slate-700">
//                                                 ${(item.quantity * item.price).toLocaleString()}
//                                             </span>
//                                             <button
//                                                 onClick={() => removeItem(index)}
//                                                 className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
//                                             >
//                                                 <Trash2 size={16} />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                         {errors.items && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase">{errors.items}</p>}
//                     </div>

//                     {/* Footer Info */}
//                     <div className="flex flex-col md:flex-row justify-between gap-8 pt-6 border-t border-border">
//                         <div className="flex-1 space-y-4">
//                             <label className="text-sm font-bold text-slate-700">Notas y condiciones</label>
//                             <textarea
//                                 rows={3}
//                                 value={formData.notes}
//                                 onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//                                 placeholder="Información adicional para la cotización..."
//                                 className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
//                             />
//                         </div>
//                         <div className="w-full md:w-64 space-y-3">
//                             <div className="flex justify-between items-center text-sm font-medium text-slate-500">
//                                 <span>Subtotal</span>
//                                 <span>${calculateTotal().toLocaleString()}</span>
//                             </div>
//                             <div className="flex justify-between items-center text-sm font-medium text-slate-500">
//                                 <span>Impuestos (0%)</span>
//                                 <span>$0</span>
//                             </div>
//                             <div className="flex justify-between items-center pt-3 border-t border-border">
//                                 <span className="text-lg font-bold text-slate-800">Total</span>
//                                 <span className="text-2xl font-black text-primary">${calculateTotal().toLocaleString()}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="px-8 py-6 bg-slate-50 border-t border-border flex justify-end space-x-3">
//                     <button
//                         onClick={onClose}
//                         className="px-6 py-2.5 bg-white border border-border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
//                     >
//                         Cancelar
//                     </button>
//                     <button
//                         onClick={handleSave}
//                         className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
//                     >
//                         {initialData ? "Guardar Cambios" : "Guardar Cotización"}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }
