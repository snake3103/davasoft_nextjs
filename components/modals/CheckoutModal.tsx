"use client";

import { useState, useMemo, useEffect } from "react";
import {
    X,
    CreditCard,
    Banknote,
    ArrowRightLeft,
    Trash2,
    Plus,
    CheckCircle2,
    Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethod {
    type: "Efectivo" | "Tarjeta" | "Transferencia";
    amount: number;
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (payments: PaymentMethod[]) => void;
    total: number;
}

export function CheckoutModal({ isOpen, onClose, onComplete, total }: CheckoutModalProps) {
    const [payments, setPayments] = useState<PaymentMethod[]>([]);
    const [activeTab, setActiveTab] = useState<PaymentMethod["type"]>("Efectivo");
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    const paidAmount = useMemo(() => {
        return payments.reduce((acc, p) => acc + p.amount, 0);
    }, [payments]);

    const remaining = Math.max(0, total - paidAmount);
    const change = Math.max(0, paidAmount - total);

    useEffect(() => {
        if (isOpen) {
            setPayments([]);
            setInputValue(remaining.toString());
            setError(null);
        }
    }, [isOpen]);

    const addPayment = () => {
        const amount = parseFloat(inputValue);
        if (isNaN(amount) || amount <= 0) return;
        setError(null);

        // Validation 1: Card / Transfer must NOT exceed remaining (always exact or partial)
        if ((activeTab === "Tarjeta" || activeTab === "Transferencia") && amount > remaining) {
            setError(`El pago con ${activeTab.toLowerCase()} debe ser exacto (máx. $${Number(remaining).toFixed(2)})`);
            return;
        }

        // Case: Cash can exceed remaining (generates change)
        setPayments([...payments, { type: activeTab, amount }]);

        const newRemaining = Math.max(0, total - (paidAmount + amount));
        setInputValue(newRemaining.toString() === "0" ? "" : newRemaining.toString());
    };

    const removePayment = (index: number) => {
        const newPayments = [...payments];
        newPayments.splice(index, 1);
        setPayments(newPayments);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-[600px]">

                {/* Left Section: Input */}
                <div className="flex-1 p-8 flex flex-col border-b md:border-b-0 md:border-r border-border">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Caja</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8 text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total a cobrar</p>
                            <p className="text-4xl font-black text-slate-900">${Number(total).toFixed(2)}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl mb-6 font-bold">
                            {(["Efectivo", "Tarjeta", "Transferencia"] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveTab(type)}
                                    className={cn(
                                        "py-3 text-xs rounded-xl flex flex-col items-center justify-center space-y-1 transition-all",
                                        activeTab === type
                                            ? "bg-white text-primary shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {type === "Efectivo" && <Banknote size={20} />}
                                    {type === "Tarjeta" && <CreditCard size={20} />}
                                    {type === "Transferencia" && <ArrowRightLeft size={20} />}
                                    <span>{type}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Monto {activeTab}</label>
                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 group-focus-within:text-primary transition-colors">$</span>
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && addPayment()}
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-[1.5rem] pl-12 pr-6 py-5 text-3xl font-black outline-none transition-all placeholder:text-slate-200"
                                    placeholder="0.00"
                                />
                            </div>
                            {error && (
                                <p className="text-rose-500 text-xs font-bold pl-2 animate-in slide-in-from-top-1 duration-200">
                                    {error}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={addPayment}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                        >
                            <Plus size={24} />
                            <span>Agregar Pago</span>
                        </button>
                    </div>
                </div>

                {/* Right Section: Summary */}
                <div className="w-full md:w-[300px] bg-slate-50 p-8 flex flex-col font-medium">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Resumen de Pagos</h3>

                    <div className="flex-1 space-y-3 overflow-y-auto">
                        {payments.map((p, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center justify-between group">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">{p.type}</p>
                                    <p className="font-bold text-slate-800">${Number(p.amount).toFixed(2)}</p>
                                </div>
                                <button
                                    onClick={() => removePayment(idx)}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {payments.length === 0 && (
                            <div className="h-40 flex flex-col items-center justify-center text-slate-300">
                                <Calculator size={40} className="mb-2 opacity-50" />
                                <p className="text-xs font-bold uppercase tracking-tighter">Sin pagos</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 space-y-4 pt-6 border-t border-slate-200">
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-slate-400">Restante</span>
                            <span className={cn(remaining > 0 ? "text-rose-500" : "text-emerald-500")}>
                                ${Number(remaining).toFixed(2)}
                            </span>
                        </div>
                        {change > 0 && (
                            <div className="flex justify-between items-center text-sm font-bold bg-amber-50 p-3 rounded-xl border border-amber-100">
                                <span className="text-amber-700">Cambio</span>
                                <span className="text-amber-700 text-lg">${Number(change).toFixed(2)}</span>
                            </div>
                        )}

                        <button
                            disabled={paidAmount < total}
                            onClick={() => onComplete(payments)}
                            className={cn(
                                "w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-2 shadow-xl",
                                paidAmount >= total
                                    ? "bg-primary text-white shadow-primary/25 hover:opacity-90 active:scale-95"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                            )}
                        >
                            <CheckCircle2 size={24} />
                            <span>Finalizar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
