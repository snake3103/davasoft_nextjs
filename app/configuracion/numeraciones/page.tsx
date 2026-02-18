"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FileText, ArrowLeft, Plus, MoreVertical, Edit, Trash, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const initialResolutions = [
  { id: 1, name: "Facturación Electrónica", prefix: "FE", nextNumber: "1250", status: "Activa", endRange: "5000" },
  { id: 2, name: "Factura de Venta POS", prefix: "POS", nextNumber: "840", status: "Activa", endRange: "2000" },
  { id: 3, name: "Nota Crédito", prefix: "NC", nextNumber: "42", status: "Activa", endRange: "1000" },
];

export default function NumeracionesConfigPage() {
  const [resolutions] = useState(initialResolutions);

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-8 pb-20">
        <div className="flex items-center space-x-4">
           <Link href="/configuracion" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
              <ArrowLeft size={20} />
           </Link>
           <div>
              <h1 className="text-2xl font-bold text-slate-800">Numeraciones</h1>
              <p className="text-slate-500 text-sm">Gestiona tus resoluciones de facturación y prefijos.</p>
           </div>
        </div>

        <div className="flex justify-end">
           <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center shadow-lg shadow-primary/25">
              <Plus size={18} className="mr-2" /> Nueva Numeración
           </button>
        </div>

        <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-sm">
           <table className="w-full text-left font-medium">
              <thead>
                 <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-border">
                    <th className="px-8 py-4">Nombre / Tipo</th>
                    <th className="px-8 py-4">Prefijo</th>
                    <th className="px-8 py-4">Siguiente Número</th>
                    <th className="px-8 py-4">Rango Final</th>
                    <th className="px-8 py-4">Estado</th>
                    <th className="px-8 py-4 text-right">Acciones</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-border">
                 {resolutions.map((res) => (
                   <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-5">
                         <div>
                            <p className="font-bold text-slate-800">{res.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mt-0.5">Electrónica</p>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-600 font-bold">{res.prefix}</td>
                      <td className="px-8 py-5 text-sm text-slate-800 font-black">{res.nextNumber}</td>
                      <td className="px-8 py-5 text-sm text-slate-500">{res.endRange}</td>
                      <td className="px-8 py-5">
                         <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md uppercase tracking-tighter">
                            {res.status}
                         </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"><Edit size={16} /></button>
                            <button className="p-2 hover:bg-rose-100 rounded-lg text-rose-500 transition-colors"><Trash size={16} /></button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 flex items-start space-x-4">
           <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm border border-amber-100">
              <CheckCircle2 size={24} />
           </div>
           <div>
              <h4 className="font-bold text-amber-900">Importante sobre la DIAN</h4>
              <p className="text-sm text-amber-800 mt-2 leading-relaxed">
                 Asegúrate de que los rangos y prefijos coincidan exactamente con tu resolución vigente emitida por la DIAN para evitar rechazos en tus documentos electrónicos.
              </p>
              <button className="mt-4 text-sm font-bold text-amber-800 hover:underline">Sincronizar resoluciones →</button>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
