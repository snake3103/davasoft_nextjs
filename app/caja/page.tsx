"use client";

import { useState, useEffect } from "react";
import { 
   Search, 
   Receipt, 
   DollarSign, 
   CheckCircle, 
   XCircle,
   Clock,
   User,
   ChevronRight,
   Loader2,
   Filter,
   Calendar,
   Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckoutModal } from "@/components/modals/CheckoutModal";
import { CashDrawerShiftWidget } from "@/components/cash-register/CashDrawerShiftWidget";
import { useRouter } from "next/navigation";
import { useRealtimeTransactions } from "@/hooks/useRealtimeTransactions";
import { AppLayout } from "@/components/layout/AppLayout";

interface PendingInvoice {
   id: string;
   number: string;
   date: string;
   clientId: string;
   clientName: string;
   clientIdNumber?: string;
   total: number;
   subtotal: number;
   tax: number;
   status: string;
   items: any[];
}

export default function CajaPage() {
   const router = useRouter();
   const [invoices, setInvoices] = useState<PendingInvoice[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedInvoice, setSelectedInvoice] = useState<PendingInvoice | null>(null);
   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
   const [filterStatus, setFilterStatus] = useState<"SENT" | "PARTIAL" | "all">("SENT");
   
   // Realtime updates from POS
   const { newTransaction, clearNewTransaction } = useRealtimeTransactions({
      interval: 5000,
      enabled: !isLoading,
   });

   // Refresh when new transaction detected
   useEffect(() => {
      if (newTransaction) {
         fetchPendingInvoices();
         clearNewTransaction();
      }
   }, [newTransaction]);

   useEffect(() => {
      fetchPendingInvoices();
   }, []);

   const fetchPendingInvoices = async () => {
      try {
         const res = await fetch("/api/pos/pending-invoices");
         if (res.ok) {
            const data = await res.json();
            setInvoices(data);
         }
      } catch (err) {
         console.error("Error fetching invoices:", err);
      } finally {
         setIsLoading(false);
      }
   };

   const filteredInvoices = invoices.filter(inv => {
      const matchesSearch = searchQuery === "" || 
         inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
         inv.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || inv.status === filterStatus;
      return matchesSearch && matchesStatus;
   });

   const totalPending = filteredInvoices.reduce((acc, inv) => acc + Number(inv.total), 0);
   const totalCount = filteredInvoices.length;

   const handleCollectPayment = (invoice: PendingInvoice) => {
      setSelectedInvoice(invoice);
      setIsCheckoutOpen(true);
   };

   const handlePaymentComplete = async (payments: any[]) => {
      if (!selectedInvoice) return;

      try {
         const paymentsFormatted = payments.map((p) => ({
            amount: p.amount,
            method: p.type === "Efectivo" ? "CASH" : p.type === "Tarjeta" ? "CREDIT_CARD" : "BANK_TRANSFER",
         }));

         const res = await fetch(`/api/invoices/${selectedInvoice.id}/payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payments: paymentsFormatted }),
         });

         if (res.ok) {
            // Refresh the list
            fetchPendingInvoices();
            setIsCheckoutOpen(false);
            setSelectedInvoice(null);
         }
      } catch (err) {
         console.error("Error processing payment:", err);
         alert("Error al procesar el pago");
      }
   };

   const getStatusBadge = (status: string) => {
      switch (status) {
         case "SENT":
            return (
               <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                  <Clock size={12} />
                  Pendiente
               </span>
            );
         case "PARTIAL":
            return (
               <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  <Receipt size={12} />
                  Parcial
               </span>
            );
         case "PAID":
            return (
               <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  <CheckCircle size={12} />
                  Pagado
               </span>
            );
         default:
         return null;
      }
   };

   if (isLoading) {
      return (
         <div className="flex items-center justify-center h-screen">
            <Loader2 size={48} className="animate-spin text-primary" />
         </div>
      );
   }

    return (
       <AppLayout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
               {newTransaction && (
                  <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-pulse">
                     <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Bell size={20} className="text-emerald-600" />
                     </div>
                     <div>
                        <p className="font-bold text-emerald-800">Nueva transacción detectada</p>
                        <p className="text-sm text-emerald-600">Factura #{newTransaction.number} - ${Number(newTransaction.total || newTransaction.amount || 0).toFixed(2)}</p>
                     </div>
                  </div>
               )}
               <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                     <DollarSign size={20} className="text-white" />
                  </div>
                  Caja - Cobros Pendientes
               </h1>
               <p className="text-slate-500 mt-1 text-sm">
                  Gestiona las facturas pendientes de cobro del punto de venta
               </p>
            </div>

            {/* Widgets Row - Todo en una fila horizontal */}
            <div className="grid grid-cols-4 gap-4 mb-6">
               {/* Turno de Caja */}
               <div className="col-span-1">
                  <CashDrawerShiftWidget />
               </div>

               {/* Stats */}
               <div className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                     <p className="text-xs text-slate-500 font-medium">Facturas Pendientes</p>
                     <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Receipt size={16} className="text-amber-600" />
                     </div>
                  </div>
                  <p className="text-2xl font-black text-amber-600">{totalCount}</p>
               </div>

               <div className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                     <p className="text-xs text-slate-500 font-medium">Total por Cobrar</p>
                     <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <DollarSign size={16} className="text-emerald-600" />
                     </div>
                  </div>
                  <p className="text-2xl font-black text-slate-800">${totalPending.toFixed(2)}</p>
               </div>

               <div className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                     <p className="text-xs text-slate-500 font-medium">Cobrado Hoy</p>
                     <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CheckCircle size={16} className="text-blue-600" />
                     </div>
                  </div>
                  <p className="text-2xl font-black text-emerald-600">$0.00</p>
               </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-border p-4 mb-6">
               <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                     <input
                        type="text"
                        placeholder="Buscar por número de factura o cliente..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                     />
                  </div>
                  <div className="flex gap-2">
                     <button
                        onClick={() => setFilterStatus("SENT")}
                        className={cn(
                           "px-4 py-2 rounded-xl font-bold text-sm transition-all",
                           filterStatus === "SENT"
                              ? "bg-primary text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                     >
                        Pendientes
                     </button>
                     <button
                        onClick={() => setFilterStatus("PARTIAL")}
                        className={cn(
                           "px-4 py-2 rounded-xl font-bold text-sm transition-all",
                           filterStatus === "PARTIAL"
                              ? "bg-primary text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                     >
                        Parciales
                     </button>
                     <button
                        onClick={() => setFilterStatus("all")}
                        className={cn(
                           "px-4 py-2 rounded-xl font-bold text-sm transition-all",
                           filterStatus === "all"
                              ? "bg-primary text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                     >
                        Todas
                     </button>
                  </div>
               </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
               {filteredInvoices.length === 0 ? (
                  <div className="p-12 text-center">
                     <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-slate-400" />
                     </div>
                     <h3 className="text-lg font-bold text-slate-700 mb-2">No hay facturas pendientes</h3>
                     <p className="text-slate-500">Todas las facturas han sido cobradas o no hay ventas pendientes.</p>
                  </div>
               ) : (
                  <table className="w-full">
                     <thead className="bg-slate-50 border-b border-border">
                        <tr>
                           <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Factura</th>
                           <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cliente</th>
                           <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                           <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total</th>
                           <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                           <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">Acción</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-border">
                        {filteredInvoices.map((invoice) => (
                           <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                       <Receipt size={18} className="text-slate-500" />
                                    </div>
                                    <div>
                                       <p className="font-bold text-slate-800">#{invoice.number}</p>
                                       <p className="text-xs text-slate-400">POS</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                    <User size={16} className="text-slate-400" />
                                    <div>
                                       <p className="font-medium text-slate-800">{invoice.clientName}</p>
                                       <p className="text-xs text-slate-400">{invoice.clientIdNumber || "Sin NIT"}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar size={14} />
                                    <span className="text-sm">{new Date(invoice.date).toLocaleDateString("es-DO")}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <p className="text-lg font-black text-slate-800">${Number(invoice.total).toFixed(2)}</p>
                                 <p className="text-xs text-slate-400">ITBIS: ${Number(invoice.tax).toFixed(2)}</p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                 {getStatusBadge(invoice.status)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button
                                    onClick={() => handleCollectPayment(invoice)}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                 >
                                    <DollarSign size={16} />
                                    Cobrar
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
         </div>

          {/* Checkout Modal */}
          {selectedInvoice && (
             <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => {
                   setIsCheckoutOpen(false);
                   setSelectedInvoice(null);
                }}
                onComplete={handlePaymentComplete}
                total={Number(selectedInvoice.total)}
             />
          )}
       </div>
       </AppLayout>
    );
}
