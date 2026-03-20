"use client";

import { useState, useMemo, useEffect } from "react";
import {
   Search,
   ShoppingCart,
   User,
   Trash2,
   Plus,
   Minus,
   ChevronLeft,
   X,
   Package,
   ScanLine,
   Clock,
   Zap,
   Receipt,
   CreditCard,
   Banknote
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReceiptModal } from "@/components/modals/ReceiptModal";
import { CheckoutModal } from "@/components/modals/CheckoutModal";
import { ContactSearch } from "@/components/ui/Autocomplete";
import { useProducts, useClients, useCreateInvoice } from "@/hooks/useDatabase";
import { usePrinter } from "@/hooks/usePrinter";
import { useRef } from "react";

type POSType = "STANDARD" | "SPLIT";
type POSPrintFormat = "TICKET" | "HALF_LETTER" | "LETTER";

interface POSConfig {
   posType: POSType;
   printFormat: POSPrintFormat;
   printCopies: number;
   autoPrint: boolean;
   showLogo: boolean;
   defaultClientId?: string;
   defaultTaxRate: number;
   taxIncluded: boolean;
}

export default function PosPage() {
   const { data: products, isLoading: isLoadingProducts } = useProducts();
   const { data: clients, isLoading: isLoadingClients } = useClients();
   const createInvoice = useCreateInvoice();
   const { printDirect } = usePrinter();

   const [config, setConfig] = useState<POSConfig>({
      posType: "STANDARD",
      printFormat: "TICKET",
      printCopies: 1,
      autoPrint: false,
      showLogo: true,
      defaultTaxRate: 18,
      taxIncluded: true,
   });
   const [isLoadingConfig, setIsLoadingConfig] = useState(true);

   const [cart, setCart] = useState<any[]>([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [activeCategory, setActiveCategory] = useState("Todos");
    const [selectedClientId, setSelectedClientId] = useState<string>("");
   const [isReceiptOpen, setIsReceiptOpen] = useState(false);
   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
    const [billingSuccess, setBillingSuccess] = useState(false);
    const [pendingInvoiceId, setPendingInvoiceId] = useState<string>("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [currentOrderId, setCurrentOrderId] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);
    const [isPendingInvoicesOpen, setIsPendingInvoicesOpen] = useState(false);
    const [selectedPendingInvoice, setSelectedPendingInvoice] = useState<any>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      fetchConfig();
   }, []);

   const fetchConfig = async () => {
      try {
         const res = await fetch("/api/pos/config");
         if (res.ok) {
            const data = await res.json();
            setConfig(data);
            if (data.defaultClientId) {
               setSelectedClientId(data.defaultClientId);
            }
         }
      } catch (err) {
         console.error("Error fetching config:", err);
      } finally {
         setIsLoadingConfig(false);
      }
   };

   const categories = useMemo((): string[] => {
      if (!products) return ["Todos"];
      const cats = new Set<string>();
      (products as any[]).forEach((p) => cats.add(p.category?.name || "Sin categoría"));
      return ["Todos", ...Array.from(cats)];
   }, [products]);

   const filteredProducts = useMemo(() => {
      if (!products) return [];
      return products.filter((p: any) => {
         const matchesSearch = searchQuery === "" || 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
         const matchesCategory = activeCategory === "Todos" || p.category?.name === activeCategory;
         return matchesSearch && matchesCategory;
      });
   }, [products, searchQuery, activeCategory]);

   const addToCart = (product: any) => {
      if (product.stock <= 0) return;
      const existing = cart.find(item => item.id === product.id);
      if (existing) {
         if (existing.quantity < product.stock) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
         }
      } else {
         setCart([...cart, { ...product, quantity: 1 }]);
      }
   };

   const openCheckout = () => {
      if (cart.length === 0) return;
      setIsCheckoutOpen(true);
   };

   const completeCheckout = async (payments: any[]) => {
      let currentClientId = selectedClientId;
      if (!currentClientId && clients && clients.length > 0) {
         currentClientId = clients[0].id;
         setSelectedClientId(currentClientId);
      }

      if (!currentClientId) {
         alert("Por favor selecciona un cliente antes de finalizar.");
         return;
      }

        const orderNumber = `POS-${Date.now().toString(36).toUpperCase()}`;

        const payload = {
           number: orderNumber,
           date: new Date().toISOString(),
           clientId: currentClientId,
           subtotal: Number(subtotal),
           tax: Number(itbis),
           total: Number(total),
           status: "PAID" as const,
           isPOS: true,
           items: cart.map(item => ({
              productId: item.id,
              quantity: Number(item.quantity),
              price: Number(item.price),
              total: Number(item.price * item.quantity),
              description: item.name
           })),
           payments: payments.map(p => ({
              amount: p.amount,
              method: p.type === "Efectivo" ? "CASH" : p.type === "Tarjeta" ? "CREDIT_CARD" : "BANK_TRANSFER"
           }))
        };

      try {
         await createInvoice.mutateAsync(payload);
         setPaymentMethods(payments);
         setIsCheckoutOpen(false);
         setCurrentOrderId(orderNumber);
         setIsReceiptOpen(true);
         
         // Auto-print after a short delay
         setTimeout(async () => {
            const receiptContent = receiptRef.current?.innerHTML || "";
            const success = await printDirect(receiptContent);
            if (success) {
               setTimeout(() => {
                  setIsReceiptOpen(false);
                  setCart([]);
                  setPaymentMethods([]);
               }, 1500);
            }
         }, 500);
      } catch (error: any) {
         console.error("Error completing checkout:", error);
         alert(`Hubo un error al procesar la venta: ${error.message || "Error desconocido"}`);
      }
   };

   const resetSale = () => {
      setCart([]);
      setPaymentMethods([]);
      setIsReceiptOpen(false);
      setCurrentOrderId("");
   };

   const updateQuantity = (id: string, delta: number) => {
      setCart(cart.map(item => {
         if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return newQty === 0 ? null : { ...item, quantity: newQty };
         }
         return item;
      }).filter((item): item is any => item !== null));
   };

    const removeItem = (id: string) => {
       setCart(cart.filter(item => item.id !== id));
    };

    const taxRate = config.defaultTaxRate / 100;
    
    const total = useMemo(() => {
       return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }, [cart]);

    const itemCount = useMemo(() => {
       return cart.reduce((acc, item) => acc + item.quantity, 0);
    }, [cart]);

    const subtotal = config.taxIncluded ? total / (1 + taxRate) : total;
    const itbis = total - subtotal;

    const getPrintWidth = () => {
       switch (config.printFormat) {
          case "TICKET": return "80mm";
          case "HALF_LETTER": return "148mm";
          case "LETTER": return "216mm";
          default: return "80mm";
       }
    };

    const handleBilling = async () => {
       if (cart.length === 0) return;
       if (!selectedClientId) {
          alert("Por favor selecciona un cliente");
          return;
       }

       // Crear la factura en estado SENT (pendiente de pago)
       const orderNumber = `POS-${Date.now().toString(36).toUpperCase()}`;
       
       const payload = {
          number: orderNumber,
          date: new Date().toISOString(),
          clientId: selectedClientId,
          subtotal: Number(subtotal),
          tax: Number(itbis),
          total: Number(total),
          status: "SENT" as const, // Pendiente de pago
          isPOS: true,
          items: cart.map(item => ({
             productId: item.id,
             quantity: Number(item.quantity),
             price: Number(item.price),
             total: Number(item.price * item.quantity),
             description: item.name
          }))
       };

        try {
            await createInvoice.mutateAsync(payload);
            setPendingInvoiceId(orderNumber);
            setBillingSuccess(true);
            setToastMessage(`La factura #${orderNumber} ha sido creada exitosamente`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
            setCart([]);
         } catch (error: any) {
          console.error("Error creating invoice:", error);
          alert(`Error al crear factura: ${error.message}`);
       }
    };

     const handlePayment = async () => {
        if (config.posType === "SPLIT") {
           // En modo SPLIT, cobrar facturas pendientes
           try {
              const res = await fetch("/api/invoices");
              if (res.ok) {
                 const allInvoices = await res.json();
                 const pending = allInvoices.filter((inv: any) => inv.status === "SENT");
                 setPendingInvoices(pending);
                 setIsPendingInvoicesOpen(true);
              }
           } catch (err) {
              console.error("Error fetching pending invoices:", err);
              alert("Error al cargar facturas pendientes");
           }
        } else {
           // En modo STANDARD, proceso de cobro directo
           if (cart.length === 0) return;
           if (!selectedClientId) {
              alert("Por favor selecciona un cliente");
              return;
           }
           setIsCheckoutOpen(true);
        }
     };

      const handlePayPendingInvoice = (invoice: any) => {
         setSelectedPendingInvoice(invoice);
         setIsPendingInvoicesOpen(false);
         setIsCheckoutOpen(true);
      };

      const completePendingInvoicePayment = async (payments: any[]) => {
         if (!selectedPendingInvoice) return;

         try {
            // Actualizar el estado de la factura a PAID
            const res = await fetch(`/api/invoices/${selectedPendingInvoice.id}/status`, {
               method: "PATCH",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ status: "PAID" })
            });

            if (!res.ok) throw new Error("Error al actualizar factura");

            // Registrar los pagos usando el endpoint existente
            await fetch(`/api/invoices/${selectedPendingInvoice.id}/payments`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  payments: payments.map(p => ({
                     type: p.type === "Efectivo" ? "CASH" : p.type === "Tarjeta" ? "CREDIT_CARD" : "BANK_TRANSFER",
                     amount: p.amount
                  }))
               })
            });

            setPaymentMethods(payments);
            setCurrentOrderId(selectedPendingInvoice.number);
            setIsCheckoutOpen(false);
            setIsReceiptOpen(true);
            setSelectedPendingInvoice(null);

            // Limpiar después de mostrar el recibo
            setTimeout(() => {
               setIsReceiptOpen(false);
               setCart([]);
               setPaymentMethods([]);
            }, 3000);

         } catch (error: any) {
            console.error("Error paying invoice:", error);
            alert(`Error al procesar pago: ${error.message}`);
         }
      };

     const completeBillingAndPayment = async (payments: any[]) => {
       let currentClientId = selectedClientId;
       if (!currentClientId && clients && clients.length > 0) {
          currentClientId = clients[0].id;
       }

       if (!currentClientId) {
          alert("Por favor selecciona un cliente antes de finalizar.");
          return;
       }

       const orderNumber = `POS-${Date.now().toString(36).toUpperCase()}`;

       const payload = {
          number: orderNumber,
          date: new Date().toISOString(),
          clientId: currentClientId,
          subtotal: Number(subtotal),
          tax: Number(itbis),
          total: Number(total),
          status: "PAID" as const,
          isPOS: true,
          items: cart.map(item => ({
             productId: item.id,
             quantity: Number(item.quantity),
             price: Number(item.price),
             total: Number(item.price * item.quantity),
             description: item.name
          }))
       };

        try {
           await createInvoice.mutateAsync(payload);
           setPaymentMethods(payments);
           setIsCheckoutOpen(false);
           setCurrentOrderId(orderNumber);
           setIsReceiptOpen(true);
          
          if (config.autoPrint) {
             setTimeout(async () => {
                const receiptContent = receiptRef.current?.innerHTML || "";
                const success = await printDirect(receiptContent);
                if (success) {
                   setTimeout(() => {
                      setIsReceiptOpen(false);
                      setCart([]);
                      setPaymentMethods([]);
                   }, 1500);
                }
             }, 500);
          }
       } catch (error: any) {
          console.error("Error completing checkout:", error);
          alert(`Hubo un error al procesar la venta: ${error.message || "Error desconocido"}`);
       }
    };

   return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
         <div className="flex-1 flex flex-col min-w-0">
            <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-white/80 backdrop-blur-sm shadow-sm z-10">
               <div className="flex items-center space-x-4">
                  <Link href="/" className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all">
                     <ChevronLeft size={20} />
                  </Link>
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                        <Zap size={16} className="text-white" />
                     </div>
                     <h1 className="text-xl font-black text-slate-800 tracking-tight">Punto de Venta</h1>
                  </div>
               </div>

               <div className="flex-1 max-w-xl mx-8">
                  <div className="relative group">
                     <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                     <input
                        type="text"
                        placeholder="Buscar por nombre o código (SKU)..."
                        value={searchQuery}
                        onChange={(e) => {
                           setSearchQuery(e.target.value);
                           setIsSearching(e.target.value.length > 0);
                        }}
                        onFocus={() => setIsSearching(true)}
                        onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium"
                     />
                  </div>
               </div>

                 <div className="flex items-center gap-3">
                    {/* Indicador de modo POS */}
                    <div className={cn(
                       "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5",
                       config.posType === "SPLIT" 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-emerald-100 text-emerald-700"
                    )}>
                       {config.posType === "SPLIT" ? (
                          <><Receipt size={14} /> Facturar</>
                       ) : (
                          <><Zap size={14} /> Caja Normal</>
                       )}
                    </div>
                    <div className="text-right hidden md:block">
                     <p className="text-xs text-slate-400">{new Date().toLocaleDateString("es-DO", { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                     <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                        <Clock size={12} />
                        {new Date().toLocaleTimeString("es-DO", { hour: '2-digit', minute: '2-digit' })}
                     </p>
                  </div>
                  <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/25">
                     <ShoppingCart size={18} />
                  </div>
               </div>
            </header>

            <div className="px-6 py-4 bg-white border-b border-border flex items-center justify-between">
               <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1 mr-4">
                  {categories.map((cat) => (
                     <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                           "px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border",
                           activeCategory === cat
                              ? "bg-slate-800 text-white border-slate-800"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        )}
                     >
                        {cat}
                     </button>
                  ))}
               </div>

               <div className="relative flex-shrink-0">
                  <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
                     <User size={16} className="text-slate-400" />
                     <ContactSearch
                        value={clients?.find((c: any) => c.id === selectedClientId)?.name || ""}
                        contacts={clients?.filter((c: any) => c.type === "CLIENT" || c.type === "BOTH") || []}
                        onChange={(val: string) => {
                           if (!val) setSelectedClientId("");
                        }}
                        onSelect={(c: any) => setSelectedClientId(c.id)}
                        placeholder="Cliente (opcional)"
                     />
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
               {isLoadingProducts ? (
                  <div className="flex items-center justify-center h-64">
                     <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
               ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                     <Package size={48} className="mb-4 opacity-50" />
                     <p className="font-medium">No se encontraron productos</p>
                     <p className="text-sm">Try adjusting your search</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                     {filteredProducts.map((product: any) => (
                        <button
                           key={product.id}
                           onClick={() => addToCart(product)}
                           disabled={product.stock <= 0}
                           className={cn(
                              "bg-white rounded-2xl border-2 border-slate-100 overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all text-left group relative",
                              product.stock <= 0 && "opacity-50 cursor-not-allowed"
                           )}
                        >
                           <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-50">
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <Package size={32} className="text-slate-300" />
                              </div>
                              {product.stock > 0 && product.stock <= 5 && (
                                 <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                    {product.stock} unidades
                                 </div>
                              )}
                              {product.stock <= 0 && (
                                 <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                                    <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">Agotado</span>
                                 </div>
                              )}
                              <div className="absolute bottom-2 left-2">
                                 {product.sku && (
                                    <span className="bg-slate-800 text-white text-[10px] font-mono px-2 py-0.5 rounded">{product.sku}</span>
                                 )}
                              </div>
                           </div>
                           <div className="p-3">
                              <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight">{product.name}</h3>
                              <div className="mt-2 flex items-center justify-between">
                                 <span className="text-xs text-slate-400">{product.category?.name || "General"}</span>
                                 <span className="text-lg font-black text-primary">${Number(product.price).toFixed(2)}</span>
                              </div>
                           </div>
                        </button>
                     ))}
                  </div>
               )}
            </div>
         </div>

         <aside className="w-[380px] flex flex-col bg-white shadow-2xl border-l border-border z-20">
            <div className="p-5 border-b border-border flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                     <ShoppingCart size={20} className="text-white" />
                  </div>
                  <div>
                     <h2 className="text-lg font-bold text-slate-800">Carrito</h2>
                     <p className="text-xs text-slate-400">{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</p>
                  </div>
               </div>
               {cart.length > 0 && (
                  <button
                     onClick={() => setCart([])}
                     className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
                  >
                     <Trash2 size={18} />
                  </button>
               )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                     <ShoppingCart size={48} className="mb-3 opacity-50" />
                     <p className="font-medium text-slate-400">Carrito vacío</p>
                     <p className="text-xs text-slate-300 mt-1">Agrega productos para comenzar</p>
                  </div>
               ) : (
                  cart.map(item => (
                     <div key={item.id} className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 hover:bg-slate-100 transition-colors group">
                        <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
                           <Package size={20} className="text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                           <p className="text-xs text-slate-400">${Number(item.price).toFixed(2)} c/u</p>
                        </div>
                        <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200">
                           <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1.5 hover:bg-slate-100 rounded-l-lg text-slate-500"
                           >
                              <Minus size={14} />
                           </button>
                           <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                           <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1.5 hover:bg-slate-100 rounded-r-lg text-slate-500"
                           >
                              <Plus size={14} />
                           </button>
                        </div>
                        <button
                           onClick={() => removeItem(item.id)}
                           className="p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                           <X size={16} />
                        </button>
                     </div>
                  ))
               )}
            </div>

            <div className="p-5 bg-slate-50 border-t border-border space-y-4">
               <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                     <span className="text-slate-500">Subtotal</span>
                     <span className="font-semibold">${Number(subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-slate-500">ITBIS ({config.defaultTaxRate}%)</span>
                     <span className="font-semibold">${Number(itbis).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-slate-200">
                     <span className="font-bold text-slate-700">Total</span>
                     <span className="text-3xl font-black text-primary">${Number(total).toFixed(2)}</span>
                  </div>
               </div>

               {config.posType === "STANDARD" ? (
                  <button
                     onClick={openCheckout}
                     disabled={cart.length === 0}
                     className={cn(
                        "w-full py-4 bg-gradient-to-r from-primary to-primary/90 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2",
                        cart.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95"
                     )}
                  >
                     <Zap size={22} />
                     Cobrar
                  </button>
               ) : (
                   <button
                      onClick={handleBilling}
                      disabled={cart.length === 0 || !selectedClientId}
                      className={cn(
                         "w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2",
                         (cart.length === 0 || !selectedClientId) ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                      )}
                   >
                      <Receipt size={22} />
                      Facturar
                   </button>
                )}
            </div>
         </aside>

         {/* Ticket Receipt Template - Hidden */}
         <div ref={receiptRef} className="hidden print:block" style={{ fontFamily: 'Courier New, monospace', fontSize: '11px', width: '80mm', padding: '5mm' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
               <div style={{ fontSize: '16px', fontWeight: 'bold' }}>DAVASOFT S.A.S</div>
               <div style={{ fontSize: '10px' }}>NIT: 901.234.567-8</div>
               <div style={{ fontSize: '10px' }}>Av. Principal #123, Santo Domingo</div>
               <div style={{ fontSize: '10px' }}>Tel: (809) 555-1234</div>
            </div>
            
            <div style={{ borderTop: '1px dashed #333', borderBottom: '1px dashed #333', padding: '8px 0', margin: '10px 0' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>FECHA:</span>
                  <span>{new Date().toLocaleDateString('es-DO')}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>HORA:</span>
                  <span>{new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>ORDEN:</span>
                  <span style={{ fontWeight: 'bold' }}>{currentOrderId}</span>
               </div>
            </div>

            {/* Items Header */}
            <div style={{ borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '5px', display: 'flex', fontSize: '9px', fontWeight: 'bold' }}>
               <div style={{ width: '50%' }}>ARTÍCULO</div>
               <div style={{ width: '15%', textAlign: 'center' }}>CANT</div>
               <div style={{ width: '15%', textAlign: 'right' }}>PRECIO</div>
               <div style={{ width: '20%', textAlign: 'right' }}>TOTAL</div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: '10px' }}>
               {cart.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '4px', fontSize: '10px' }}>
                     <div style={{ fontWeight: 'bold' }}>{item.name.substring(0, 25)}</div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#666' }}>
                        <span>{item.quantity} x ${Number(item.price).toFixed(2)}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                     </div>
                  </div>
               ))}
            </div>

            <div style={{ borderTop: '1px dashed #333', paddingTop: '10px', marginTop: '10px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>SUBTOTAL:</span>
                  <span>${subtotal.toFixed(2)}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>ITBIS (18%):</span>
                  <span>${itbis.toFixed(2)}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', marginTop: '5px', borderTop: '1px solid #333', paddingTop: '5px' }}>
                  <span>TOTAL:</span>
                  <span>${Number(total).toFixed(2)}</span>
               </div>
            </div>

            {/* Payment Details */}
            {paymentMethods.length > 0 && (
               <div style={{ borderTop: '1px dashed #333', paddingTop: '10px', marginTop: '10px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '5px' }}>FORMA DE PAGO:</div>
                  {paymentMethods.map((p, idx) => (
                     <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                        <span>{p.type}:</span>
                        <span>${Number(p.amount).toFixed(2)}</span>
                     </div>
                  ))}
                  {paymentMethods.reduce((acc, p) => acc + p.amount, 0) > total && (
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', color: '#0066cc' }}>
                        <span>CAMBIO:</span>
                        <span>${(paymentMethods.reduce((acc, p) => acc + p.amount, 0) - total).toFixed(2)}</span>
                     </div>
                  )}
               </div>
            )}

            {/* Footer */}
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

          {/* Pending Invoices Modal - SPLIT mode */}
          {isPendingInvoicesOpen && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                   <div className="p-6 border-b border-slate-200">
                      <h2 className="text-xl font-black text-slate-800">Facturas Pendientes</h2>
                      <p className="text-sm text-slate-500">Selecciona una factura para cobrar</p>
                   </div>
                   <div className="max-h-96 overflow-y-auto p-4">
                      {pendingInvoices.length === 0 ? (
                         <div className="text-center py-8 text-slate-400">
                            <Receipt size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No hay facturas pendientes</p>
                         </div>
                      ) : (
                         <div className="space-y-2">
                            {pendingInvoices.map((inv: any) => (
                               <button
                                  key={inv.id}
                                  onClick={() => handlePayPendingInvoice(inv)}
                                  className="w-full p-4 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all text-left"
                               >
                                  <div className="flex justify-between items-center">
                                     <div>
                                        <p className="font-bold text-slate-800">#{inv.number}</p>
                                        <p className="text-sm text-slate-500">{inv.client?.name || "Sin cliente"}</p>
                                     </div>
                                     <div className="text-right">
                                        <p className="font-bold text-lg text-primary">${Number(inv.total).toFixed(2)}</p>
                                        <p className="text-xs text-slate-400">{new Date(inv.date).toLocaleDateString("es-DO")}</p>
                                     </div>
                                  </div>
                               </button>
                            ))}
                         </div>
                      )}
                   </div>
                   <div className="p-4 border-t border-slate-200">
                      <button
                         onClick={() => setIsPendingInvoicesOpen(false)}
                         className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                      >
                         Cerrar
                      </button>
                   </div>
                </div>
             </div>
          )}

          <CheckoutModal
              isOpen={isCheckoutOpen}
              onClose={() => {
                 setIsCheckoutOpen(false);
                 setSelectedPendingInvoice(null);
              }}
              onComplete={selectedPendingInvoice ? completePendingInvoicePayment : completeCheckout}
              total={selectedPendingInvoice ? selectedPendingInvoice.total : total}
           />

          {/* Toast Notification - Factura Creada */}
          {showToast && (
            <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right duration-300">
              <div className="bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Receipt size={18} />
                </div>
                <div>
                  <p className="font-bold">Factura Creada</p>
                  <p className="text-sm text-emerald-100">{toastMessage}</p>
                </div>
                <button 
                  onClick={() => setShowToast(false)}
                  className="ml-2 text-emerald-200 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <ReceiptModal
             isOpen={isReceiptOpen}
             onClose={resetSale}
             cart={cart}
             total={total}
             orderId={currentOrderId}
             paymentMethods={paymentMethods}
             autoPrint={config.autoPrint}
             printFormat={config.printFormat}
             taxRate={config.defaultTaxRate}
             showLogo={config.showLogo}
          />
       </div>
    );
}
