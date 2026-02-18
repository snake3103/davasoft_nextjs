"use client";

import { useState } from "react";
import { X, Building2, Tag, DollarSign, Calendar, FileText, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (expense: any) => void;
    initialData?: any;
}

export function ExpenseModal({ isOpen, onClose, onSave, initialData }: ExpenseModalProps) {
    const [formData, setFormData] = useState({
        provider: initialData?.provider || "",
        category: initialData?.category || "Suministros",
        total: initialData?.total?.replace(/[^0-9.]/g, '') || "",
        date: initialData?.date || new Date().toISOString().split('T')[0],
        reference: initialData?.id || "",
        status: initialData?.status || "Pagado",
        description: initialData?.description || "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.provider) newErrors.provider = "El proveedor es obligatorio";
        if (!formData.total || isNaN(parseFloat(formData.total))) newErrors.total = "Ingrese un monto válido";
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
                        <h2 className="text-xl font-bold text-slate-800">{initialData ? "Editar Gasto" : "Nuevo Gasto"}</h2>
                        <p className="text-sm text-slate-500">Registra un egreso de dinero de tu empresa.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700">Estado del pago</label>
                        <div className="flex space-x-4">
                            {["Pagado", "Pendiente"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFormData({ ...formData, status })}
                                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center ${formData.status === status
                                            ? "bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/20"
                                            : "bg-slate-50 border-border text-slate-500 hover:bg-slate-100"
                                        }`}
                                >
                                    {status === "Pagado" ? <CheckCircle2 size={16} className="mr-2" /> : <Clock size={16} className="mr-2" />}
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                <Building2 size={14} className="mr-2 text-primary" /> Proveedor / Beneficiario
                            </label>
                            <input
                                type="text"
                                value={formData.provider}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                placeholder="Ej: Amazon Web Services"
                                className={cn(
                                    "w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                    errors.provider && "border-rose-300 bg-rose-50"
                                )}
                            />
                            {errors.provider && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase">{errors.provider}</p>}
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
                                <option value="Suministros">Suministros</option>
                                <option value="Arriendo">Arriendo</option>
                                <option value="Servicios Públicos">Servicios Públicos</option>
                                <option value="Servicios Cloud">Servicios Cloud</option>
                                <option value="Nómina">Nómina</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                <DollarSign size={14} className="mr-2 text-primary" /> Monto Total
                            </label>
                            <input
                                type="text"
                                value={formData.total}
                                onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                                placeholder="0.00"
                                className={cn(
                                    "w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                    errors.total && "border-rose-300 bg-rose-50"
                                )}
                            />
                            {errors.total && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase">{errors.total}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                <Calendar size={14} className="mr-2 text-primary" /> Fecha
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                <FileText size={14} className="mr-2 text-primary" /> Referencia (Opcional)
                            </label>
                            <input
                                type="text"
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                placeholder="Ej: G-542"
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700">Descripción / Notas</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Añade una descripción sobre este gasto..."
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
                        className="px-8 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-rose-600/30 transition-all"
                    >
                        {initialData ? "Guardar Cambios" : "Guardar Gasto"}
                    </button>
                </div>
            </div>
        </div>
    );
}
