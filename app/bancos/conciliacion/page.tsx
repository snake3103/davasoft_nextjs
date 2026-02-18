"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    AlertCircle,
    Search,
    Filter,
    ArrowRightLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Info,
    Plus,
    FileText
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const bankTransactions = [
    { id: 1, date: "15 Oct 2023", description: "Transferencia Recibida - Cliente A", ref: "0982374823", amount: 1200.00, type: "Ingreso", matched: false },
    { id: 2, date: "14 Oct 2023", description: "Pago Servicio Luz", ref: "LUZ-OCT-23", amount: -45.00, type: "Egreso", matched: false },
    { id: 3, date: "14 Oct 2023", description: "Compra Suministros Oficina", ref: "OFFICE-DEPOT", amount: -230.50, type: "Egreso", matched: false },
    { id: 4, date: "12 Oct 2023", description: "Depósito Cheque #442", ref: "-", amount: 500.00, type: "Ingreso", matched: false },
    { id: 5, date: "10 Oct 2023", description: "Cobro Comisión Bancaria", ref: "COM-OCT", amount: -15.00, type: "Egreso", matched: false },
];

const appTransactions = [
    { id: "F-2023-001", date: "15 Oct 2023", description: "Factura de Venta - Cliente A, S.A. de C.V.", amount: 1200.00, type: "Factura", dueDate: "30 Oct 2023" },
    { id: "G-882", date: "14 Oct 2023", description: "Iberdrola (Luz)", amount: 45.00, type: "Gasto" },
    { id: "G-883", date: "14 Oct 2023", description: "Office Depot", amount: 230.50, type: "Gasto" },
    { id: "F-2023-005", date: "12 Oct 2023", description: "Consultoría Global Inc.", amount: 1500.00, type: "Factura", dueDate: "01 Oct 2023" },
];

