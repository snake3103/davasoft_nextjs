"use client";

import { useState, useMemo } from "react";
import {
   Search,
   ShoppingCart,
   User,
   Trash2,
   Plus,
   Minus,
   ChevronLeft,
   SearchIcon,
   X,
   CreditCard,
   Banknote,
   CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReceiptModal } from "@/components/modals/ReceiptModal";
import { CheckoutModal } from "@/components/modals/CheckoutModal";

import { useProducts, useClients, useCreateInvoice } from "@/hooks/useDatabase";

const categories = ["Todos", "Servicios", "Digital", "Hardware"];

export default function PosPage() {
   const { data: products, isLoading: isLoadingProducts } = useProducts();
   const { data: clients, isLoading: isLoadingClients } = useClients();
   const createInvoice = useCreateInvoice();

   const [cart, setCart] = useState<any[]>([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [activeCategory, setActiveCategory] = useState("Todos");
   const [selectedClientId, setSelectedClientId] = useState<string>("");
   const [isReceiptOpen, setIsReceiptOpen] = useState(false);
   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
   const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
   const [currentOrderId, setCurrentOrderId] = useState("");

   const filteredProducts = useMemo(() => {
      if (!products) return [];
      return products.filter((p: any) => {
         const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
         // Map database category logic if needed, for now using name match
         const matchesCategory = activeCategory === "Todos" || (p.category?.name === activeCategory);
         return matchesSearch && matchesCategory;
      });
   }, [products, searchQuery, activeCategory]);

   const addToCart = (product: any) => {
      const existing = cart.find(item => item.id === product.id);
      if (existing) {
         setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
         setCart([...cart, { ...product, quantity: 1 }]);
      }
   };

   const openCheckout = () => {
      if (cart.length === 0) return;
      setIsCheckoutOpen(true);
   };

   const completeCheckout = async (payments: any[]) => {
      if (!selectedClientId && clients && clients.length > 0) {
         // Fallback to first client if none selected
         setSelectedClientId(clients[0].id);
      }

      const orderNumber = `POS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      try {
         await createInvoice.mutateAsync({
            number: orderNumber,
            date: new Date().toISOString(),
            clientId: selectedClientId || (clients && clients[0]?.id),
            subtotal: total / 1.19,
            tax: total - (total / 1.19),
            total: total,
            status: "PAID",
            items: cart.map(item => ({
               productId: item.id,
               quantity: item.quantity,
               price: item.price,
               total: item.price * item.quantity
            }))
         });

         setPaymentMethods(payments);
         setIsCheckoutOpen(false);
         setCurrentOrderId(orderNumber);
         setIsReceiptOpen(true);
      } catch (error) {
         console.error("Error completing checkout:", error);
         alert("Hubo un error al procesar la venta. Por favor intenta de nuevo.");
      }
   };

   const resetSale = () => {
      setCart([]);
      setPaymentMethods([]);
      setIsReceiptOpen(false);
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

   const total = useMemo(() => {
      return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
   }, [cart]);

   return (
      <div className="flex h-screen overflow-hidden bg-white">
         {/* Left: Product Grid */}
         <div className="flex-1 flex flex-col min-w-0 border-r border-border">
            {/* Top Header */}
            <header className="h-20 flex items-center justify-between px-8 border-b border-border bg-white shadow-sm z-10">
               <div className="flex items-center space-x-6">
                  <Link href="/" className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all border border-transparent hover:border-slate-100">
                     <ChevronLeft size={24} />
                  </Link>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Punto de Venta</h1>
               </div>

               <div className="flex-1 max-w-xl mx-8">
                  <div className="relative group">
                     <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                     <input
                        type="text"
                        placeholder="Escanear código o buscar producto..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-medium"
                     />
                  </div>
               </div>

               <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                     <ShoppingCart size={20} />
                  </div>
               </div>
            </header>

            {/* Categories & Customer Selection Bar */}
            <div className="px-10 py-6 bg-white border-b border-border flex items-center justify-between">
               <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide flex-1 mr-8">
                  {categories.map(cat => (
                     <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                           "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border",
                           activeCategory === cat
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                              : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
                        )}
                     >
                        {cat}
                     </button>
                  ))}
               </div>

               <div className="relative">
                  <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 flex items-center space-x-3 cursor-pointer hover:bg-slate-100 transition-colors">
                     <div className="p-2 bg-white rounded-xl shadow-sm">
                        <User size={18} className="text-slate-500" />
                     </div>
                     <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                     >
                        <option value="">Seleccionar Cliente</option>
                        {clients?.map((c: any) => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                     </select>
                  </div>
               </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
               {isLoadingProducts ? (
                  <div className="flex items-center justify-center h-64 text-slate-400 italic">Cargando productos...</div>
               ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                     {filteredProducts.map((product: any) => (
                        <div
                           key={product.id}
                           onClick={() => addToCart(product)}
                           className="bg-white rounded-[2rem] border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/10 group cursor-pointer transition-all active:scale-95 border-spacing-2"
                        >
                           <div className="relative h-48 w-full bg-slate-100">
                              <img src={product.image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                              <div className="absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-primary shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                                 <Plus size={20} />
                              </div>
                           </div>
                           <div className="p-6">
                              <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug">{product.name}</h3>
                              <div className="mt-4 flex items-center justify-between">
                                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{product.category?.name || "General"}</span>
                                 <span className="text-lg font-black text-slate-900">${Number(product.price).toFixed(2)}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Right: Cart Sidebar */}
         <aside className="w-[450px] flex flex-col bg-slate-900 text-white shadow-2xl z-20">
            <div className="p-8 border-b border-white/10 flex items-center justify-between">
               <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
                     <ShoppingCart size={24} className="text-white" />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold">Carrito</h2>
                     <p className="text-slate-400 text-xs mt-0.5">{cart.length} productos agregados</p>
                  </div>
               </div>
               <button
                  onClick={() => setCart([])}
                  className="p-3 hover:bg-white/5 rounded-2xl text-slate-400 hover:text-rose-400 transition-all border border-transparent hover:border-white/10"
               >
                  <Trash2 size={20} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
               {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                     <ShoppingCart size={64} className="mb-6" />
                     <p className="font-bold text-lg">Tu carrito está vacío</p>
                     <p className="text-sm mt-2 px-10">Selecciona productos a la izquierda para comenzar una venta.</p>
                  </div>
               ) : (
                  cart.map(item => (
                     <div key={item.id} className="bg-white/5 border border-white/5 rounded-[1.75rem] p-5 flex items-center space-x-5 hover:bg-white/10 transition-colors">
                        <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                           <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-sm truncate">{item.name}</h4>
                           <p className="text-xs text-slate-400 mt-1">${Number(item.price).toFixed(2)} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center space-x-2 bg-black/30 rounded-full p-1 border border-white/5">
                           <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                           >
                              <Minus size={14} />
                           </button>
                           <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                           <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                           >
                              <Plus size={14} />
                           </button>
                        </div>
                     </div>
                  ))
               )}
            </div>

            {/* Footer / Summary */}
            <div className="p-8 bg-black/40 border-t border-white/10 space-y-6">
               <div className="space-y-3">
                  <div className="flex justify-between text-slate-400 text-sm">
                     <span>Subtotal</span>
                     <span className="font-mono">${(total * 0.81).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-sm">
                     <span>IVA (19%)</span>
                     <span className="font-mono">${(total * 0.19).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-white/5">
                     <span className="text-lg font-bold">Total a pagar</span>
                     <span className="text-4xl font-black text-primary tracking-tighter">${Number(total).toFixed(2)}</span>
                  </div>
               </div>

               <button
                  onClick={openCheckout}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-95"
               >
                  <CheckCircle2 size={24} />
                  <span>Pagar ahora</span>
               </button>
            </div>
         </aside>

         <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            onComplete={completeCheckout}
            total={total}
         />

         <ReceiptModal
            isOpen={isReceiptOpen}
            onClose={resetSale}
            cart={cart}
            total={total}
            orderId={currentOrderId}
            paymentMethods={paymentMethods}
         />
      </div>
   );
}
