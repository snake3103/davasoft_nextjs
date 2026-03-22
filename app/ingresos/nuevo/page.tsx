"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCreateIncome, useClients, useCategories, useBankAccounts } from "@/hooks/useDatabase";
import { useToast } from "@/components/ui/Toast";
import {
    Save,
    X,
    ArrowUpRight,
    Users,
    Wallet,
    Calendar,
    ChevronDown,
    FileText,
    DollarSign,
    CheckCircle2,
    Clock,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

export default function NuevoIngreso() {
    const router = useRouter();
    const createIncome = useCreateIncome();
    const { data: clients = [] } = useClients();
    const { data: categories = [] } = useCategories();
    const { data: bankAccounts = [] } = useBankAccounts();
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        number: `ING-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        description: "",
        clientId: "",
        categoryId: "",
        amount: "",
        paymentMethod: "CASH",
        reference: "",
        status: "RECEIVED",
        bankAccountId: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.description) newErrors.description = "La descripción es requerida";
        if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = "Ingrese un monto válido";
        if (formData.paymentMethod === "BANK_TRANSFER" && !formData.bankAccountId) {
            newErrors.bankAccountId = "Seleccione una cuenta bancaria";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            await createIncome.mutateAsync({
                number: formData.number,
                date: formData.date,
                description: formData.description,
                clientId: formData.clientId || null,
                categoryId: formData.categoryId || null,
                amount: parseFloat(formData.amount),
                paymentMethod: formData.paymentMethod,
                reference: formData.reference || null,
                status: formData.status,
                bankAccountId: formData.bankAccountId || null,
            });
            showToast("success", "Ingreso registrado exitosamente");
            router.push("/ingresos");
        } catch (error: any) {
            showToast("error", "Error al crear ingreso: " + (error.message || "Error desconocido"));
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCategories = categories.filter((cat: any) => cat.type === "SERVICE" || !cat.type);

    return (
        <AppLayout>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/ingresos"
                            className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200"
                        >
                            <X size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Registrar Nuevo Ingreso</h1>
                            <p className="text-sm text-slate-500">Registra entradas de dinero a tus cuentas bancarias o caja.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/ingresos"
                            className="px-6 py-2.5 border border-border text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="mr-2 animate-spin" />
                            ) : (
                                <Save size={18} className="mr-2" />
                            )}
                            Guardar Ingreso
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8">
                    <div className="max-w-3xl mx-auto space-y-10 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Número de Referencia</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.number}
                                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Fecha del Ingreso</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Cliente (Recibido de)</label>
                                <Select
                                    value={formData.clientId}
                                    onChange={(val) => setFormData({ ...formData, clientId: val })}
                                    options={[
                                        { value: "", label: "Selecciona un cliente...", description: "Sin cliente específico" },
                                        ...clients.map((client: any) => ({ 
                                            value: client.id, 
                                            label: client.name,
                                            description: client.email || undefined
                                        })),
                                    ]}
                                    placeholder="Buscar cliente..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Categoría</label>
                                <Select
                                    value={formData.categoryId}
                                    onChange={(val) => setFormData({ ...formData, categoryId: val })}
                                    options={[
                                        { value: "", label: "Selecciona una categoría...", description: "Sin categoría" },
                                        ...filteredCategories.map((cat: any) => ({ 
                                            value: cat.id, 
                                            label: cat.name,
                                            description: cat.description || undefined
                                        })),
                                    ]}
                                    placeholder="Buscar categoría..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-50 pt-10">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Monto del Ingreso</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className={cn(
                                            "w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-11 pr-4 text-xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-black text-slate-800",
                                            errors.amount && "border-rose-500 focus:ring-rose-500/10 focus:border-rose-500"
                                        )}
                                    />
                                    {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Referencia (Opcional)</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Número de referencia externo"
                                        value={formData.reference}
                                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 border-t border-slate-50 pt-10">
                            <label className="text-sm font-bold text-slate-700">Método de Pago</label>
                            <div className="flex space-x-4">
                                {[
                                    { value: "CASH", label: "Efectivo", icon: DollarSign },
                                    { value: "BANK_TRANSFER", label: "Transferencia", icon: Wallet },
                                    { value: "OTHER", label: "Otro", icon: FileText },
                                ].map((method) => (
                                    <button
                                        key={method.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, paymentMethod: method.value })}
                                        className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center ${
                                            formData.paymentMethod === method.value
                                                ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                                : "bg-slate-50 border-border text-slate-500 hover:bg-slate-100"
                                        }`}
                                    >
                                        <method.icon size={16} className="mr-2" />
                                        {method.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {formData.paymentMethod === "BANK_TRANSFER" && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Cuenta Bancaria</label>
                                <Select
                                    value={formData.bankAccountId}
                                    onChange={(val) => setFormData({ ...formData, bankAccountId: val })}
                                    options={[
                                        { value: "", label: "Selecciona una cuenta...", description: "Sin cuenta" },
                                        ...bankAccounts.map((account: any) => ({ 
                                            value: account.id, 
                                            label: `${account.name} - ${account.accountNumber}`,
                                            description: account.bankName || undefined
                                        })),
                                    ]}
                                    placeholder="Buscar cuenta..."
                                    error={!!errors.bankAccountId}
                                />
                                {errors.bankAccountId && <p className="text-xs text-rose-500 mt-1">{errors.bankAccountId}</p>}
                            </div>
                        )}

                        <div className="space-y-2 border-t border-slate-50 pt-10">
                            <label className="text-sm font-bold text-slate-700">Concepto / Descripción</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                                <textarea
                                    rows={4}
                                    placeholder="Escribe el concepto del ingreso..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={cn(
                                        "w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none",
                                        errors.description && "border-rose-500 focus:ring-rose-500/10 focus:border-rose-500"
                                    )}
                                />
                                {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
                            </div>
                        </div>

                        <div className="space-y-2 border-t border-slate-50 pt-10">
                            <label className="text-sm font-bold text-slate-700">Estado del Ingreso</label>
                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: "RECEIVED" })}
                                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center ${
                                        formData.status === "RECEIVED"
                                            ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                            : "bg-slate-50 border-border text-slate-500 hover:bg-slate-100"
                                    }`}
                                >
                                    <CheckCircle2 size={16} className="mr-2" />
                                    Recibido
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: "PENDING" })}
                                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center ${
                                        formData.status === "PENDING"
                                            ? "bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/20"
                                            : "bg-slate-50 border-border text-slate-500 hover:bg-slate-100"
                                    }`}
                                >
                                    <Clock size={16} className="mr-2" />
                                    Pendiente
                                </button>
                            </div>
                        </div>

                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 text-emerald-800">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-500 text-white rounded-lg">
                                    <ArrowUpRight size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Registro Directo</h4>
                                    <p className="text-xs opacity-75">Este ingreso se verá reflejado inmediatamente en tu flujo de caja.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
