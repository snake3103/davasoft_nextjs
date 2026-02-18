"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import {
    Save,
    X,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Building2,
    ChevronDown
} from "lucide-react";
import Link from "next/link";

export default function NuevoCliente() {
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
                            <h1 className="text-2xl font-bold text-slate-800">Crear Nuevo Contacto</h1>
                            <p className="text-sm text-slate-500">Agrega un cliente o proveedor a tu base de datos.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20">
                            <Save size={18} className="mr-2" />
                            Guardar Contacto
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-8 space-y-10">
                        {/* Type Toggle */}
                        <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl w-fit">
                            <button className="px-6 py-2 bg-white text-primary text-sm font-bold rounded-lg shadow-sm border border-slate-100">
                                Cliente
                            </button>
                            <button className="px-6 py-2 text-slate-500 text-sm font-medium rounded-lg hover:text-slate-700 transition-colors">
                                Proveedor
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Información Básica</h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Nombre o Razón Social</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Ej: Juan Perez o Tech S.A.S"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Identificación (NIT / DNI)</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Ej: 123.456.789-0"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                placeholder="ejemplo@correo.com"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Teléfono</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="tel"
                                                placeholder="+57 300 000 000"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Dirección y Otros</h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Dirección</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Calle 123 # 45 - 67"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Ciudad</label>
                                        <input
                                            type="text"
                                            placeholder="Bogotá"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Lista de Precios</label>
                                        <div className="relative">
                                            <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-4 pr-10 text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all">
                                                <option>General</option>
                                                <option>Mayorista</option>
                                                <option>Distribuidor</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Vendedor Asignado</label>
                                    <div className="relative">
                                        <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-4 pr-10 text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all">
                                            <option>Ninguno</option>
                                            <option>Admin Principal</option>
                                            <option>Vendedor 1</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
