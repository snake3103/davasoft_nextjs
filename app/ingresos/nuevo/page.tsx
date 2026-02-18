"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import {
    Save,
    X,
    ArrowUpRight,
    Users,
    Wallet,
    Calendar as CalendarIcon,
    ChevronDown,
    FileText,
    DollarSign
} from "lucide-react";
import Link from "next/link";

export default function NuevoIngreso() {
    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/"
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
                        <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20">
                            <Save size={18} className="mr-2" />
                            Guardar Ingreso
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8">
                    <div className="max-w-3xl mx-auto space-y-10 py-4">
                        {/* Main Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Cliente (Recibido de)</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-10 text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all">
                                        <option value="">Selecciona un cliente...</option>
                                        <option>Tech Solutions S.A.S</option>
                                        <option>Almacenes Éxito</option>
                                        <option>Ventas Mostrador</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Cuenta de Destino</label>
                                <div className="relative">
                                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-10 text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all">
                                        <option>Caja General</option>
                                        <option>Bancolombia - Principal</option>
                                        <option>Davivienda - Ahorros</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-50 pt-10">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Monto del Ingreso</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-11 pr-4 text-xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-black text-slate-800"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Fecha del Ingreso</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 border-t border-slate-50 pt-10">
                            <label className="text-sm font-bold text-slate-700">Concepto / Descripción</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                                <textarea
                                    rows={4}
                                    placeholder="Escribe el concepto del ingreso..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                                ></textarea>
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
            </div>
        </AppLayout>
    );
}
