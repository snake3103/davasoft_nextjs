"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import { Plus, Trash2, Calendar, User, Loader2, Search, Package, Save, ChevronLeft, X, Ruler, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useClients, useProducts, useTaxes } from "@/hooks/useDatabase";
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

// Nombres completos de unidades
const UNIT_LABELS: Record<DimensionUnit, string> = {
  CM: "Centímetros (cm)",
  M: "Metros (m)",
  MM: "Milímetros (mm)",
  IN: "Pulgadas (in)",
  FT: "Pies (ft)",
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

// ─── Product Autocomplete ──────────────────────────────────────────────────
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

    const handleSelect = (p: any) => {
        setQuery(p.name);
        setSelectedId(p.id);
        onSelect({ 
            name: p.name, 
            price: Number(p.price), 
            id: p.id,
            tax: p.tax 
        });
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
                    placeholder="Buscar producto..."
                    value={query}
                    title={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                        setOpen(true);
                    }}
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
                            <p className="text-xs text-slate-400 italic">Sin resultados</p>
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

// ─── Main Form Component ──────────────────────────────────────────────────────
interface InvoiceFormProps {
    initialData?: any;
    action: (prevState: any, formData: FormData) => Promise<any>;
}

interface InvoiceItem {
    productId: string;
    description: string;
    quantity: number;
    price: number;
    taxId: string;
    taxRate: number;
    taxAmount: number;
    total: number;
    // Dimensiones
    hasDimensions: boolean;
    length: number | null;
    width: number | null;
    height: number | null;
    dimensionUnit: string;
    pricingType: string;
    pricePerUnit: number | null;
    calculatedArea: number | null;
    calculatedVolume: number | null;
    pricePerDimension: number;
}

export default function InvoiceForm({ initialData, action }: InvoiceFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: clients = [] } = useClients();
    const { data: products = [] } = useProducts();
    const { data: taxes = [] } = useTaxes();
    const [state, formAction, isPending] = useActionState(action, null);

    const [formData, setFormData] = useState<{
        clientId: string;
        number: string;
        date: string;
        dueDate: string;
        items: InvoiceItem[];
        notes: string;
        status: string;
    }>({
        clientId: initialData?.clientId ?? "",
        number: initialData?.number ?? "",
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
                taxId: i.taxId ?? "",
                taxRate: Number(i.taxRate ?? 0),
                taxAmount: Number(i.taxAmount ?? 0),
                total: Number(i.total ?? 0),
                // Dimensiones
                hasDimensions: i.hasDimensions ?? false,
                length: i.length ?? null,
                width: i.width ?? null,
                height: i.height ?? null,
                dimensionUnit: i.dimensionUnit ?? "CM",
                pricingType: i.pricingType ?? "FIXED",
                pricePerUnit: i.pricePerUnit ?? null,
                calculatedArea: i.calculatedArea ?? null,
                calculatedVolume: i.calculatedVolume ?? null,
                pricePerDimension: Number(i.pricePerDimension ?? 0),
            }))
            : [{ productId: "", description: "", quantity: 1, price: 0, taxId: "", taxRate: 0, taxAmount: 0, total: 0, hasDimensions: false, length: null, width: null, height: null, dimensionUnit: "CM", pricingType: "FIXED", pricePerUnit: null, calculatedArea: null, calculatedVolume: null, pricePerDimension: 0 }],
        notes: initialData?.notes ?? "",
        status: initialData?.status ?? "DRAFT",
    });

    // Generar número de factura solo en el cliente (evita hydration mismatch)
    useEffect(() => {
        if (!initialData?.number && !formData.number) {
            setFormData(prev => ({
                ...prev,
                number: `FE-${Math.floor(1000 + Math.random() * 9000)}`
            }));
        }
    }, []);

    useEffect(() => {
        if (state?.success) {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            router.push("/ventas");
        }
    }, [state, router, queryClient]);

    // ─── Cálculos de totales ────────────────────────────────────────────────────────
    const subtotal = formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const totalTax = formData.items.reduce((acc, item) => acc + item.taxAmount, 0);
    const total = subtotal + totalTax;

    // ─── Funciones de actualización ────────────────────────────────────────────────
    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: "", description: "", quantity: 1, price: 0, taxId: "", taxRate: 0, taxAmount: 0, total: 0, hasDimensions: false, length: null, width: null, height: null, dimensionUnit: "CM", pricingType: "FIXED", pricePerUnit: null, calculatedArea: null, calculatedVolume: null, pricePerDimension: 0 }]
        });
    };

    const removeItem = (index: number) => {
        if (formData.items.length === 1) return;
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        });
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

                // Si tiene dimensiones y tipo de precio por dimensión, usar pricePerUnit
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
            
            // Calcular área en m² (largo x ancho)
            if (lengthM != null && widthM != null) {
                item.calculatedArea = calculateAreaM2(lengthM, widthM);
            } else {
                item.calculatedArea = null;
            }
            
            // Calcular volumen en m³ (largo x ancho x alto)
            if (lengthM != null && widthM != null && heightM != null) {
                item.calculatedVolume = calculateVolumeM3(lengthM, widthM, heightM);
            } else {
                item.calculatedVolume = null;
            }
            
            // Recalcular precio basado en dimensiones (ya en metros)
            if (item.hasDimensions && item.pricePerUnit) {
                if (item.pricingType === "PER_LINEAR") {
                    // Precio por unidad lineal: usar la mayor dimensión en metros
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
                // Recalcular impuesto
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

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <form action={formAction}>
                <input type="hidden" name="clientId" value={formData.clientId} />
                <input type="hidden" name="number" value={formData.number} />
                <input type="hidden" name="items" value={JSON.stringify(formData.items)} />
                <input type="hidden" name="status" value={formData.status} />
                <input type="hidden" name="subtotal" value={subtotal} />
                <input type="hidden" name="tax" value={totalTax} />
                <input type="hidden" name="total" value={total} />

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
                            <p className="text-slate-500 text-sm">
                                {formData.number ? `#${formData.number}` : "#FE-XXXX"}
                            </p>
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
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center">
                                        <Calendar size={16} className="mr-2 text-primary" /> Vencimiento
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-700">Productos / Servicios</h3>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-xl hover:bg-primary/20 transition-colors"
                                >
                                    <Plus size={16} /> Agregar línea
                                </button>
                            </div>

                            <div className="border border-border rounded-2xl overflow-hidden">
                                {/* Header de tabla */}
                                <div className="grid grid-cols-12 gap-2 p-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-border">
                                    <div className="col-span-4">Producto / Descripción</div>
                                    <div className="col-span-1 text-center">Cant.</div>
                                    <div className="col-span-2 text-center">Precio</div>
                                    <div className="col-span-2 text-center">Impuesto</div>
                                    <div className="col-span-2 text-right">Total</div>
                                    <div className="col-span-1" />
                                </div>
                                
                                {/* Líneas de items */}
                                <div className="divide-y divide-border">
                                    {formData.items.map((item: any, index: number) => {
                                        const hasDimensions = item.hasDimensions && item.productId;
                                        return (
                                            <div key={index}>
                                                {/* Main row */}
                                                <div className="grid grid-cols-12 gap-2 p-4 items-center">
                                                    <div className="col-span-4">
                                                        <ProductSearch
                                                            value={item.description}
                                                            products={products}
                                                            onChange={(val) => updateItem(index, "description", val)}
                                                            onSelect={(p) => updateItem(index, "productId", p.id)}
                                                        />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                                            className="w-full bg-slate-50 border border-border rounded-lg text-center py-1.5 text-sm"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        {hasDimensions ? (
                                                            <div className="text-center">
                                                                <span className="text-xs text-primary font-medium">
                                                                    {item.pricingType === "PER_LINEAR" && "x Metro Lineal"}
                                                                    {item.pricingType === "PER_AREA" && "x m²"}
                                                                    {item.pricingType === "PER_VOLUME" && "x m³"}
                                                                    {item.pricingType === "PER_UNIT" && "x Unidad"}
                                                                </span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={item.price}
                                                                    readOnly
                                                                    className="w-full bg-primary/5 border-primary/20 rounded-lg text-center py-1.5 text-sm font-bold text-primary"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                value={item.price}
                                                                onChange={(e) => updateItem(index, "price", Number(e.target.value))}
                                                                className="w-full bg-slate-50 border border-border rounded-lg text-center py-1.5 text-sm"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="col-span-2">
                                                        <TaxLineSelect
                                                            value={item.taxId}
                                                            onChange={(taxId, taxRate, taxAmount) => updateItem(index, "taxId", [taxId, taxRate, taxAmount])}
                                                            taxes={taxes}
                                                            price={item.price}
                                                            quantity={item.quantity}
                                                        />
                                                    </div>
                                                    <div className="col-span-2 text-right">
                                                        <span className="text-sm font-bold text-slate-700">
                                                            ${((item.quantity * item.price) + item.taxAmount).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-1 flex justify-center gap-1">
                                                        {hasDimensions && (
                                                            <span className="text-primary" title="Tiene dimensiones configuradas">
                                                                <Ruler size={14} />
                                                            </span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            disabled={formData.items.length === 1}
                                                            className="text-slate-300 hover:text-rose-500 disabled:opacity-0 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Dimension inputs row - solo visible si el producto tiene dimensiones */}
                                                {hasDimensions && (
                                                    <div className="px-4 pb-4 -mt-2">
                                                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-primary/10">
                                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                                <Ruler size={14} className="text-primary" />
                                                                <span className="text-xs font-bold text-primary uppercase">
                                                                    Dimensiones
                                                                </span>
                                                                
                                                                {/* Selector de unidad */}
                                                                <div className="flex items-center gap-1 ml-2">
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
                                                                </div>
                                                                
                                                                <span className="text-[10px] text-slate-400 ml-auto">
                                                                    {item.pricingType === "PER_LINEAR" && "× metro lineal"}
                                                                    {item.pricingType === "PER_AREA" && "× m²"}
                                                                    {item.pricingType === "PER_VOLUME" && "× m³"}
                                                                    {item.pricingType === "PER_UNIT" && "× unidad"}
                                                                </span>
                                                                <span className="text-[10px] text-emerald-600 font-medium">
                                                                    {item.pricePerUnit && `$${Number(item.pricePerUnit).toLocaleString("es-DO")}`}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-5 gap-3">
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-medium text-slate-500 uppercase">Largo</label>
                                                                    <div className="relative">
                                                                        <input
                                                                            type="number"
                                                                            min={0}
                                                                            step={["M", "FT", "IN"].includes(item.dimensionUnit) ? "0.01" : "0.1"}
                                                                            placeholder="0"
                                                                            value={item.length ?? ""}
                                                                            onChange={(e) => updateItem(index, "length", e.target.value ? Number(e.target.value) : null)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                        />
                                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">
                                                                            {item.dimensionUnit.toLowerCase()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-medium text-slate-500 uppercase">Ancho</label>
                                                                    <div className="relative">
                                                                        <input
                                                                            type="number"
                                                                            min={0}
                                                                            step={["M", "FT", "IN"].includes(item.dimensionUnit) ? "0.01" : "0.1"}
                                                                            placeholder="0"
                                                                            value={item.width ?? ""}
                                                                            onChange={(e) => updateItem(index, "width", e.target.value ? Number(e.target.value) : null)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                        />
                                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">
                                                                            {item.dimensionUnit.toLowerCase()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-medium text-slate-500 uppercase">Alto</label>
                                                                    <div className="relative">
                                                                        <input
                                                                            type="number"
                                                                            min={0}
                                                                            step={["M", "FT", "IN"].includes(item.dimensionUnit) ? "0.01" : "0.1"}
                                                                            placeholder="0"
                                                                            value={item.height ?? ""}
                                                                            onChange={(e) => updateItem(index, "height", e.target.value ? Number(e.target.value) : null)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                        />
                                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">
                                                                            {item.dimensionUnit.toLowerCase()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-medium text-slate-500 uppercase">Área</label>
                                                                    <div className="bg-primary/10 rounded-lg px-3 py-2 text-sm font-bold text-primary flex items-center justify-center h-[42px]">
                                                                        {item.calculatedArea != null && item.pricingType === "PER_AREA" ? (
                                                                            <span>{item.calculatedArea.toFixed(4)} m²</span>
                                                                        ) : (
                                                                            <span className="text-slate-400 font-normal">—</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-medium text-slate-500 uppercase">Subtotal</label>
                                                                    <div className="bg-emerald-50 rounded-lg px-3 py-2 text-sm font-bold text-emerald-600 flex items-center justify-center h-[42px]">
                                                                        ${(item.quantity * item.price).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Conversión mostrada */}
                                                            {item.calculatedArea != null && item.pricingType === "PER_AREA" && (
                                                                <div className="mt-2 text-[10px] text-slate-400 text-right">
                                                                    ({item.length ?? 0} × {item.width ?? 0} {item.dimensionUnit.toLowerCase()} = {item.calculatedArea.toFixed(4)} m²)
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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
                            
                            {/* Totales */}
                            <div className="w-72 space-y-3">
                                {/* Selector de Tipo de Venta */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                                        Tipo de Venta
                                    </label>
                                    <Select
                                        value={formData.status}
                                        onChange={(val) => setFormData({ ...formData, status: val })}
                                        options={[
                                            { value: "PAID", label: "Contado (Pagada)", description: "Pago inmediato" },
                                            { value: "SENT", label: "Crédito (Por Cobrar)", description: "Se creará cuenta por cobrar" },
                                            { value: "DRAFT", label: "Borrador", description: "Se puede editar después" },
                                        ]}
                                        placeholder="Seleccionar tipo..."
                                    />
                                </div>
                                
                                {/* Desglose de totales */}
                                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Subtotal</span>
                                        <span>${subtotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-emerald-600">
                                        <span>Impuestos</span>
                                        <span>+${totalTax.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-slate-200">
                                        <span className="text-lg font-bold text-slate-800">Total</span>
                                        <span className="text-xl font-black text-primary">
                                            ${total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
