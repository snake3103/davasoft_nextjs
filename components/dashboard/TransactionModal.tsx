"use client";

import React from "react";
import {
    X,
    ShoppingCart,
    Receipt,
    Users,
    Package,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft
} from "lucide-react";

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const options = [
    {
        title: "Venta / Factura",
        description: "Crea una nueva factura para tus clientes",
        icon: ShoppingCart,
        color: "text-blue-600",
        bg: "bg-blue-50",
        href: "/ventas/nueva"
    },
    {
        title: "Gasto / Pago",
        description: "Registra un pago o gasto de tu empresa",
        icon: Receipt,
        color: "text-rose-600",
        bg: "bg-rose-50",
        href: "/gastos/nuevo"
    },
    {
        title: "Nuevo Cliente",
        description: "Agrega un contacto a tu lista",
        icon: Users,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        href: "/contactos/nuevo"
    },
    {
        title: "Nuevo Producto",
        description: "Registra un item en tu inventario",
        icon: Package,
        color: "text-amber-600",
        bg: "bg-amber-50",
        href: "/inventario/nuevo"
    },
    {
        title: "Ingreso Manual",
        description: "Registra dinero que entra a caja",
        icon: ArrowUpRight,
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        href: "/ingresos/nuevo"
    },
    {
        title: "Transferencia",
        description: "Mueve dinero entre tus cuentas",
        icon: Wallet,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        href: "/bancos/transferencia"
    }
];

export function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Nueva Transacción</h2>
                        <p className="text-sm text-slate-500">¿Qué te gustaría hacer hoy?</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map((option, idx) => (
                        <a
                            key={idx}
                            href={option.href}
                            className="flex items-center p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                        >
                            <div className={`${option.bg} ${option.color} p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform`}>
                                <option.icon size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors">
                                    {option.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {option.description}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
