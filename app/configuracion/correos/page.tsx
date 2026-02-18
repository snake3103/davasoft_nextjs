"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Mail, ArrowLeft, Send, Save, Bell, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const emailTypes = [
   { id: "sale", name: "Factura de Venta", desc: "Se envía al cliente cuando se emite una factura.", enabled: true },
   { id: "quote", name: "Cotización / Proforma", desc: "Se envía al cliente cuando creas una cotización.", enabled: true },
   { id: "receipt", name: "Recibo de Caja", desc: "Se envía al cliente al registrar u pago.", enabled: false },
   { id: "remittance", name: "Orden de Pago", desc: "Se envía al proveedor al realizar un pago.", enabled: false },
];

export default function CorreosConfigPage() {
   const [senderName, setSenderName] = useState("Notificaciones davaSoft");
   const [replyTo, setReplyTo] = useState("contacto@davasoft.com");

   return (
      <AppLayout>
         <div className="max-w-4xl space-y-10 pb-20">
            <div className="flex items-center space-x-4">
               <Link href="/configuracion" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                  <ArrowLeft size={20} />
               </Link>
               <div>
                  <h1 className="text-2xl font-bold text-slate-800">Correos electrónicos</h1>
                  <p className="text-slate-500 text-sm">Configura cómo se envían las notificaciones a tus clientes.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 font-medium">
               {/* General Settings */}
               <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                     <div className="flex items-center space-x-2 mb-6 text-primary">
                        <Settings size={20} />
                        <h3 className="font-bold text-slate-800">Remitente</h3>
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-sm text-slate-600">Nombre que aparece</label>
                           <input
                              type="text"
                              value={senderName}
                              onChange={(e) => setSenderName(e.target.value)}
                              className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm text-slate-600">Correo para respuestas</label>
                           <input
                              type="email"
                              value={replyTo}
                              onChange={(e) => setReplyTo(e.target.value)}
                              className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col items-center text-center">
                     <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/40">
                        <Send size={32} />
                     </div>
                     <h4 className="font-bold text-lg">¿Servidor propio?</h4>
                     <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Personaliza el servidor SMTP para que los correos salgan desde tu propio dominio corporativo.
                     </p>
                     <button className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/5">
                        Configurar SMTP
                     </button>
                  </div>
               </div>

               {/* Notification Types */}
               <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Tipos de Notificación</h3>
                  <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm divide-y divide-border">
                     {emailTypes.map((type) => (
                        <div key={type.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                           <div className="flex items-center space-x-4">
                              <div className={cn(
                                 "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                                 type.enabled ? "bg-primary text-white" : "bg-slate-50 text-slate-300"
                              )}>
                                 <Bell size={24} />
                              </div>
                              <div>
                                 <p className="font-bold text-slate-800">{type.name}</p>
                                 <p className="text-xs text-slate-500 mt-0.5">{type.desc}</p>
                              </div>
                           </div>
                           <div className="flex items-center space-x-4">
                              <div className={cn(
                                 "w-11 h-6 rounded-full relative cursor-pointer transition-all",
                                 type.enabled ? "bg-primary" : "bg-slate-200"
                              )}>
                                 <div className={cn(
                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                    type.enabled ? "right-1" : "left-1"
                                 )}></div>
                              </div>
                              <ChevronRight size={18} className="text-slate-300" />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </AppLayout>
   );
}
