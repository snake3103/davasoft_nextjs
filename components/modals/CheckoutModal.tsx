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
    Wallet
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

const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

export function CheckoutModal({ isOpen, onClose, onComplete, total }: CheckoutModalProps) {
    const [payments, setPayments] = useState<PaymentMethod[]>([]);
    const [activeType, setActiveType] = useState<"Efectivo" | "Tarjeta" | "Transferencia">("Efectivo");
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isMixtoMode, setIsMixtoMode] = useState(false);

    const paidAmount = useMemo(() => {
        return payments.reduce((acc, p) => acc + p.amount, 0);
    }, [payments]);

    const remaining = Math.max(0, total - paidAmount);
    const change = Math.max(0, paidAmount - total);

    useEffect(() => {
        if (isOpen) {
            setPayments([]);
            setInputValue("");
            setError(null);
            setIsMixtoMode(false);
            setActiveType("Efectivo");
        }
    }, [isOpen]);

    const addPayment = () => {
        const amount = parseFloat(inputValue);
        if (isNaN(amount) || amount <= 0) {
            setError("Ingresa un monto válido");
            return;
        }
        
        if ((activeType === "Tarjeta" || activeType === "Transferencia") && amount > remaining) {
            setError(`El monto con ${activeType} no puede exceder el restante ($${remaining.toFixed(2)})`);
            return;
        }
        
        setError(null);
        setPayments([...payments, { type: activeType, amount }]);
        setInputValue("");
    };

    const togglePaymentMethod = (type: "Efectivo" | "Tarjeta" | "Transferencia") => {
        setActiveType(type);
        setInputValue("");
        setError(null);
        
        if (type === "Efectivo") {
            setInputValue(remaining.toFixed(2));
        } else {
            setInputValue(remaining.toFixed(2));
        }
    };

    const addQuickAmount = (amount: number) => {
        if ((activeType === "Tarjeta" || activeType === "Transferencia") && amount > remaining) {
            setError(`El monto con ${activeType} no puede exceder el restante ($${remaining.toFixed(2)})`);
            return;
        }
        setError(null);
        setPayments([...payments, { type: activeType, amount }]);
    };

    const addPaymentMethod = (type: "Efectivo" | "Tarjeta" | "Transferencia") => {
        if (remaining <= 0) return;
        setPayments([...payments, { type, amount: remaining }]);
    };

    const removePayment = (index: number) => {
        const newPayments = [...payments];
        newPayments.splice(index, 1);
        setPayments(newPayments);
    };

    const handleComplete = () => {
        if (paidAmount >= total) {
            onComplete(payments);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">

                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-2xl font-black text-slate-800">Cobrar</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total a cobrar</p>
                    <p className="text-5xl font-black text-white tracking-tight">${Number(total).toFixed(2)}</p>
                    {paidAmount > 0 && (
                        <div className="mt-3 flex justify-center gap-4 text-sm">
                            <span className="text-emerald-400">Pagado: ${paidAmount.toFixed(2)}</span>
                            {remaining > 0 && <span className="text-rose-400">Restante: ${remaining.toFixed(2)}</span>}
                        </div>
                    )}
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {isMixtoMode ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Pago mixto</p>
                                <button 
                                    onClick={() => { setIsMixtoMode(false); setPayments([]); }}
                                    className="text-xs text-primary hover:underline font-medium"
                                >
                                    Cancelar
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {(["Efectivo", "Tarjeta", "Transferencia"] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setActiveType(type)}
                                        className={cn(
                                            "py-3 rounded-xl font-bold text-sm transition-all flex flex-col items-center gap-1",
                                            activeType === type
                                                ? "bg-slate-800 text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        )}
                                    >
                                        {type === "Efectivo" && <Banknote size={20} />}
                                        {type === "Tarjeta" && <CreditCard size={20} />}
                                        {type === "Transferencia" && <ArrowRightLeft size={20} />}
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-3">Montos rápidos</p>
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {quickAmounts.map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => addQuickAmount(amount)}
                                            className="py-2 bg-white border border-slate-200 hover:border-primary hover:text-primary rounded-xl font-bold text-sm transition-all"
                                        >
                                            ${amount}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-black text-slate-300">$</span>
                                        <input
                                            type="number"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={(e) => e.key === "Enter" && addPayment()}
                                            className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-lg font-bold outline-none focus:border-primary"
                                            placeholder="Otro monto"
                                        />
                                    </div>
                                    <button
                                        onClick={addPayment}
                                        disabled={!inputValue || parseFloat(inputValue) <= 0}
                                        className={cn(
                                            "px-4 py-2 bg-slate-800 text-white rounded-xl font-bold transition-all",
                                            !inputValue && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                {error && <p className="text-rose-500 text-xs font-bold mt-2">{error}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-slate-500 text-center mb-2">Selecciona un método de pago</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => addPaymentMethod("Efectivo")}
                                    disabled={remaining <= 0}
                                    className={cn(
                                        "py-5 rounded-2xl font-bold text-lg transition-all flex flex-col items-center gap-2",
                                        remaining > 0 
                                            ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25" 
                                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    )}
                                >
                                    <Banknote size={32} />
                                    <span>Efectivo</span>
                                    <span className="text-xs font-normal opacity-80">Sin límites</span>
                                </button>

                                <button
                                    onClick={() => addPaymentMethod("Tarjeta")}
                                    disabled={remaining <= 0}
                                    className={cn(
                                        "py-5 rounded-2xl font-bold text-lg transition-all flex flex-col items-center gap-2",
                                        remaining > 0 
                                            ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25" 
                                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    )}
                                >
                                    <CreditCard size={32} />
                                    <span>Tarjeta</span>
                                </button>

                                <button
                                    onClick={() => addPaymentMethod("Transferencia")}
                                    disabled={remaining <= 0}
                                    className={cn(
                                        "py-5 rounded-2xl font-bold text-lg transition-all flex flex-col items-center gap-2",
                                        remaining > 0 
                                            ? "bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/25" 
                                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    )}
                                >
                                    <ArrowRightLeft size={32} />
                                    <span>Transferencia</span>
                                </button>

                                <button
                                    onClick={() => setIsMixtoMode(true)}
                                    disabled={remaining <= 0}
                                    className={cn(
                                        "py-5 rounded-2xl font-bold text-lg transition-all flex flex-col items-center gap-2",
                                        remaining > 0 
                                            ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/25" 
                                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    )}
                                >
                                    <Wallet size={32} />
                                    <span>Pago Mixto</span>
                                    <span className="text-xs font-normal opacity-80">Varios métodos</span>
                                </button>
                            </div>

                            {remaining > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">O agrega un monto personalizado</p>
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {quickAmounts.map((amount) => (
                                            <button
                                                key={amount}
                                                onClick={() => {
                                                    setPayments([{ type: "Efectivo", amount }]);
                                                }}
                                                className="py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-sm transition-all"
                                            >
                                                ${amount}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {payments.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-200">
                            <p className="text-sm font-bold text-slate-600 mb-3">Pagos agregados</p>
                            <div className="space-y-2 mb-4">
                                {payments.map((p, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-xl flex items-center justify-between border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            {p.type === "Efectivo" && <Banknote size={18} className="text-emerald-600" />}
                                            {p.type === "Tarjeta" && <CreditCard size={18} className="text-blue-600" />}
                                            {p.type === "Transferencia" && <ArrowRightLeft size={18} className="text-purple-600" />}
                                            <span className="font-semibold">{p.type}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold">${p.amount.toFixed(2)}</span>
                                            <button onClick={() => removePayment(idx)} className="p-1 text-slate-300 hover:text-rose-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {paidAmount > 0 && (
                    <div className="px-6 pb-4">
                        {remaining > 0 ? (
                            <div className="flex justify-between items-center py-3 px-4 bg-rose-50 rounded-xl border border-rose-200 mb-4">
                                <span className="font-bold text-rose-700">Falta por pagar</span>
                                <span className="text-xl font-black text-rose-700">${remaining.toFixed(2)}</span>
                            </div>
                        ) : change > 0 ? (
                            <div className="flex justify-between items-center py-3 px-4 bg-amber-50 rounded-xl border border-amber-200 mb-4">
                                <span className="font-bold text-amber-700">Cambio a devolver</span>
                                <span className="text-xl font-black text-amber-700">${change.toFixed(2)}</span>
                            </div>
                        ) : null}
                    </div>
                )}

                <div className="p-6 border-t border-border">
                    <button
                        disabled={paidAmount < total}
                        onClick={handleComplete}
                        className={cn(
                            "w-full py-5 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-2 shadow-xl",
                            paidAmount >= total
                                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/25"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        <CheckCircle2 size={24} />
                        Completar Venta
                    </button>
                </div>
            </div>
        </div>
    );
}
