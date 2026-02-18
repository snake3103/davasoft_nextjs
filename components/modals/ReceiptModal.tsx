"use client";

import { X, Printer, Download, Share2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReceiptModalProps {
   isOpen: boolean;
   onClose: () => void;
   cart: any[];
   total: number;
   orderId: string;
   paymentMethods?: any[];
}

export function ReceiptModal({ isOpen, onClose, cart, total, orderId, paymentMethods = [] }: ReceiptModalProps) {
   if (!isOpen) return null;

   const totalPaid = paymentMethods.reduce((acc, p) => acc + p.amount, 0);
   const change = Math.max(0, totalPaid - total);

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300 print:bg-white print:p-0">
         <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 print:shadow-none print:max-w-none print:rounded-none">

            {/* Success Header - Hidden during print */}
            <div className="p-8 text-center bg-emerald-50 relative overflow-hidden print:hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -mr-16 -mt-16"></div>
               <div className="h-20 w-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-200 relative z-10 animate-in bounce-in duration-500">
                  <CheckCircle2 size={40} />
               </div>
               <h2 className="text-2xl font-black text-slate-800 mt-6 relative z-10">¡Venta Exitosa!</h2>
               <p className="text-slate-500 text-sm mt-1 relative z-10">Orden #{orderId}</p>
            </div>

            <div className="p-8 space-y-6 print:p-0">
               {/* Ticket Design */}
               <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 font-mono text-xs text-slate-600 print:bg-white print:border-none print:p-4">
                  <div className="text-center border-b border-slate-200 pb-4 mb-4">
                     <p className="font-bold text-slate-800 text-sm uppercase">Mi Empresa S.A.S</p>
                     <p>NIT: 900.123.456-7</p>
                     <p>Calle 123 #45-67, Bogotá</p>
                     <p className="mt-2 text-[10px] text-slate-400">Orden: #{orderId}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                     {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                           <span>{item.quantity}x {item.name.substring(0, 20)}...</span>
                           <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                     ))}
                  </div>

                  <div className="border-t border-slate-200 pt-4 space-y-1">
                     <div className="flex justify-between text-slate-400">
                        <span>Subtotal:</span>
                        <span>${(total * 0.81).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-slate-400">
                        <span>IVA (19%):</span>
                        <span>${(total * 0.19).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-slate-800 font-bold text-sm mt-2 border-b border-slate-200 pb-2">
                        <span>TOTAL:</span>
                        <span>${Number(total).toFixed(2)}</span>
                     </div>

                     {paymentMethods.length > 0 && (
                        <div className="pt-2 space-y-1">
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-1">Pagado con:</p>
                           {paymentMethods.map((p, idx) => (
                              <div key={idx} className="flex justify-between items-center italic">
                                 <span>{p.type}:</span>
                                 <span>${Number(p.amount).toFixed(2)}</span>
                              </div>
                           ))}
                           {change > 0 && (
                              <div className="flex justify-between items-center font-bold text-slate-900 border-t border-slate-200 mt-2 pt-1">
                                 <span>CAMBIO:</span>
                                 <span>${Number(change).toFixed(2)}</span>
                              </div>
                           )}
                        </div>
                     )}
                  </div>

                  <div className="mt-8 text-center text-[10px] text-slate-400">
                     <p>Gracias por su compra</p>
                     <p>www.miempresa.com</p>
                     <p className="mt-1">{new Date().toLocaleString()}</p>
                  </div>
               </div>

               {/* Buttons - Hidden during print */}
               <div className="grid grid-cols-2 gap-4 print:hidden">
                  <button
                     onClick={() => window.print()}
                     className="py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition-all flex items-center justify-center"
                  >
                     <Printer size={18} className="mr-2" /> Imprimir
                  </button>
                  <button
                     className="py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition-all flex items-center justify-center"
                  >
                     <Download size={18} className="mr-2" /> PDF
                  </button>
               </div>

               <button
                  onClick={onClose}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl transition-all hover:opacity-90 active:scale-[0.98] print:hidden"
               >
                  Nueva Venta
               </button>
            </div>
         </div>
      </div>
   );
}
