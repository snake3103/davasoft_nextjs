import { Search, MapPinOff, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-lg w-full text-center space-y-8">
                <div className="relative inline-block">
                    <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full" />
                    <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-primary mx-auto border border-primary/5">
                        <MapPinOff size={48} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-400">
                        <Search size={20} />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">404</h1>
                    <h2 className="text-2xl font-bold text-slate-800">Página no encontrada</h2>
                    <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Parece que la ruta que buscas no existe o ha sido movida a una nueva ubicación.
                    </p>
                </div>

                <div className="pt-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-3xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 group"
                    >
                        Ir al Dashboard
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-8 border-t border-slate-200/60">
                    <Link href="/ventas" className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors text-left pl-2">Facturación</Link>
                    <Link href="/gastos" className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors text-right pr-2">Gastos</Link>
                    <Link href="/contactos" className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors text-left pl-2">Clientes</Link>
                    <Link href="/configuracion" className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors text-right pr-2">Ajustes</Link>
                </div>
            </div>
        </div>
    );
}
