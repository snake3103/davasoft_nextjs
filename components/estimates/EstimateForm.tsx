"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import { X, Plus, Trash2, Calendar, User, FileText, Loader2, Search, Package, Save, ArrowLeft, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useClients, useProducts, useTaxes } from "@/hooks/useDatabase";
import { useQueryClient } from "@tanstack/react-query";
import { ContactSearch } from "@/components/ui/Autocomplete";
import { Select } from "@/components/ui/Select";

// ─── Unit Conversion Utilities ──────────────────────────────────────────────
type DimensionUnit = "CM" | "M" | "MM" | "IN" | "FT";

// Factores de conversión a metros
const UNIT_TO_METERS: Record<DimensionUnit, number> = {
  CM: 0.01,
  M: 1,
  MM: 0.001,
  IN: 0.0254,
  FT: 0.3048,
};

// Convertir valor de cualquier unidad a metros
function toMeters(value: number, fromUnit: DimensionUnit): number {
  return value * UNIT_TO_METERS[fromUnit];
}

// Calcular área en m² a partir de largo y ancho en metros
function calculateAreaM2(lengthM: number, widthM: number): number {
  return lengthM * widthM;
}

// Calcular volumen en m³ a partir de largo, ancho y alto en metros
function calculateVolumeM3(lengthM: number, widthM: number, heightM: number): number {
  return lengthM * widthM * heightM;
}

// ─── Product Autocomplete ─────────────────────────────────────────────────────
interface ProductSearchProps {
    value: string;
    onSelect: (product: { name: string; price: number; id: string; tax?: any }) => void;
    onChange: (val: string) => void;
    products: any[];
}

