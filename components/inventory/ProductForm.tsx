"use client";

import { useState, useEffect, useActionState } from "react";
import {
    Save,
    X,
    Package,
    Tag,
    Barcode,
    Layers,
    ChevronDown,
    DollarSign,
    Upload,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

interface ProductFormProps {
    initialData?: any;
    action: (prevState: any, formData: FormData) => Promise<any>;
    title: string;
}

export function ProductForm({ initialData, action, title }: ProductFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [state, formAction, isPending] = useActionState(action, null);

    const [formData, setFormData] = useState({
        name: initialData?.name ?? "",
        sku: initialData?.sku ?? "",
        barcode: initialData?.barcode ?? "",
        description: initialData?.description ?? "",
        price: initialData?.price ?? "",
        stock: initialData?.stock ?? 0,
        categoryId: initialData?.categoryId ?? "",
        manageStock: true, // Local state for UI toggle
    });

    useEffect(() => {
        if (state?.success) {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            router.push("/inventario");
        }
    }, [state, router, queryClient]);

    return (
        <form action={formAction} className="space-y-6">
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
                                <div className="relative">
                                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-4 pr-10 text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all">
                                        <option>IVA (19%)</option>
                                        <option>Exento (0%)</option>
                                        <option>INC (8%)</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
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
