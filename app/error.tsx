"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Aquí se podría integrar un servicio de logging como Sentry
        console.error("Error capturado:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <AlertCircle size={40} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-slate-800">¡Vaya! Algo salió mal</h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Ha ocurrido un error inesperado en la aplicación. No te preocupes, tus datos están seguros.
                    </p>
                    {error.digest && (
                        <p className="text-[10px] text-slate-300 font-mono mt-2">ID del Error: {error.digest}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <button
                        onClick={() => reset()}
                        className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
                    >
                        <RefreshCcw size={18} />
                        Intentar de nuevo
                    </button>

                    <Link
                        href="/"
                        className="w-full bg-slate-50 text-slate-600 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all border border-slate-100"
                    >
                        <Home size={18} />
                        Volver al inicio
                    </Link>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                    Si el problema persiste, contacta al soporte técnico de Davasoft.
                </p>
            </div>
        </div>
    );
}
