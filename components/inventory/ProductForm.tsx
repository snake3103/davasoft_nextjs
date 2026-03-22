"use client";

import { useState, useEffect, useActionState, useRef } from "react";
import {
    Save,
    X,
    Package,
    Tag,
    Barcode,
    Layers,
    DollarSign,
    Upload,
    Loader2,
    Ruler,
    Hash,
    Plus,
    Trash2,
    ChevronDown,
    Search,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTaxes, useProducts } from "@/hooks/useDatabase";
import { Select } from "@/components/ui/Select";
import { MaterialCostSummary } from "./MaterialCostSummary";

interface ProductFormProps {
    initialData?: any;
    action: (prevState: any, formData: FormData) => Promise<any>;
    title: string;
}

// ─── Interfaces para materiales ───────────────────────────────────────────────
interface MaterialSubstitute {
    id?: string;
    substituteId: string;
    substituteName?: string;
    substituteStock?: number;
    priority: number;
    quantityRatio: number;
    isActive: boolean;
}

interface BomItem {
    id?: string;
    componentId: string;
    componentName?: string;
    componentStock?: number;
    quantity: number;
    isOptional: boolean;
    scrapPercent: number;
    substitutes: MaterialSubstitute[];
}

// ─── Selector de producto para materiales ─────────────────────────────────────
interface MaterialSearchProps {
    value: string;
    onSelect: (product: { id: string; name: string; stock: number }) => void;
    onChange: (val: string) => void;
    products: any[];
    excludeIds?: string[];
}

