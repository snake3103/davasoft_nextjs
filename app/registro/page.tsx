"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerCompany } from "@/app/actions/auth";
import { Loader2, Store, User, Mail, Lock, Check, ArrowLeft, Building2, Zap, ShieldCheck, ChevronRight } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(registerCompany, null);

    // UI States
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedPlan, setSelectedPlan] = useState<string>("PRO");

    const plans = [
        {
            id: "FREE",
            name: "Básico",
            price: "$0",
            desc: "Para empezar tu camino",
            icon: Building2,
            features: ["1 Usuario", "50 Facturas/mes", "Soporte comunitario"]
        },
        {
            id: "PRO",
            name: "Profesional",
            price: "$29",
            desc: "El ideal para Pymes",
            icon: Zap,
            popular: true,
            features: ["3 Usuarios", "Facturas Ilimitadas", "Soporte Prioritario", "Inventario Avanzado"]
        },
        {
            id: "ENTERPRISE",
            name: "Empresarial",
            price: "$99",
            desc: "Sin límites ni fronteras",
            icon: ShieldCheck,
            features: ["Usuarios Ilimitados", "Múltiples sucursales", "Asesor Asignado", "API Access"]
        }
    ];

    useEffect(() => {
        if (state?.success) {
            router.push("/login?registered=true");
        }
    }, [state, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-3xl" />
            </div>

            <div className={`w-full relative z-10 transition-all duration-500 ${step === 1 ? 'max-w-5xl' : 'max-w-md'}`}>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-primary/10 flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                        <span className="text-3xl font-black text-primary rotate-6">D</span>
                    </div>
                    {step === 1 ? (
                        <>
                            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Elige tu Plan Ideal</h2>
                            <p className="mt-3 text-lg text-slate-500 font-medium max-w-xl mx-auto">Selecciona la herramienta que mejor se adapte al tamaño y ambición de tu negocio hoy.</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Detalles de tu Empresa</h2>
                            <p className="mt-3 text-sm text-slate-500 font-medium">Estás a un paso de comenzar con el plan <span className="font-bold text-primary">{plans.find(p => p.id === selectedPlan)?.name}</span>.</p>
                        </>
                    )}
                </div>

                <div className={`bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 transition-all ${step === 1 ? 'p-6 lg:p-10' : 'p-8'}`}>

                    {/* PASO 1: SELECCIÓN DE PLANES GRANDES */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {plans.map((plan) => {
                                    const Icon = plan.icon;
                                    const isSelected = selectedPlan === plan.id;

                                    return (
                                        <div
                                            key={plan.id}
                                            onClick={() => setSelectedPlan(plan.id)}
                                            className={`relative cursor-pointer rounded-2xl border-2 p-6 flex flex-col transition-all duration-300 transform ${isSelected
                                                ? "bg-primary/5 border-primary shadow-lg shadow-primary/20 scale-105 z-10"
                                                : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md"
                                                }`}
                                        >
                                            {plan.popular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                                                    Más Popular
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-2 rounded-xl border ${isSelected ? 'bg-primary border-primary text-white' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                                    <Icon size={24} />
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-primary bg-primary" : "border-slate-300"
                                                    }`}>
                                                    {isSelected && <Check size={14} className="text-white" />}
                                                </div>
                                            </div>

                                            <h3 className={`text-xl font-bold mb-1 ${isSelected ? 'text-primary' : 'text-slate-800'}`}>{plan.name}</h3>
                                            <p className="text-sm text-slate-500 font-medium mb-4 h-10">{plan.desc}</p>

                                            <div className="mb-6">
                                                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                                                <span className="text-slate-500 font-medium">/mes</span>
                                            </div>

                                            <ul className="space-y-3 flex-1 mb-4">
                                                {plan.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start text-sm font-medium text-slate-600">
                                                        <Check size={16} className={`mr-2 shrink-0 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all flex items-center"
                                >
                                    Continuar con {plans.find(p => p.id === selectedPlan)?.name}
                                    <ChevronRight className="ml-2" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PASO 2: FORMULARIO DE REGISTRO */}
                    {step === 2 && (
                        <form action={formAction} className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer"
                                >
                                    <ArrowLeft size={16} className="mr-1" /> Atrás
                                </button>

                                <div className="flex items-center px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                                    <span className="text-xs font-bold text-primary mr-2 uppercase tracking-wide">Plan:</span>
                                    <span className="text-sm font-black text-slate-800">{plans.find(p => p.id === selectedPlan)?.name}</span>
                                </div>
                            </div>

                            <input type="hidden" name="plan" value={selectedPlan} />
                            {state?.error && (
                                <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold border border-rose-100/50 flex items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2" />
                                    {state.error}
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Field: Empresa */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Nombre de tu Empresa / Negocio</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Store className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            name="companyName"
                                            type="text"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                            placeholder="Ej. Mi Tienda Increíble S.A.S"
                                        />
                                    </div>
                                </div>

                                {/* Field: Nombre persona */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Tu Nombre Comercial</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                            placeholder="Ej. Juan Pérez"
                                        />
                                    </div>
                                </div>

                                {/* Field: Email */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Correo Electrónico (Login)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                            placeholder="tucorreo@empresa.com"
                                        />
                                    </div>
                                </div>

                                {/* Field: Password */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Contraseña</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            minLength={6}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <p className="mt-1.5 text-xs text-slate-400">Mínimo 6 caracteres.</p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Finalizando registro...
                                    </>
                                ) : (
                                    "Crear Cuenta Empresarial"
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center">
                        <p className="text-sm font-medium text-slate-500">
                            ¿Ya tienes una cuenta?{" "}
                            <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
                                Inicia sesión aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
