"use client";

import { useState, useEffect, useActionState } from "react";
import { X, Package, Tag, DollarSign, Database, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategorySearch } from "@/components/ui/Autocomplete";
import { useCategories } from "@/hooks/useDatabase";
import { createProduct, updateProduct } from "@/app/actions/products";
import { useQueryClient } from "@tanstack/react-query";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
}

export function ProductModal({ isOpen, onClose, initialData }: ProductModalProps) {
    const { data: categories = [] } = useCategories();
    const queryClient = useQueryClient();

    const action = initialData
        ? updateProduct.bind(null, initialData.id)
        : createProduct;

    const [state, formAction, isPending] = useActionState(action, null);

    const [formData, setFormData] = useState({
        name: "",
        categoryId: "",
        price: "",
        stock: "",
        sku: "",
        description: "",
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: initialData?.name || "",
                categoryId: initialData?.categoryId || "",
                price: initialData?.price?.toString() || "",
                stock: initialData?.stock?.toString() || "",
                sku: initialData?.sku || initialData?.reference || "",
                description: initialData?.description || "",
            });
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        if (state?.success) {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            onClose();
        }
    }, [state, onClose, queryClient]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <form action={formAction} className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{initialData ? "Editar Producto" : "Nuevo Producto"}</h2>
                        <p className="text-sm text-slate-500">Configura los detalles de tu producto o servicio.</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {state?.error && (
                        <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-lg text-xs font-bold border border-rose-100">
                            {state.error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                <Package size={14} className="mr-2 text-primary" /> Nombre del Item
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Consultoría Pro"
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                required
                            />
                        </div>

                        <input type="hidden" name="categoryId" value={formData.categoryId} />
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                <Tag size={14} className="mr-2 text-primary" /> Categoría
                            </label>
                            <CategorySearch
                                value={categories.find((c: any) => c.id === formData.categoryId)?.name || ""}
                                onChange={(val: string) => {
                                    if (!val) setFormData({ ...formData, categoryId: "" });
                                }}
                                onSelect={(c: any) => setFormData({ ...formData, categoryId: c.id })}
                                categories={categories.filter((c: any) => c.type === 'PRODUCT' || c.type === 'SERVICE')}
                                placeholder="Seleccionar categoría..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                <DollarSign size={14} className="mr-2 text-primary" /> Precio de Venta
                            </label>
                            <input
                                type="number"
                                name="price"
                                step="any"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                <Database size={14} className="mr-2 text-primary" /> Stock Inicial
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                placeholder="0"
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                <FileText size={14} className="mr-2 text-primary" /> Referencia (SKU)
                            </label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                placeholder="REF-001"
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700">Descripción</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detalles adicionales del producto..."
                                rows={3}
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 border-t border-border flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center disabled:opacity-50"
                    >
                        {isPending ? <Loader2 size={18} className="mr-2 animate-spin" /> : null}
                        {initialData ? "Guardar Cambios" : "Guardar Producto"}
                    </button>
                </div>
            </form>
        </div>
    );
}
