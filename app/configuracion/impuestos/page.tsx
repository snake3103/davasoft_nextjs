"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Plus, ShieldCheck, MoreVertical, Edit, Trash, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const initialTaxes = [
  { id: 1, name: "IVA 19%", type: "Impuesto sobre ventas", value: "19%", status: "Activo" },
  { id: 2, name: "IVA 5%", type: "Impuesto sobre ventas", value: "5%", status: "Activo" },
  { id: 3, name: "Retención 2.5%", type: "Retención en la fuente", value: "2.5%", status: "Activo" },
  { id: 4, name: "ICA 11.04/1000", type: "Impuesto municipal", value: "1.104%", status: "Activo" },
];

export default function ImpuestosConfigPage() {
  const [taxes] = useState(initialTaxes);

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-8">
        <div className="flex items-center space-x-4">
           <Link href="/configuracion" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
              <ArrowLeft size={20} />
           </Link>
           <div>
              <h1 className="text-2xl font-bold text-slate-800">Impuestos</h1>
              <p className="text-slate-500 text-sm">Configura los impuestos y retenciones aplicables a tus facturas.</p>
           </div>
        </div>

        <div className="flex justify-end">
           <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center shadow-lg shadow-primary/25 transition-all">
              <Plus size={18} className="mr-2" /> Nuevo Impuesto
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {taxes.map((tax) => (
             <div key={tax.id} className="bg-white rounded-3xl border border-border p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                   <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                      <ShieldCheck size={24} />
                   </div>
                   <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary"><Edit size={16} /></button>
                      <button className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"><Trash size={16} /></button>
                   </div>
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{tax.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{tax.type}</p>
                
                <div className="mt-8 flex items-baseline justify-between">
                   <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Valor</p>
                      <p className="text-3xl font-black text-slate-900">{tax.value}</p>
                   </div>
                   <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md uppercase tracking-tighter">
                      {tax.status}
                   </span>
                </div>
             </div>
           ))}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 flex items-start space-x-4">
           <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-md shadow-blue-200">
              <ShieldCheck size={24} />
           </div>
           <div>
              <h4 className="font-bold text-blue-900">¿Necesitas ayuda con los impuestos?</h4>
              <p className="text-sm text-blue-700 mt-2 leading-relaxed">
                 Las normativas tributarias pueden variar según tu región. Te recomendamos consultar con un profesional contable para asegurar que tus configuraciones de impuestos cumplan con los requisitos legales vigentes.
              </p>
              <button className="mt-4 text-sm font-bold text-blue-800 hover:underline">Guía de facturación electrónica →</button>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