function MaterialSearch({ value, onSelect, onChange, products, excludeIds = [] }: MaterialSearchProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { 
        setQuery(value); 
    }, [value]);

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
            zIndex: 99999,
        });
        setOpen(true);
        if (value && query) {
            setQuery("");
        }
    };

    const filtered = products.filter((p: any) => {
        const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(query.toLowerCase()));
        const notExcluded = !excludeIds.includes(p.id) && p.id !== value;
        return matchesQuery && notExcluded;
    });

    const handleSelect = (p: any) => {
        onSelect({ id: p.id, name: p.name, stock: p.stock ?? 0 });
        onChange(p.name);
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setQuery("");
        onSelect({ id: "", name: "", stock: 0 });
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
                    placeholder="Buscar material..."
                    value={query}
                    title={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={handleOpen}
                    className="bg-white border border-slate-200 rounded-lg w-full pl-8 pr-8 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
            {open && (
                <div style={dropdownStyle} className="bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                            <p className="text-xs text-slate-400 italic">Sin resultados</p>
                        </div>
                    ) : (
                        filtered.map((p: any) => (
                            <button
                                key={p.id}
                                type="button"
                                onMouseDown={() => handleSelect(p)}
                                className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0"
                            >
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                    <Package size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">{p.name}</p>
                                    {p.sku && <p className="text-[10px] text-slate-400">SKU: {p.sku}</p>}
                                </div>
                                <div className="text-right">
                                    <span className={cn(
                                        "text-xs font-medium",
                                        (p.stock ?? 0) > 0 ? "text-emerald-600" : "text-rose-500"
                                    )}>
                                        Stock: {p.stock ?? 0}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export function ProductForm({ initialData, action, title }: ProductFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [state, formAction, isPending] = useActionState(action, null);
    const { data: taxes = [] } = useTaxes();
    const { data: allProducts = [] } = useProducts();

    // Extraer BOM del initialData
    const initialBom = initialData?.billsOfMaterials?.[0];
    const initialBomItems = initialBom?.boMItems?.map((item: any) => ({
        id: item.id,
        componentId: item.componentId,
        componentName: item.component?.name,
        componentStock: item.component?.stock,
        quantity: Number(item.quantity),
        isOptional: item.isOptional ?? false,
        scrapPercent: Number(item.scrapPercent ?? 0),
        substitutes: (item.substitutes ?? []).map((sub: any) => ({
            id: sub.id,
            substituteId: sub.substituteId,
            substituteName: sub.substitute?.name,
            substituteStock: sub.substitute?.stock,
            priority: sub.priority ?? 1,
            quantityRatio: Number(sub.quantityRatio ?? 1),
            isActive: sub.isActive ?? true,
        })),
    })) ?? [];

    const [formData, setFormData] = useState({
        name: initialData?.name ?? "",
        sku: initialData?.sku ?? "",
        barcode: initialData?.barcode ?? "",
        description: initialData?.description ?? "",
        price: initialData?.price ?? "",
        stock: initialData?.stock ?? 0,
        categoryId: initialData?.categoryId ?? "",
        taxId: initialData?.taxId ?? "",
        manageStock: true,
        productType: initialData?.productType ?? "FINISHED",
        // Dimensiones
        hasDimensions: initialData?.hasDimensions ?? false,
        length: initialData?.length ?? "",
        width: initialData?.width ?? "",
        height: initialData?.height ?? "",
        dimensionUnit: initialData?.dimensionUnit ?? "CM",
        // Tipo de precio
        pricingType: initialData?.pricingType ?? "FIXED",
        pricePerUnit: initialData?.pricePerUnit ?? "",
        // Lista de materiales
        bomItems: initialBomItems,
    });

    // Productos excluidos de la búsqueda (no puede ser su propio material)
    const excludedProductIds = [initialData?.id].filter(Boolean);

    const [expandedMaterials, setExpandedMaterials] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (state?.success) {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            router.push("/inventario");
        }
    }, [state, router, queryClient]);

    // ─── Funciones para manejar materiales ───────────────────────────────────────
    const addMaterial = () => {
        setFormData({
            ...formData,
            bomItems: [
                ...formData.bomItems,
                {
                    componentId: "",
                    componentName: "",
                    quantity: 1,
                    isOptional: false,
                    scrapPercent: 0,
                    substitutes: [],
                },
            ],
        });
    };

    const removeMaterial = (index: number) => {
        const newItems = formData.bomItems.filter((_: BomItem, i: number) => i !== index);
        setFormData({ ...formData, bomItems: newItems });
    };

    const updateMaterial = (index: number, field: keyof BomItem, value: any) => {
        const newItems = [...formData.bomItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, bomItems: newItems });
    };

    const toggleExpandMaterial = (index: number) => {
        const key = `material-${index}`;
        setExpandedMaterials((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // ─── Funciones para manejar sustitutos ───────────────────────────────────────
    const addSubstitute = (materialIndex: number) => {
        const newItems = [...formData.bomItems];
        const newSubstitute: MaterialSubstitute = {
            substituteId: "",
            substituteName: "",
            priority: (newItems[materialIndex].substitutes.length + 1),
            quantityRatio: 1,
            isActive: true,
        };
        newItems[materialIndex].substitutes = [
            ...newItems[materialIndex].substitutes,
            newSubstitute,
        ];
        setFormData({ ...formData, bomItems: newItems });
    };

    const removeSubstitute = (materialIndex: number, substituteIndex: number) => {
        const newItems = [...formData.bomItems];
        newItems[materialIndex].substitutes = newItems[materialIndex].substitutes.filter(
            (_: MaterialSubstitute, i: number) => i !== substituteIndex
        );
        // Reordenar prioridades
        newItems[materialIndex].substitutes = newItems[materialIndex].substitutes.map(
            (sub: MaterialSubstitute, i: number) => ({ ...sub, priority: i + 1 })
        );
        setFormData({ ...formData, bomItems: newItems });
    };

    const updateSubstitute = (
        materialIndex: number,
        substituteIndex: number,
        field: keyof MaterialSubstitute,
        value: any
    ) => {
        const newItems = [...formData.bomItems];
        newItems[materialIndex].substitutes[substituteIndex] = {
            ...newItems[materialIndex].substitutes[substituteIndex],
            [field]: value,
        };
        setFormData({ ...formData, bomItems: newItems });
    };

    // Excluir materiales ya seleccionados y el producto mismo
    const getExcludedIds = (currentMaterialIndex: number) => {
        const selectedIds = formData.bomItems
            .map((item: BomItem, idx: number) => (idx !== currentMaterialIndex && item.componentId ? item.componentId : null))
            .filter(Boolean);
        return [...new Set([...selectedIds, ...excludedProductIds])];
    };

    // Verificar si un material tiene stock bajo
    const hasLowStock = (stock: number | undefined) => {
        return (stock ?? 0) <= 0;
    };

    return (
        <form action={formAction} className="space-y-6">
            {/* Hidden inputs */}
            <input type="hidden" name="taxId" value={formData.taxId} />
            <input type="hidden" name="productType" value={formData.productType} />
            <input type="hidden" name="hasDimensions" value={formData.hasDimensions} />
            <input type="hidden" name="length" value={formData.length} />
            <input type="hidden" name="width" value={formData.width} />
            <input type="hidden" name="height" value={formData.height} />
            <input type="hidden" name="dimensionUnit" value={formData.dimensionUnit} />
            <input type="hidden" name="pricingType" value={formData.pricingType} />
            <input type="hidden" name="pricePerUnit" value={formData.pricePerUnit} />
            <input type="hidden" name="bomItems" value={JSON.stringify(formData.bomItems)} />
            
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200"
                    >
                        <X size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
                        <p className="text-sm text-slate-500">Registra o edita un item en tu catálogo de inventario.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    {state?.error && (
                        <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-lg text-xs font-bold border border-rose-100">
                            {state.error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {isPending ? (
                            <Loader2 size={18} className="mr-2 animate-spin" />
                        ) : (
                            <Save size={18} className="mr-2" />
                        )}
                        Guardar Producto
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Nombre del Producto</label>
                            <div className="relative">
                                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Ej: Camisa Pro Negra M"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Referencia (SKU)</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="sku"
                                        placeholder="Ej: SKU-001"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Código de Barras</label>
                                <div className="relative">
                                    <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="barcode"
                                        placeholder="Ej: 770123456789"
                                        value={formData.barcode}
                                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-50 pt-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Precio de Venta</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        name="price"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-800"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Impuesto</label>
                                <Select
                                    value={formData.taxId}
                                    onChange={(val) => setFormData({ ...formData, taxId: val })}
                                    options={[
                                        { value: "", label: "Sin impuesto", description: "Producto exento de impuestos" },
                                        ...taxes.filter((t: any) => t.isActive).map((t: any) => ({ 
                                            value: t.id, 
                                            label: t.name,
                                            description: t.type === "PERCENTAGE" ? `${t.value}%` : `$${t.value.toLocaleString()}`
                                        })),
                                    ]}
                                    placeholder="Seleccionar impuesto..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Inventory Detail */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Control de Inventario</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">¿Maneja Inventario?</label>
                                <p className="text-xs text-slate-400 mb-2">Activa esta opción para controlar el stock.</p>
                                <div className="flex items-center space-x-3 bg-slate-50 p-1 rounded-xl w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, manageStock: true })}
                                        className={`px-6 py-2 text-xs font-bold rounded-lg shadow-sm uppercase tracking-wider transition-all ${formData.manageStock ? "bg-white text-primary border border-slate-100" : "text-slate-500 hover:text-slate-700"}`}
                                    > Sí </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, manageStock: false })}
                                        className={`px-6 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all ${!formData.manageStock ? "bg-white text-primary border border-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    > No </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Cantidad Inicial</label>
                                <input
                                    type="number"
                                    name="stock"
                                    placeholder="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                    disabled={!formData.manageStock}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dimensions Section */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center">
                                <Ruler size={14} className="mr-2" />
                                Dimensiones y Tipo de Precio
                            </h3>
                            <div className="flex items-center space-x-3 bg-slate-50 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, hasDimensions: true })}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${formData.hasDimensions ? "bg-white text-primary border border-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                > Activo </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, hasDimensions: false })}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${!formData.hasDimensions ? "bg-white text-slate-600 border border-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                > Inactivo </button>
                            </div>
                        </div>

                        {formData.hasDimensions && (
                            <div className="space-y-6">
                                {/* Dimension Inputs */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600">Largo</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={formData.length}
                                                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600">Ancho</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={formData.width}
                                                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600">Alto</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={formData.height}
                                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600">Unidad</label>
                                        <Select
                                            value={formData.dimensionUnit}
                                            onChange={(val) => setFormData({ ...formData, dimensionUnit: val })}
                                            options={[
                                                { value: "CM", label: "Centímetros", description: "cm" },
                                                { value: "M", label: "Metros", description: "m" },
                                                { value: "MM", label: "Milímetros", description: "mm" },
                                                { value: "IN", label: "Pulgadas", description: "in" },
                                                { value: "FT", label: "Pies", description: "ft" },
                                            ]}
                                            placeholder="Unidad..."
                                        />
                                    </div>
                                </div>

                                {/* Pricing Type */}
                                <div className="border-t border-slate-50 pt-6">
                                    <label className="text-xs font-bold text-slate-600 mb-3 block">Tipo de Precio</label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                        {[
                                            { value: "FIXED", label: "Fijo", desc: "Precio único" },
                                            { value: "PER_UNIT", label: "Por Unidad", desc: "Precio por unidad" },
                                            { value: "PER_LINEAR", label: "Lineal", desc: "Precio por metro lineal" },
                                            { value: "PER_AREA", label: "Área", desc: "Precio por m²" },
                                            { value: "PER_VOLUME", label: "Volumen", desc: "Precio por m³" },
                                        ].map((type) => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, pricingType: type.value })}
                                                className={`p-3 rounded-xl border text-left transition-all ${formData.pricingType === type.value ? "bg-primary/5 border-primary/30" : "bg-slate-50 border-slate-100 hover:border-slate-200"}`}
                                            >
                                                <div className="text-xs font-bold text-slate-700">{type.label}</div>
                                                <div className="text-[10px] text-slate-400">{type.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Per Unit (for dimension-based pricing) */}
                                {["PER_LINEAR", "PER_AREA", "PER_VOLUME", "PER_UNIT"].includes(formData.pricingType) && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600">Precio por Unidad de Medida</label>
                                        <div className="relative max-w-xs">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.pricePerUnit}
                                                onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400">
                                            {formData.pricingType === "PER_LINEAR" && "Precio por cada unidad de medida lineal (ej: $50/metro lineal)"}
                                            {formData.pricingType === "PER_AREA" && "Precio por cada unidad de área (ej: $100/m²)"}
                                            {formData.pricingType === "PER_VOLUME" && "Precio por cada unidad de volumen (ej: $200/m³)"}
                                            {formData.pricingType === "PER_UNIT" && "Precio base por unidad, se multiplica por la cantidad"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!formData.hasDimensions && (
                            <div className="text-center py-6 text-sm text-slate-400">
                                <Ruler size={32} className="mx-auto mb-2 opacity-50" />
                                <p>Activa las dimensiones para productos que se venden por medida (ventanas, muebles, etc.)</p>
                            </div>
                        )}
                    </div>

                    {/* ─── Bill of Materials / Lista de Materiales ─── */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center">
                                <Layers size={14} className="mr-2" />
                                Lista de Materiales
                            </h3>
                        </div>

                        {/* Tipo de producto */}
                        <div className="border-t border-slate-50 pt-6">
                            <label className="text-xs font-bold text-slate-600 mb-3 block">Tipo de Producto</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                    { value: "FINISHED", label: "Producto Terminado", desc: "Para vender" },
                                    { value: "SEMI_FINISHED", label: "Sub-ensamble", desc: "Para otros productos" },
                                    { value: "RAW", label: "Materia Prima", desc: "Material base" },
                                    { value: "CONFIGURABLE", label: "Configurable", desc: "Con atributos" },
                                ].map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, productType: type.value })}
                                        className={`p-3 rounded-xl border text-left transition-all ${formData.productType === type.value ? "bg-primary/5 border-primary/30" : "bg-slate-50 border-slate-100 hover:border-slate-200"}`}
                                    >
                                        <div className="text-xs font-bold text-slate-700">{type.label}</div>
                                        <div className="text-[10px] text-slate-400">{type.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Lista de materiales (solo para FINISHED y SEMI_FINISHED) */}
                        {["FINISHED", "SEMI_FINISHED"].includes(formData.productType) && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-500">
                                        Agrega los materiales necesarios para fabricar este producto
                                    </p>
                                    <button
                                        type="button"
                                        onClick={addMaterial}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors"
                                    >
                                        <Plus size={14} />
                                        Agregar Material
                                    </button>
                                </div>

                                {formData.bomItems.length === 0 ? (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <Layers size={32} className="mx-auto mb-2 text-slate-300" />
                                        <p className="text-sm text-slate-400">No hay materiales agregados</p>
                                        <p className="text-xs text-slate-400 mt-1">Haz clic en "Agregar Material" para comenzar</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {formData.bomItems.map((item: BomItem, index: number) => (
                                            <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                                                {/* Header del material */}
                                                <div className="bg-slate-50 px-4 py-3 flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpandMaterial(index)}
                                                        className={cn(
                                                            "p-1 rounded transition-colors",
                                                            expandedMaterials[`material-${index}`] ? "text-primary" : "text-slate-400"
                                                        )}
                                                    >
                                                        <ChevronDown
                                                            size={16}
                                                            className={cn(
                                                                "transition-transform",
                                                                expandedMaterials[`material-${index}`] && "rotate-180"
                                                            )}
                                                        />
                                                    </button>

                                                    <div className="flex-1 min-w-0">
                                                        {item.componentId ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-slate-700 truncate">
                                                                    {item.componentName}
                                                                </span>
                                                                {hasLowStock(item.componentStock) && (
                                                                    <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-bold rounded">
                                                                        Sin stock
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-slate-400 italic">Sin material seleccionado</span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <span className="text-slate-500">Cant:</span>
                                                            <input
                                                                type="number"
                                                                min={0.0001}
                                                                step={0.1}
                                                                value={item.quantity}
                                                                onChange={(e) => updateMaterial(index, "quantity", parseFloat(e.target.value) || 0)}
                                                                className="w-16 bg-white border border-slate-200 rounded px-2 py-1 text-center text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                            />
                                                        </div>

                                                        <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={item.isOptional}
                                                                onChange={(e) => updateMaterial(index, "isOptional", e.target.checked)}
                                                                className="rounded border-slate-300 text-primary focus:ring-primary/20"
                                                            />
                                                            Opcional
                                                        </label>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeMaterial(index)}
                                                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Selector de material */}
                                                <div className="px-4 py-3 border-t border-slate-100">
                                                    <MaterialSearch
                                                        value={item.componentName ?? ""}
                                                        onSelect={(product) => {
                                                            updateMaterial(index, "componentId", product.id);
                                                            updateMaterial(index, "componentName", product.name);
                                                            updateMaterial(index, "componentStock", product.stock);
                                                        }}
                                                        onChange={(val) => updateMaterial(index, "componentName", val)}
                                                        products={allProducts}
                                                        excludeIds={getExcludedIds(index)}
                                                    />
                                                </div>

                                                {/* Sustitutos expandidos */}
                                                {expandedMaterials[`material-${index}`] && item.componentId && (
                                                    <div className="px-4 py-3 bg-blue-50/50 border-t border-blue-100 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <RefreshCw size={14} className="text-blue-500" />
                                                                <span className="text-xs font-bold text-blue-600">Sustitutos</span>
                                                                <span className="text-[10px] text-blue-400">
                                                                    ({item.substitutes.length} agregados)
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => addSubstitute(index)}
                                                                className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded hover:bg-blue-200 transition-colors"
                                                            >
                                                                <Plus size={12} />
                                                                Agregar
                                                            </button>
                                                        </div>

                                                        {item.substitutes.length === 0 ? (
                                                            <p className="text-xs text-slate-400 text-center py-2">
                                                                No hay sustitutos. Si este material no está disponible, puedes agregar alternativas.
                                                            </p>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {item.substitutes.map((sub: MaterialSubstitute, subIndex: number) => (
                                                                    <div key={subIndex} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-blue-100">
                                                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 text-xs font-bold rounded flex items-center justify-center">
                                                                            {sub.priority}
                                                                        </span>
                                                                        <div className="flex-1">
                                                                            <MaterialSearch
                                                                                value={sub.substituteName ?? ""}
                                                                                onSelect={(product) => {
                                                                                    updateSubstitute(index, subIndex, "substituteId", product.id);
                                                                                    updateSubstitute(index, subIndex, "substituteName", product.name);
                                                                                    updateSubstitute(index, subIndex, "substituteStock", product.stock);
                                                                                }}
                                                                                onChange={(val) => updateSubstitute(index, subIndex, "substituteName", val)}
                                                                                products={allProducts}
                                                                                excludeIds={[item.componentId, ...getExcludedIds(index)]}
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <label className="text-[10px] text-slate-500">Ratio:</label>
                                                                            <input
                                                                                type="number"
                                                                                min={0.1}
                                                                                step={0.1}
                                                                                value={sub.quantityRatio}
                                                                                onChange={(e) => updateSubstitute(index, subIndex, "quantityRatio", parseFloat(e.target.value) || 1)}
                                                                                className="w-14 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-center text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                            />
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeSubstitute(index, subIndex)}
                                                                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                    {/* Resumen de costos */}
                                    <MaterialCostSummary items={formData.bomItems} products={allProducts} />
                                </div>
                            )}

                        {/* Info para otros tipos */}
                        {formData.productType === "RAW" && (
                            <div className="text-center py-6 text-sm text-slate-400">
                                <Package size={32} className="mx-auto mb-2 opacity-50" />
                                <p>Las materias primas se usan como materiales en otros productos.</p>
                            </div>
                        )}

                        {formData.productType === "CONFIGURABLE" && (
                            <div className="text-center py-6 text-sm text-slate-400">
                                <Layers size={32} className="mx-auto mb-2 opacity-50" />
                                <p>Los productos configurables usan atributos (ancho, alto, material) para calcular materiales.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Image Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                            <Upload size={16} className="mr-2 text-primary" />
                            Imagen del Producto
                        </h3>
                        <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center p-6 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-all group-hover:scale-110 mb-4">
                                <Package size={32} />
                            </div>
                            <p className="text-xs font-bold text-slate-700">Subir imagen</p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">JPG, PNG hasta 5MB</p>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                        <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2">Importante</h4>
                        <p className="text-xs text-amber-600/80 leading-relaxed">
                            Asegúrate de configurar correctamente el SKU. Este será el identificador único para tus reportes de ventas por producto.
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}