export default function ConciliacionPage() {
    const [selectedBankTx, setSelectedBankTx] = useState<number | null>(null);
    const [selectedAppTx, setSelectedAppTx] = useState<string | null>(null);

    const bankTx = bankTransactions.find(t => t.id === selectedBankTx);
    const appTx = appTransactions.find(t => t.id === selectedAppTx);

    const canMatch = bankTx && appTx && Math.abs(bankTx.amount) === appTx.amount;

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/bancos" className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 flex items-center">
                                <Building2 className="mr-3 text-primary" size={24} />
                                Banco Santander 1234
                            </h1>
                            <p className="text-sm font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Periodo: Octubre 2023 • Última actualización: Hoy, 10:30 AM</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Saldo en Banco</p>
                            <p className="text-2xl font-black text-slate-800">$45,230.50</p>
                        </div>
                        <button className="px-8 py-3 bg-primary text-white rounded-[1.5rem] text-sm font-black hover:shadow-lg shadow-primary/20 transition-all uppercase tracking-widest">
                            Finalizar Periodo
                        </button>
                    </div>
                </div>

                {/* Smart Suggestion Block */}
                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm shadow-primary/5">
                        <TrendingUp size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-lg font-black text-slate-800">Sugerencia Inteligente</h4>
                        <p className="text-slate-600 font-medium">Hemos encontrado una factura que coincide con el monto seleccionado de <span className="text-primary font-bold">$1,200.00</span>.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Factura Coincidente</p>
                                <p className="text-sm font-bold text-slate-800">F-2023-001 • $1,200.00</p>
                            </div>
                            <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black shadow-md shadow-primary/10 hover:opacity-90 transition-opacity">
                                Conciliar Ahora
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Left: Bank Statement */}
                    <div className="xl:col-span-5 flex flex-col space-y-4">
                        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm h-[600px] flex flex-col">
                            <div className="px-6 py-4 bg-slate-50 border-b border-border flex items-center justify-between font-bold">
                                <h2 className="text-sm text-slate-700 flex items-center">
                                    <Building2 size={16} className="mr-2 text-primary" />
                                    Extracto Bancario
                                </h2>
                                <Search size={16} className="text-slate-400" />
                            </div>
                            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                                {bankTransactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        onClick={() => !tx.matched && setSelectedBankTx(tx.id)}
                                        className={cn(
                                            "px-6 py-5 cursor-pointer transition-all flex items-center group",
                                            tx.matched ? "bg-slate-50/50 opacity-60 grayscale cursor-not-allowed" : "hover:bg-primary/[0.03]",
                                            selectedBankTx === tx.id ? "bg-primary/[0.04] border-l-4 border-primary" : "border-l-4 border-transparent"
                                        )}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.date}</p>
                                                {tx.ref !== "-" && (
                                                    <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded font-black text-slate-500 uppercase">REF: {tx.ref}</span>
                                                )}
                                            </div>
                                            <p className="text-xs font-black text-slate-800 pr-4">{tx.description}</p>
                                        </div>
                                        <div className="text-right flex items-center">
                                            <p className={cn(
                                                "text-sm font-black mr-3",
                                                tx.amount > 0 ? "text-emerald-600" : "text-rose-600"
                                            )}>
                                                {tx.amount > 0 ? "+" : ""}{Number(tx.amount).toFixed(2)}
                                            </p>
                                            {tx.matched ? (
                                                <CheckCircle2 size={16} className="text-emerald-500" />
                                            ) : (
                                                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Middle: Actions */}
                    <div className="xl:col-span-2 flex flex-col justify-center items-center space-y-8">
                        <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm">
                            <ArrowRightLeft size={32} />
                        </div>

                        <div className="w-full space-y-4">
                            {canMatch ? (
                                <button
                                    className="w-full py-5 bg-emerald-500 text-white rounded-[1.5rem] font-black shadow-lg shadow-emerald-200 hover:scale-105 transition-all flex flex-col items-center justify-center uppercase tracking-widest text-[10px]"
                                >
                                    <CheckCircle2 size={24} className="mb-2" />
                                    <span>Confirmar Cruce</span>
                                    <span className="opacity-80 mt-1">${Math.abs(Number(bankTx!.amount)).toFixed(2)}</span>
                                </button>
                            ) : (
                                <div className="text-center p-6 bg-slate-50 rounded-[1.5rem] border border-dashed border-slate-200">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asistente</p>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">Selecciona un movimiento y su contrapartida.</p>
                                </div>
                            )}

                            <button className="w-full py-4 bg-white border border-slate-200 rounded-[1.5rem] text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center uppercase tracking-widest shadow-sm">
                                <Plus size={14} className="mr-2" /> Crear Ajuste
                            </button>
                        </div>
                    </div>

                    {/* Right: App Records */}
                    <div className="xl:col-span-5 flex flex-col space-y-4">
                        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm h-[600px] flex flex-col">
                            <div className="px-6 py-5 bg-slate-50 border-b border-border flex items-center justify-between font-bold">
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                                    <FileText size={16} className="mr-2 text-primary" />
                                    Registros en ERP
                                </h2>
                                <Filter size={16} className="text-slate-400" />
                            </div>
                            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                                {appTransactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        onClick={() => setSelectedAppTx(tx.id)}
                                        className={cn(
                                            "px-6 py-5 cursor-pointer transition-all flex items-center group",
                                            "hover:bg-primary/[0.03]",
                                            selectedAppTx === tx.id ? "bg-primary/[0.04] border-r-4 border-primary" : "border-r-4 border-transparent"
                                        )}
                                    >
                                        <div className="text-left flex items-center">
                                            <ChevronRight size={16} className="text-slate-300 rotate-180 group-hover:text-primary mr-3 transition-transform group-hover:-translate-x-0.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.date} • {tx.id}</p>
                                                {tx.dueDate && (
                                                    <span className="text-[8px] bg-rose-50 px-1.5 py-0.5 rounded font-black text-rose-600 uppercase">Vence: {tx.dueDate}</span>
                                                )}
                                            </div>
                                            <p className="text-xs font-black text-slate-800 pr-4">{tx.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-800">${Number(tx.amount).toFixed(2)}</p>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-tighter">{tx.type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Footer */}
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col lg:flex-row justify-between items-center gap-12 font-medium shadow-2xl shadow-slate-200">
                    <div className="flex items-center space-x-16">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Saldo en Banco</p>
                            <p className="text-4xl font-black tracking-tighter">$45,230.50</p>
                        </div>
                        <div className="h-16 w-px bg-slate-800 hidden lg:block"></div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Saldo en Libros</p>
                            <p className="text-4xl font-black tracking-tighter">$43,850.20</p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-md w-full bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700/50">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2rem]">Diferencia</span>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                                <span className="text-lg font-black text-amber-400">$1,380.30</span>
                            </div>
                        </div>
                        <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-200 w-[15%] rounded-full"></div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-4 italic flex items-center justify-center md:justify-start">
                            <Info size={14} className="mr-2 text-amber-400/50" />
                            La diferencia corresponde a 12 movimientos aún no registrados.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
