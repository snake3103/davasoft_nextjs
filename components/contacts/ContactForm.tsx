"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Building2, Briefcase, Save, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ContactFormProps {
    initialData?: {
        name: string;
        email?: string;
        phone?: string;
        address?: string;
        idNumber?: string;
        type: "CLIENT" | "PROVIDER" | "BOTH";
    };
    onSave: (data: any) => Promise<void>;
    isLoading?: boolean;
    title: string;
}

export function ContactForm({ initialData, onSave, isLoading, title }: ContactFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        idNumber: "",
        type: "CLIENT" as "CLIENT" | "PROVIDER" | "BOTH",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                email: initialData.email || "",
                phone: initialData.phone || "",
                address: initialData.address || "",
                idNumber: initialData.idNumber || "",
                type: initialData.type || "CLIENT",
            });
        }
    }, [initialData]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = "El nombre es obligatorio";
        if (!formData.idNumber) newErrors.idNumber = "La identificación es obligatoria";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            await onSave(formData);
        }
    };

    const typeOptions = [
        { label: "Cliente", value: "CLIENT" },
        { label: "Proveedor", value: "PROVIDER" },
        { label: "Ambos", value: "BOTH" },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
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
                        <p className="text-sm text-slate-500">Completa la información del contacto.</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 flex items-center disabled:opacity-50 hover:opacity-90 transition-all"
                >
                    {isLoading ? (
                        <Loader2 size={18} className="mr-2 animate-spin" />
                    ) : (
                        <Save size={18} className="mr-2" />
                    )}
                    Guardar Contacto
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden p-8 space-y-8">
                {/* Type Selection */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700">Tipo de contacto</label>
                    <div className="flex flex-wrap gap-4">
                        {typeOptions.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, type: opt.value as any })}
                                className={cn(
                                    "px-6 py-3 rounded-xl border text-sm font-bold transition-all",
                                    formData.type === opt.value
                                        ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                                        : "bg-slate-50 border-border text-slate-500 hover:bg-slate-100"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center">
                            <User size={14} className="mr-2 text-primary" /> Nombre / Razón Social
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Tech Solutions S.A.S"
                            className={cn(
                                "w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                errors.name && "border-rose-300 bg-rose-50"
                            )}
                        />
                        {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center">
                            <Building2 size={14} className="mr-2 text-primary" /> NIT / Identificación
                        </label>
                        <input
                            type="text"
                            value={formData.idNumber}
                            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                            placeholder="Ej: 900.123.456-7"
                            className={cn(
                                "w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                errors.idNumber && "border-rose-300 bg-rose-50"
                            )}
                        />
                        {errors.idNumber && <p className="text-xs text-rose-500 font-medium">{errors.idNumber}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center">
                            <Mail size={14} className="mr-2 text-primary" /> Correo electrónico
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="ejemplo@correo.com"
                            className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center">
                            <Phone size={14} className="mr-2 text-primary" /> Teléfono
                        </label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+57 300 000 0000"
                            className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center">
                            <Briefcase size={14} className="mr-2 text-primary" /> Dirección
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Ej: Calle 123 #45-67"
                            className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
