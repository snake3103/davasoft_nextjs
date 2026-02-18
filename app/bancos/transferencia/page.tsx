"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import {
    Save,
    X,
    Wallet,
    ArrowRightLeft,
    ArrowRight,
    Calendar as CalendarIcon,
    ChevronDown,
    Info,
    DollarSign
} from "lucide-react";
import Link from "next/link";

export default function NuevaTransferencia() {
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
                            <h1 className="text-2xl font-bold text-slate-800">Nueva Transferencia</h1>
                            <p className="text-sm text-slate-500">Mueve dinero entre tus cuentas bancarias y cajas.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20">
                            <Save size={18} className="mr-2" />
                            Guardar Transferencia
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8">
                    <div className="max-w-4xl mx-auto py-4">
                        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                            {/* Source Account */}
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-sm font-bold text-slate-700">Cuenta de Origen</label>
                                <div className="relative">
                                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                                    <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-6 pl-12 pr-10 text-lg font-bold text-slate-800 appearance-none outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all">
                                        <option>Bancolombia - 4567</option>
                                        <option>Davivienda - 1234</option>
                                        <option>Caja Menor</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                </div>
                                <p className="text-xs text-slate-400 px-2 italic">Saldo: $12,450.00</p>
                            </div>

                            {/* Arrow Icon */}
                            <div className="bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/20 z-10 shrink-0">
                                <ArrowRight size={24} className="hidden md:block" />
                                <ArrowRight className="md:hidden rotate-90" size={24} />
                            </div>

                            {/* Destination Account */}
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-sm font-bold text-slate-700">Cuenta de Destino</label>
                                <div className="relative">
                                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-6 pl-12 pr-10 text-lg font-bold text-slate-800 appearance-none outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all">
                                        <option value="">Selecciona cuenta...</option>
                                        <option>Davivienda - 1234</option>
                                        <option>Caja Menor</option>
                                        <option>Bancolombia - 4567</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                </div>
                                <p className="text-xs text-slate-400 px-2 italic">Selecciona para ver saldo</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-50 pt-10">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Monto a Transferir</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold" size={20} />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-12 pr-4 text-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-black text-slate-800"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Fecha</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="date"
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-2">
                            <label className="text-sm font-bold text-slate-700">Concepto / Notas</label>
                            <textarea
                                rows={3}
                                placeholder="Ej: Reposición de caja menor..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none"
                            ></textarea>
                        </div>

                        <div className="mt-12 bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-start space-x-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                <Info size={20} />
                            </div>
                            <div>
                                <h5 className="font-bold text-blue-800 text-sm">Información de Transferencia</h5>
                                <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                                    Esta operación creará un egreso en la cuenta de origen y un ingreso en la cuenta de destino simultáneamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
