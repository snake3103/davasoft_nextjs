"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("registered") === "true") {
            setSuccessMessage("¡Cuenta creada con éxito! Inicia sesión para continuar.");
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Credenciales inválidas. Por favor intente de nuevo.");
            } else {
                router.push("/");
            }
        } catch (err) {
            setError("Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full relative z-10">
            {/* Logo o Icono decorativo opcional */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-primary/10 flex items-center justify-center mx-auto mb-6 transform rotate-3">
                    <span className="text-3xl font-black text-primary -rotate-3">D</span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bienvenido a DavaSoft</h2>
                <p className="mt-2 text-sm text-slate-500 font-medium">Inicia sesión para gestionar tu negocio</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {successMessage && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center mb-4">
                            <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" />
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="bg-rose-50 border border-rose-100/50 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-slate-700 bg-slate-50"
                                placeholder="tucorreo@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-slate-700 bg-slate-50"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all shadow-lg shadow-primary/20 mt-6"
                    >
                        {loading ? "Verificando..." : "Ingresar a mi cuenta"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center">
                    <p className="text-sm font-medium text-slate-500">
                        ¿No tienes una empresa registrada?{" "}
                        <Link href="/registro" className="font-bold text-primary hover:text-primary/80 transition-colors">
                            Comienza gratis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative blobs for consistency with register page */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-3xl" />
            </div>
            <Suspense fallback={<div className="text-slate-500 font-bold z-10 relative">Cargando...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
