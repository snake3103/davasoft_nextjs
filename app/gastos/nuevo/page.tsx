"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import {
    Save,
    X,
    ChevronDown,
    Upload,
    CreditCard,
    Building2,
    Calendar as CalendarIcon
} from "lucide-react";
import Link from "next/link";

export default function NuevoGasto() {
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
                            <h1 className="text-2xl font-bold text-slate-800">Registrar Nuevo Gasto</h1>
                            <p className="text-sm text-slate-500">Registra los pagos y gastos de tu empresa.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20">
                            <Save size={18} className="mr-2" />
                            Guardar Gasto
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Proveedor</label>
                                    <div className="relative">
                                        <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-4 pr-10 text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all">
                                            <option value="">Selecciona un proveedor...</option>
                                            <option>Amazon Web Services</option>
                                            <option>Enel Colombia</option>
                                            <option>Empresas Públicas</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Categoría de Gasto</label>
                                    <div className="relative">
                                        <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-4 pr-10 text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all">
                                            <option value="">Selecciona una categoría...</option>
                                            <option>Servicios Públicos</option>
                                            <option>Arrendamientos</option>
                                            <option>Sueldos y Salarios</option>
                                            <option>Software y Cloud</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Fecha</label>
                                    <input
                                        type="date"
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Valor del Gasto</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-8 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Método de Pago</label>
                                    <div className="relative">
                                        <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-4 pr-10 text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all">
                                            <option>Efectivo</option>
                                            <option>Transferencia Bancaria</option>
                                            <option>Tarjeta de Crédito</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Observaciones (Opcional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Escribe aquí detalles adicionales del gasto..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info / Upload */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                                <Upload size={16} className="mr-2 text-primary" />
                                Soporte / Adjunto
                            </h3>
                            <div className="border-2 border-dashed border-slate-100 rounded-xl p-8 text-center hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                                <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                    <Upload size={24} />
                                </div>
                                <p className="mt-4 text-xs font-medium text-slate-500">Arrastra tu archivo aquí o haz clic para subir</p>
                                <p className="mt-1 text-[10px] text-slate-400">PDF, JPG o PNG (máx 10MB)</p>
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                            <h3 className="text-sm font-bold text-primary mb-2">Consejo</h3>
                            <p className="text-xs text-primary/70 leading-relaxed">
                                Categorizar correctamente tus gastos te ayudará a tener mejores reportes de rentabilidad al final del mes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
