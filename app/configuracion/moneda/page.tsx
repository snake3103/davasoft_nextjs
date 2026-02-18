"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Globe, ArrowLeft, Save, Info } from "lucide-react";
import Link from "next/link";

export default function MonedaConfigPage() {
  const [currency, setCurrency] = useState("COP");
  const [symbol, setSymbol] = useState("$");
  const [decimalSeparator, setDecimalSeparator] = useState(",");
  const [thousandSeparator, setThousandSeparator] = useState(".");

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-8 pb-20">
        <div className="flex items-center space-x-4">
           <Link href="/configuracion" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
              <ArrowLeft size={20} />
           </Link>
           <div>
              <h1 className="text-2xl font-bold text-slate-800">Moneda</h1>
              <p className="text-slate-500 text-sm">Configura la moneda principal y el formato de visualización.</p>
           </div>
        </div>

        <div className="bg-white rounded-3xl border border-border p-8 shadow-sm space-y-8 font-medium">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <label className="text-sm text-slate-600">Moneda Principal</label>
                 <select 
                   value={currency}
                   onChange={(e) => setCurrency(e.target.value)}
                   className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                 >
                    <option value="COP">Peso Colombiano (COP)</option>
                    <option value="USD">Dólar Estadounidense (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="MXN">Peso Mexicano (MXN)</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-sm text-slate-600">Símbolo</label>
                 <input 
                   type="text" 
                   value={symbol}
                   onChange={(e) => setSymbol(e.target.value)}
                   className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                 />
              </div>
           </div>

           <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Formato de Números</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-sm text-slate-600">Separador de Miles</label>
                    <select 
                      value={thousandSeparator}
                      onChange={(e) => setThousandSeparator(e.target.value)}
                      className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                    >
                       <option value=".">Punto (.)</option>
                       <option value=",">Coma (,)</option>
                       <option value=" ">Espacio ( )</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm text-slate-600">Separador de Decimales</label>
                    <select 
                      value={decimalSeparator}
                      onChange={(e) => setDecimalSeparator(e.target.value)}
                      className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                    >
                       <option value=",">Coma (,)</option>
                       <option value=".">Punto (.)</option>
                    </select>
                 </div>
              </div>
           </div>

           <div className="bg-slate-50 p-6 rounded-2xl flex items-start space-x-4 border border-slate-200">
              <div className="p-2 bg-white rounded-lg text-primary shadow-sm">
                 <Info size={20} />
              </div>
              <div>
                 <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-bold">Vista previa:</span> Los montos se visualizarán como <span className="text-slate-900 font-bold">{symbol} 1{thousandSeparator}234{decimalSeparator}56</span>. Este cambio afectará a todos los documentos y reportes de la cuenta.
                 </p>
              </div>
           </div>

           <div className="pt-4 flex justify-end">
              <button 
                onClick={() => alert("Configuración de moneda guardada")}
                className="px-10 py-3 bg-primary text-white rounded-2xl font-bold flex items-center shadow-lg shadow-primary/25 hover:opacity-90 transition-all border border-transparent"
              >
                 <Save size={18} className="mr-2" /> Guardar Cambios
              </button>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
