"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerCompany } from "@/app/actions/auth";
import { Loader2, Store, User, Mail, Lock, Check } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(registerCompany, null);
    const [selectedPlan, setSelectedPlan] = useState("FREE");

    const plans = [
        { id: "FREE", name: "Gratis", price: "$0", desc: "Para iniciar" },
        { id: "PRO", name: "Pro", price: "$29", desc: "El más popular" },
        { id: "ENTERPRISE", name: "Empresarial", price: "$99", desc: "Todo ilimitado" }
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

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-primary/10 flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                        <span className="text-3xl font-black text-primary rotate-6">D</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Comienza a crecer</h2>
                    <p className="mt-3 text-sm text-slate-500 font-medium">Crea tu cuenta de DavaSoft en minutos.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                    <form action={formAction} className="space-y-5">
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

                        {/* Selección de Planes */}
                        <div className="pt-2">
                            <label className="text-sm font-bold text-slate-700 mb-3 block">Elige tu Plan</label>
                            <input type="hidden" name="plan" value={selectedPlan} />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {plans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={`cursor-pointer rounded-xl border p-3 flex flex-col relative transition-all duration-200 ${selectedPlan === plan.id
                                                ? "bg-primary/5 border-primary shadow-sm shadow-primary/10"
                                                : "bg-white border-slate-200 hover:border-slate-300"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`font-bold text-sm ${selectedPlan === plan.id ? "text-primary" : "text-slate-700"}`}>
                                                {plan.name}
                                            </span>
                                            {selectedPlan === plan.id && (
                                                <div className="absolute top-3 right-3 bg-primary rounded-full p-0.5">
                                                    <Check strokeWidth={3} size={12} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-lg font-black text-slate-800 mb-0.5">{plan.price}<span className="text-xs text-slate-400 font-medium ml-0.5">/mes</span></span>
                                        <span className="text-[10px] text-slate-500 font-medium">{plan.desc}</span>
                                    </div>
                                ))}
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
                                    Creando empresa...
                                </>
                            ) : (
                                "Crear Cuenta"
                            )}
                        </button>
                    </form>

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