function ProductSearch({ value, onSelect, onChange, products }: ProductSearchProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { 
        setQuery(value); 
        if (value) {
            const selected = products.find((p: any) => p.name === value);
            if (selected) setSelectedId(selected.id);
        }
    }, [value, products]);

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
        // Limpiar query para mostrar todos los productos al abrir
        if (value && query) {
            setQuery("");
        }
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
        setSelectedId(product.id);
        onSelect({ name: product.name, price: Number(product.price), id: product.id, tax: product.tax });
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setQuery("");
        setSelectedId(null);
        onSelect({ name: "", price: 0, id: "" });
        onChange("");
        setOpen(true);
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
                    title={query}
                    onChange={handleInput}
                    onFocus={handleOpen}
                    className="bg-white border border-border rounded-lg w-full pl-8 pr-8 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
                {selectedId ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={14} />
                    </button>
                ) : null}
            </div>
            {open && (
                <div style={dropdownStyle} className="bg-white border border-border rounded-xl shadow-2xl max-h-64 overflow-y-auto min-w-[320px]">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Search size={18} className="text-slate-300" />
                            </div>
                            <p className="text-xs text-slate-400 italic">Sin resultados — se usará el texto como descripción</p>
                        </div>
                    ) : (
                        filtered.map((p: any) => {
                            const isSelected = p.id === selectedId;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onMouseDown={() => handleSelect(p)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 transition-colors flex items-center gap-3 group",
                                        isSelected 
                                            ? "bg-primary/10 border-l-4 border-l-primary" 
                                            : "hover:bg-primary/5 border-l-4 border-l-transparent"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                        isSelected 
                                            ? "bg-primary text-white" 
                                            : "bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white"
                                    )}>
                                        <Package size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p 
                                            className={cn(
                                                "text-sm font-semibold transition-colors",
                                                isSelected ? "text-primary" : "text-slate-700 group-hover:text-primary"
                                            )}
                                            title={p.name}
                                        >
                                            {p.name}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {p.sku && (
                                                <p className="text-[10px] text-slate-400">SKU: {p.sku}</p>
                                            )}
                                            {p.category?.name && (
                                                <p className="text-[10px] text-slate-300">•</p>
                                            )}
                                            {p.category?.name && (
                                                <p className="text-[10px] text-slate-400">{p.category.name}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={cn(
                                            "text-sm font-bold",
                                            isSelected ? "text-primary" : "text-primary/70"
                                        )}>
                                            ${Number(p.price).toLocaleString("es-DO")}
                                        </span>
                                        {p.tax && (
                                            <span className="block text-[10px] text-emerald-600 font-medium">
                                                {p.tax.type === "PERCENTAGE" ? `${p.tax.value}%` : `$${p.tax.value}`}
                                            </span>
                                        )}
                                        {isSelected && (
                                            <span className="block text-[10px] text-primary font-bold">✓</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })
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

// ─── Tax Selector para línea ────────────────────────────────────────────────
interface TaxLineSelectProps {
    value: string;
    onChange: (taxId: string, taxRate: number, taxAmount: number) => void;
    taxes: any[];
    price: number;
    quantity: number;
}

function TaxLineSelect({ value, onChange, taxes, price, quantity }: TaxLineSelectProps) {
    const selectedTax = taxes.find((t: any) => t.id === value);
    const subtotal = price * quantity;
    const taxRate = selectedTax?.type === "PERCENTAGE" ? selectedTax.value : 0;
    const taxAmount = selectedTax?.type === "PERCENTAGE" 
        ? subtotal * (selectedTax.value / 100) 
        : (selectedTax?.type === "FIXED" ? selectedTax.value : 0);

    const handleSelect = (taxId: string, tax?: any) => {
        if (!tax) {
            onChange("", 0, 0);
            return;
        }
        const rate = tax.type === "PERCENTAGE" ? tax.value : 0;
        const amount = tax.type === "PERCENTAGE" 
            ? subtotal * (tax.value / 100) 
            : (tax.type === "FIXED" ? tax.value : 0);
        onChange(taxId, rate, amount);
    };

    return (
        <Select
            value={value}
            onChange={(val) => handleSelect(val, taxes.find((t: any) => t.id === val))}
            options={[
                { value: "", label: "Sin impuesto", description: "Exento" },
                ...taxes.filter((t: any) => t.isActive).map((t: any) => ({ 
                    value: t.id, 
                    label: t.name,
                    description: t.type === "PERCENTAGE" ? `${t.value}%` : `$${t.value.toLocaleString()}`
                })),
            ]}
            placeholder="Impuesto"
            className="min-w-[120px]"
        />
    );
}

export function EstimateForm({ initialData, action, title }: EstimateFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: clients = [] } = useClients();
    const { data: products = [] } = useProducts();
    const { data: taxes = [] } = useTaxes();
    const [state, formAction, isPending] = useActionState(action, null);

    const mapItems = (rawItems: any[]) =>
        rawItems.map((item: any) => ({
            productId: item.productId ?? "",
            description: item.product?.name ?? item.description ?? "",
            quantity: item.quantity ?? 1,
            price: Number(item.price ?? 0),
            taxId: item.taxId ?? "",
            taxRate: Number(item.taxRate ?? 0),
            taxAmount: Number(item.taxAmount ?? 0),
            total: Number(item.total ?? 0),
            // Dimensiones
            hasDimensions: item.hasDimensions ?? false,
            length: item.length ?? null,
            width: item.width ?? null,
            height: item.height ?? null,
            dimensionUnit: item.dimensionUnit ?? "CM",
            pricingType: item.pricingType ?? "FIXED",
            pricePerUnit: item.pricePerUnit ?? null,
            calculatedArea: item.calculatedArea ?? null,
            calculatedVolume: item.calculatedVolume ?? null,
            pricePerDimension: Number(item.pricePerDimension ?? 0),
        }));

    const emptyItem = { productId: "", description: "", quantity: 1, price: 0, taxId: "", taxRate: 0, taxAmount: 0, total: 0, hasDimensions: false, length: null, width: null, height: null, dimensionUnit: "CM", pricingType: "FIXED", pricePerUnit: null, calculatedArea: null, calculatedVolume: null, pricePerDimension: 0 };

    const [formData, setFormData] = useState({
        clientId: initialData?.clientId ?? "",
        number: initialData?.number ?? "",
        date: initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split("T")[0] : "",
        items: initialData?.items?.length > 0 ? mapItems(initialData.items) : [emptyItem],
        notes: initialData?.notes ?? "",
        status: initialData?.status ?? "DRAFT",
    });

    // Generar número de cotización solo en cliente para evitar hydration mismatch
    useEffect(() => {
        if (!initialData?.number && !formData.number) {
            setFormData(prev => ({
                ...prev,
                number: `COT-${Math.floor(Math.random() * 90000) + 10000}`
            }));
        }
    }, []);

    useEffect(() => {
        if (state?.success) {
            queryClient.invalidateQueries({ queryKey: ["estimates"] });
            router.push("/cotizaciones");
        }
    }, [state, router, queryClient]);

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, emptyItem]
        });
    };

    const removeItem = (index: number) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        
        if (field === "productId") {
            const product = products.find((p: any) => p.id === value);
            if (product) {
                const hasDimensions = product.hasDimensions ?? false;
                const pricingType = product.pricingType ?? "FIXED";
                let price = Number(product.price);
                let calculatedArea: number | null = null;
                let calculatedVolume: number | null = null;
                let pricePerDimension = 0;

                if (hasDimensions && pricingType !== "FIXED" && product.pricePerUnit) {
                    pricePerDimension = Number(product.pricePerUnit);
                }

                newItems[index] = { 
                    ...newItems[index], 
                    productId: value,
                    description: product.name,
                    price: price,
                    taxId: product.taxId || "",
                    taxRate: product.tax?.type === "PERCENTAGE" ? product.tax.value : 0,
                    taxAmount: product.tax?.type === "PERCENTAGE" 
                        ? (newItems[index].quantity * price) * (product.tax.value / 100)
                        : 0,
                    hasDimensions,
                    dimensionUnit: product.dimensionUnit ?? "CM",
                    pricingType,
                    pricePerUnit: product.pricePerUnit ?? null,
                    calculatedArea,
                    calculatedVolume,
                    pricePerDimension,
                };
            } else {
                newItems[index] = { 
                    ...newItems[index], 
                    productId: value,
                    hasDimensions: false,
                    pricingType: "FIXED",
                    pricePerUnit: null,
                    calculatedArea: null,
                    calculatedVolume: null,
                    pricePerDimension: 0,
                };
            }
        } else if (field === "quantity" || field === "price") {
            const item = { ...newItems[index], [field]: value };
            if (item.taxRate > 0) {
                item.taxAmount = (item.quantity * item.price) * (item.taxRate / 100);
            }
            newItems[index] = item;
        } else if (field === "taxId") {
            const [taxId, taxRate, taxAmount] = value;
            newItems[index] = { ...newItems[index], taxId, taxRate, taxAmount };
        } else if (field === "dimensionUnit") {
            // Cuando cambia la unidad, recalcular con las mismas medidas pero nueva unidad
            const item = { ...newItems[index], dimensionUnit: value };
            const unit = value as DimensionUnit;
            
            // Convertir a metros para cálculo
            const lengthM = item.length != null ? toMeters(item.length, unit) : null;
            const widthM = item.width != null ? toMeters(item.width, unit) : null;
            const heightM = item.height != null ? toMeters(item.height, unit) : null;
            
            // Calcular área en m²
            if (lengthM != null && widthM != null) {
                item.calculatedArea = calculateAreaM2(lengthM, widthM);
            } else {
                item.calculatedArea = null;
            }
            
            // Calcular volumen en m³
            if (lengthM != null && widthM != null && heightM != null) {
                item.calculatedVolume = calculateVolumeM3(lengthM, widthM, heightM);
            } else {
                item.calculatedVolume = null;
            }
            
            // Recalcular precio basado en dimensiones
            if (item.hasDimensions && item.pricePerUnit) {
                if (item.pricingType === "PER_LINEAR") {
                    const maxDim = Math.max(lengthM ?? 0, widthM ?? 0, heightM ?? 0);
                    item.pricePerDimension = maxDim * item.pricePerUnit;
                } else if (item.pricingType === "PER_AREA" && item.calculatedArea != null) {
                    item.pricePerDimension = item.calculatedArea * item.pricePerUnit;
                } else if (item.pricingType === "PER_VOLUME" && item.calculatedVolume != null) {
                    item.pricePerDimension = item.calculatedVolume * item.pricePerUnit;
                } else {
                    item.pricePerDimension = 0;
                }
                item.price = item.pricePerDimension;
                if (item.taxRate > 0) {
                    item.taxAmount = (item.quantity * item.price) * (item.taxRate / 100);
                }
            }
            
            newItems[index] = item;
        } else if (["length", "width", "height"].includes(field)) {
            // Actualizar dimensión y recalcular área/volumen CONVERSIÓN A METROS
            const item = { ...newItems[index], [field]: value ? Number(value) : null };
            const unit = item.dimensionUnit as DimensionUnit;
            
            // Convertir a metros para cálculo
            const lengthM = item.length != null ? toMeters(item.length, unit) : null;
            const widthM = item.width != null ? toMeters(item.width, unit) : null;
            const heightM = item.height != null ? toMeters(item.height, unit) : null;
            
            // Calcular área en m²
            if (lengthM != null && widthM != null) {
                item.calculatedArea = calculateAreaM2(lengthM, widthM);
            } else {
                item.calculatedArea = null;
            }
            
            // Calcular volumen en m³
            if (lengthM != null && widthM != null && heightM != null) {
                item.calculatedVolume = calculateVolumeM3(lengthM, widthM, heightM);
            } else {
                item.calculatedVolume = null;
            }
            
            // Recalcular precio basado en dimensiones
            if (item.hasDimensions && item.pricePerUnit) {
                if (item.pricingType === "PER_LINEAR") {
                    const maxDim = Math.max(lengthM ?? 0, widthM ?? 0, heightM ?? 0);
                    item.pricePerDimension = maxDim * item.pricePerUnit;
                } else if (item.pricingType === "PER_AREA" && item.calculatedArea != null) {
                    item.pricePerDimension = item.calculatedArea * item.pricePerUnit;
                } else if (item.pricingType === "PER_VOLUME" && item.calculatedVolume != null) {
                    item.pricePerDimension = item.calculatedVolume * item.pricePerUnit;
                } else {
                    item.pricePerDimension = 0;
                }
                item.price = item.pricePerDimension;
                if (item.taxRate > 0) {
                    item.taxAmount = (item.quantity * item.price) * (item.taxRate / 100);
                }
            }
            
            newItems[index] = item;
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }
        
        // Recalcular total de la línea
        const item = newItems[index];
        item.total = (item.quantity * item.price) + item.taxAmount;
        
        setFormData({ ...formData, items: newItems });
    };

    // ─── Cálculos de totales ─────────────────────────────────────────────────────
    const subtotal = formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const totalTax = formData.items.reduce((acc, item) => acc + item.taxAmount, 0);
    const total = subtotal + totalTax;

    return (
        <form action={formAction} className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* Inputs Ocultos para serialización */}
            <input type="hidden" name="clientId" value={formData.clientId} />
            <input type="hidden" name="number" value={formData.number} />
            <input type="hidden" name="items" value={JSON.stringify(formData.items)} />
            <input type="hidden" name="subtotal" value={subtotal} />
            <input type="hidden" name="tax" value={totalTax} />
            <input type="hidden" name="total" value={total} />

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
                                        <th className="px-4 py-3 min-w-[280px]">Descripción / Producto</th>
                                        <th className="px-3 py-3 w-20 text-center">Cant.</th>
                                        <th className="px-3 py-3 w-32 text-center">Precio Unit.</th>
                                        <th className="px-3 py-3 w-36 text-center">Impuesto</th>
                                        <th className="px-4 py-3 w-32 text-right">Total</th>
                                        <th className="px-3 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {formData.items.map((item: any, index: number) => {
                                        const hasDimensions = item.hasDimensions && item.productId;
                                        return (
                                    <>
                                        <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <ProductSearch
                                                    value={item.description}
                                                    products={products}
                                                    onChange={(val) => updateItem(index, "description", val)}
                                                    onSelect={(p) => updateItem(index, "productId", p.id)}
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                                    className="w-full bg-white border border-border rounded-lg px-2 py-1.5 text-sm text-center focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                {hasDimensions ? (
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-primary text-[10px] font-bold">
                                                            {item.pricingType === "PER_LINEAR" && "ML"}
                                                            {item.pricingType === "PER_AREA" && "m²"}
                                                            {item.pricingType === "PER_VOLUME" && "m³"}
                                                            {item.pricingType === "PER_UNIT" && "x1"}
                                                        </span>
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            readOnly
                                                            className="w-full bg-primary/5 border-primary/20 rounded-lg pl-8 pr-2 py-1.5 text-sm text-center font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => updateItem(index, "price", Number(e.target.value))}
                                                            className="w-full bg-white border border-border rounded-lg pl-5 pr-2 py-1.5 text-sm text-center focus:ring-2 focus:ring-primary/20 outline-none"
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <TaxLineSelect
                                                    value={item.taxId}
                                                    onChange={(taxId, taxRate, taxAmount) => updateItem(index, "taxId", [taxId, taxRate, taxAmount])}
                                                    taxes={taxes}
                                                    price={item.price}
                                                    quantity={item.quantity}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {hasDimensions && (
                                                        <span title="Tiene dimensiones"><Ruler size={12} className="text-primary" /></span>
                                                    )}
                                                    <span className="text-sm font-bold text-slate-700">
                                                        ${((item.quantity * item.price) + item.taxAmount).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Dimension inputs row */}
                                        {hasDimensions && (
                                            <tr key={`dim-${index}`} className="bg-gradient-to-r from-slate-50 to-blue-50/50">
                                                <td colSpan={6} className="px-4 py-3">
                                                    <div className="flex items-center gap-4 text-xs flex-wrap">
                                                        <div className="flex items-center gap-1 text-primary font-bold">
                                                            <Ruler size={12} />
                                                            <span>Dimensiones</span>
                                                        </div>
                                                        
                                                        {/* Selector de unidad */}
                                                        <select
                                                            value={item.dimensionUnit}
                                                            onChange={(e) => updateItem(index, "dimensionUnit", e.target.value)}
                                                            className="bg-white border border-primary/30 rounded-lg px-2 py-1 text-xs font-medium text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                                                        >
                                                            <option value="CM">cm</option>
                                                            <option value="M">m</option>
                                                            <option value="MM">mm</option>
                                                            <option value="IN">in</option>
                                                            <option value="FT">ft</option>
                                                        </select>
                                                        
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1">
                                                                <label className="text-slate-400 text-[10px] uppercase">Largo</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        step={["M", "FT", "IN"].includes(item.dimensionUnit) ? "0.01" : "0.1"}
                                                                        placeholder="0"
                                                                        value={item.length ?? ""}
                                                                        onChange={(e) => updateItem(index, "length", e.target.value ? Number(e.target.value) : null)}
                                                                        className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 pr-6 text-sm text-center focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                    />
                                                                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">
                                                                        {item.dimensionUnit.toLowerCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <label className="text-slate-400 text-[10px] uppercase">Ancho</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        step={["M", "FT", "IN"].includes(item.dimensionUnit) ? "0.01" : "0.1"}
                                                                        placeholder="0"
                                                                        value={item.width ?? ""}
                                                                        onChange={(e) => updateItem(index, "width", e.target.value ? Number(e.target.value) : null)}
                                                                        className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 pr-6 text-sm text-center focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                    />
                                                                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">
                                                                        {item.dimensionUnit.toLowerCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <label className="text-slate-400 text-[10px] uppercase">Alto</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        step={["M", "FT", "IN"].includes(item.dimensionUnit) ? "0.01" : "0.1"}
                                                                        placeholder="0"
                                                                        value={item.height ?? ""}
                                                                        onChange={(e) => updateItem(index, "height", e.target.value ? Number(e.target.value) : null)}
                                                                        className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 pr-6 text-sm text-center focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                    />
                                                                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">
                                                                        {item.dimensionUnit.toLowerCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-slate-400 text-[10px]">=</span>
                                                            <span className="font-bold text-primary text-sm">
                                                                {item.calculatedArea != null && item.pricingType === "PER_AREA" && `${item.calculatedArea.toFixed(4)} m²`}
                                                                {item.calculatedVolume != null && item.pricingType === "PER_VOLUME" && `${item.calculatedVolume.toFixed(4)} m³`}
                                                                {!item.calculatedArea && !item.calculatedVolume && "—"}
                                                            </span>
                                                        </div>
                                                        
                                                        <span className="ml-auto text-[10px] text-emerald-600 font-medium">
                                                            ${(item.quantity * item.price).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                    );
                                    })}</tbody>
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
                                <span className="font-semibold text-slate-700">${subtotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-emerald-600">
                                <span>Impuestos</span>
                                <span className="font-semibold">+${totalTax.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="pt-4 border-t border-border mt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-bold text-slate-800">Total</span>
                                    <span className="text-2xl font-black text-primary">${total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
                                <Select
                                    value={formData.status}
                                    onChange={(val) => setFormData({ ...formData, status: val })}
                                    options={[
                                        { value: "DRAFT", label: "Borrador", description: "Cotización en preparación" },
                                        { value: "SENT", label: "Enviada", description: "Enviada al cliente" },
                                        { value: "ACCEPTED", label: "Aceptada", description: "Cliente aceptó la cotización" },
                                        { value: "REJECTED", label: "Rechazada", description: "Cliente rechazó la cotización" },
                                        { value: "EXPIRED", label: "Vencida", description: "La cotización venció" },
                                    ]}
                                    placeholder="Seleccionar estado..."
                                />
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
