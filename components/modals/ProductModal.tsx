"use client";

import { useState } from "react";
import { X, Package, Tag, DollarSign, Database, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: any) => void;
    initialData?: any;
}

export function ProductModal({ isOpen, onClose, onSave, initialData }: ProductModalProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        category: initialData?.category || "Servicios",
        price: initialData?.price?.replace(/[^0-9.]/g, '') || "",
        stock: initialData?.stock || "",
        reference: initialData?.reference || "",
        description: initialData?.description || "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = "El nombre es obligatorio";
        if (!formData.price || isNaN(parseFloat(formData.price))) newErrors.price = "Ingrese un precio válido";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{initialData ? "Editar Producto" : "Nuevo Producto"}</h2>
                        <p className="text-sm text-slate-500">Configura los detalles de tu producto o servicio.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                <Package size={14} className="mr-2 text-primary" /> Nombre del Item
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Consultoría Pro"
                                className={cn(
                                    "w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                    errors.name && "border-rose-300 bg-rose-50"
                                )}
                            />
                            {errors.name && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                <Tag size={14} className="mr-2 text-primary" /> Categoría
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                            >
                                <option value="Servicios">Servicios</option>
                                <option value="Digital">Digital</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                <DollarSign size={14} className="mr-2 text-primary" /> Precio de Venta
                            </label>
                            <input
                                type="text"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                className={cn(
                                    "w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                    errors.price && "border-rose-300 bg-rose-50"
                                )}
                            />
                            {errors.price && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase">{errors.price}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                <Database size={14} className="mr-2 text-primary" /> Stock Inicial
                            </label>
                            <input
                                type="number"
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
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                placeholder="REF-001"
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700">Descripción</label>
                            <textarea
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
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
                    >
                        {initialData ? "Guardar Cambios" : "Guardar Producto"}
                    </button>
                </div>
            </div>
        </div>
    );
}
