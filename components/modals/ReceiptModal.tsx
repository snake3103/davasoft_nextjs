"use client";

import { useState, useEffect, useRef } from "react";
import { X, Printer, Download, CheckCircle2, Settings, Loader2, Monitor, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrinter } from "@/hooks/usePrinter";

interface ReceiptModalProps {
   isOpen: boolean;
   onClose: () => void;
   cart: any[];
   total: number;
   orderId: string;
   paymentMethods?: any[];
   companyName?: string;
   companyNit?: string;
   companyAddress?: string;
   autoPrint?: boolean;
   printFormat?: "TICKET" | "HALF_LETTER" | "LETTER";
   taxRate?: number;
   showLogo?: boolean;
}

export function ReceiptModal({ 
   isOpen, 
   onClose, 
   cart, 
   total, 
   orderId, 
   paymentMethods = [],
   companyName = "DAVASOFT S.A.S",
   companyNit = "901.234.567-8",
   companyAddress = "Av. Principal #123, Santo Domingo",
   autoPrint = false,
   printFormat = "TICKET",
   taxRate = 18,
   showLogo = true
}: ReceiptModalProps) {
   const { 
     selectedPrinter, 
     selectPrinter, 
     printers, 
     printDirect, 
     printWithDialog,
     savePdf,
     isPrinting, 
     printError,
     hasPrintedSuccessfully,
     clearError,
     detectPrinters 
   } = usePrinter();
   
   const [showSettings, setShowSettings] = useState(false);
   const [showError, setShowError] = useState(false);
   const [showSuccess, setShowSuccess] = useState(false);
   const printRef = useRef<HTMLDivElement>(null);

    const totalPaid = paymentMethods.reduce((acc, p) => acc + p.amount, 0);
    const change = Math.max(0, totalPaid - total);
    const taxRateDecimal = taxRate / 100;
    const subtotal = total / (1 + taxRateDecimal);
    const itbis = total - subtotal;

    const getPrintWidth = () => {
       switch (printFormat) {
          case "TICKET": return "80mm";
          case "HALF_LETTER": return "148mm";
          case "LETTER": return "216mm";
          default: return "80mm";
       }
    };

   useEffect(() => {
     if (isOpen) {
       detectPrinters();
       setShowError(false);
       setShowSuccess(false);
       clearError();
       
       if (autoPrint) {
         setTimeout(() => {
           handleQuickPrint();
         }, 800);
       }
     }
   }, [isOpen, autoPrint, detectPrinters, clearError]);

   useEffect(() => {
     if (printError) {
       setShowError(true);
       const timer = setTimeout(() => {
         setShowError(false);
         clearError();
       }, 5000);
       return () => clearTimeout(timer);
     }
   }, [printError, clearError]);

   useEffect(() => {
     if (hasPrintedSuccessfully) {
       setShowSuccess(true);
       if (autoPrint) {
         setTimeout(() => {
           onClose();
         }, 2000);
       }
     }
   }, [hasPrintedSuccessfully, autoPrint, onClose]);

   const generateReceiptContent = () => {
      if (!printRef.current) return "";
      return printRef.current.innerHTML;
   };

   const handleQuickPrint = async () => {
      const content = generateReceiptContent();
      const success = await printDirect(content);
      if (!success) {
        setShowError(true);
      }
   };

   const handlePrintWithDialog = async () => {
      const content = generateReceiptContent();
      await printWithDialog(content);
   };

   const handleSavePdf = async () => {
      const content = generateReceiptContent();
      await savePdf(content);
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
         <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">

            <div className="p-6 border-b border-border flex justify-between items-center">
               <div>
                  <h2 className="text-xl font-black text-slate-800">Venta Completada</h2>
                  <p className="text-sm text-slate-500">Orden #{orderId}</p>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={20} />
               </button>
            </div>

            <div className="p-6 bg-emerald-50 flex items-center justify-center py-8 relative">
               {showSuccess ? (
                  <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200 animate-in zoom-in">
                     <Check size={32} />
                  </div>
               ) : (
                  <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                     <CheckCircle2 size={32} />
                  </div>
               )}
            </div>

            {showError && printError && (
               <div className="mx-6 -mt-2 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                     <p className="font-bold text-red-700 text-sm">Error de impresión</p>
                     <p className="text-xs text-red-600">{printError}</p>
                  </div>
               </div>
            )}

            {showSuccess && (
               <div className="mx-6 -mt-2 mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <p className="font-bold text-green-700 text-sm">¡Impresión enviada exitosamente!</p>
               </div>
            )}

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                     <Printer size={20} className="text-slate-400" />
                     <div>
                        <p className="font-bold text-slate-700">{selectedPrinter?.name || "Sin impresora"}</p>
                        <p className="text-xs text-slate-400">
                           {selectedPrinter?.type === "pdf" ? "Guardar como PDF" : "Impresión directa"}
                        </p>
                     </div>
                  </div>
                  <button 
                     onClick={() => setShowSettings(!showSettings)}
                     className="p-2 hover:bg-slate-200 rounded-lg text-slate-400"
                  >
                     <Settings size={18} />
                  </button>
               </div>

               {showSettings && (
                  <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                     <p className="text-xs font-bold text-slate-400 uppercase">Método de impresión</p>
                     
                     <button
                        onClick={() => {
                           const printer = printers.find(p => p.id === "system-default") || printers[0];
                           selectPrinter(printer);
                           setShowSettings(false);
                        }}
                        className={cn(
                           "w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-3",
                           selectedPrinter?.id === "system-default" 
                              ? "bg-primary text-white" 
                              : "bg-white text-slate-600 hover:bg-slate-100"
                        )}
                     >
                        <Monitor size={20} />
                        <div>
                           <p>🖨️ Impresión directa</p>
                           <p className="text-xs opacity-70">Intenta imprimir sin diálogo</p>
                        </div>
                     </button>

                     <button
                        onClick={() => {
                           const printer = printers.find(p => p.id === "pdf") || printers[1];
                           selectPrinter(printer);
                           setShowSettings(false);
                        }}
                        className={cn(
                           "w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-3",
                           selectedPrinter?.id === "pdf" 
                              ? "bg-primary text-white" 
                              : "bg-white text-slate-600 hover:bg-slate-100"
                        )}
                     >
                        <Download size={20} />
                        <div>
                           <p>📄 Guardar como PDF</p>
                        </div>
                     </button>
                  </div>
               )}
            </div>

            {/* Receipt Template - Hidden */}
            <div ref={printRef} className="hidden" style={{ fontFamily: 'Courier New, monospace', fontSize: printFormat === 'TICKET' ? '11px' : '12px', width: getPrintWidth(), padding: '5mm' }}>
               {showLogo && (
                  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                     <div style={{ fontSize: printFormat === 'LETTER' ? '24px' : '16px', fontWeight: 'bold' }}>{companyName}</div>
                     <div style={{ fontSize: '10px' }}>NIT: {companyNit}</div>
                     <div style={{ fontSize: '10px' }}>{companyAddress}</div>
                  </div>
               )}
               
               <div style={{ borderTop: '1px dashed #333', borderBottom: '1px dashed #333', padding: '8px 0', margin: '10px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span>FECHA:</span>
                     <span>{new Date().toLocaleDateString('es-DO')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span>HORA:</span>
                     <span>{new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                     <span>ORDEN:</span>
                     <span>{orderId}</span>
                  </div>
               </div>

               <div style={{ marginBottom: '10px' }}>
                  {cart.map((item, idx) => (
                     <div key={idx} style={{ marginBottom: '4px' }}>
                        <div style={{ fontWeight: 'bold' }}>{item.name.substring(0, 25)}</div>
                        <div style={{ fontSize: '9px', color: '#666' }}>
                           {item.quantity} x ${Number(item.price).toFixed(2)} = ${(item.price * item.quantity).toFixed(2)}
                        </div>
                     </div>
                  ))}
               </div>

               <div style={{ borderTop: '1px dashed #333', paddingTop: '10px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span>SUBTOTAL:</span>
                      <span>${subtotal.toFixed(2)}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span>ITBIS ({taxRate}%):</span>
                      <span>${itbis.toFixed(2)}</span>
                   </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', marginTop: '5px', borderTop: '1px solid #333', paddingTop: '5px' }}>
                     <span>TOTAL:</span>
                     <span>${Number(total).toFixed(2)}</span>
                  </div>
               </div>

               {paymentMethods.length > 0 && (
                  <div style={{ borderTop: '1px dashed #333', paddingTop: '10px', marginTop: '10px' }}>
                     <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '5px' }}>FORMA DE PAGO:</div>
                     {paymentMethods.map((p, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                           <span>{p.type}:</span>
                           <span>${Number(p.amount).toFixed(2)}</span>
                        </div>
                     ))}
                     {change > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', color: '#0066cc', marginTop: '5px' }}>
                           <span>CAMBIO:</span>
                           <span>${Number(change).toFixed(2)}</span>
                        </div>
                     )}
                  </div>
               )}

               <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '10px', borderTop: '1px dashed #333' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold' }}>¡GRACIAS POR SU PREFERENCIA!</div>
                  <div style={{ fontSize: '9px', color: '#666', marginTop: '5px' }}>
                     Este documento no constituye<br/>comprobante fiscal válido
                  </div>
                  <div style={{ fontSize: '8px', color: '#999', marginTop: '10px' }}>
                     Powered by Davasoft ERP
                  </div>
               </div>
            </div>

            <div className="p-6 border-t border-border space-y-3">
               <button
                  onClick={handleQuickPrint}
                  disabled={isPrinting}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
               >
                  {isPrinting ? (
                     <>
                        <Loader2 size={20} className="animate-spin" />
                        Imprimiendo...
                     </>
                  ) : (
                     <>
                        <Printer size={20} />
                        Impresión directa
                     </>
                  )}
               </button>
               
               <div className="grid grid-cols-2 gap-3">
                  <button
                     onClick={handlePrintWithDialog}
                     disabled={isPrinting}
                     className="py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                     <Monitor size={18} />
                     Elegir impresora
                  </button>

                  <button
                     onClick={handleSavePdf}
                     disabled={isPrinting}
                     className="py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                     <Download size={18} />
                     Guardar PDF
                  </button>
               </div>

               <button
                  onClick={onClose}
                  className="w-full py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors"
               >
                  Nueva Venta
               </button>
            </div>
         </div>
      </div>
   );
}
