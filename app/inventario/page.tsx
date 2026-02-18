"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Plus, Search, Filter, MoreVertical, Package, ShoppingBag, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductModal } from "@/components/modals/ProductModal";

import { useProducts } from "@/hooks/useDatabase";

export default function InventarioPage() {
  const { data: products, isLoading } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const handleSaveProduct = async (formData: any) => {
    console.log("Saving product:", formData);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
            <p className="text-slate-500 mt-1">Administra tus productos y servicios.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Categorías
            </button>
            <button
              onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center shadow-sm"
            >
              <Plus size={18} className="mr-2" />
              Nuevo Item
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full bg-white px-4 py-2 rounded-xl border border-border flex items-center shadow-sm">
            <Search className="text-slate-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o referencia..."
              className="flex-1 bg-transparent border-none py-1 text-sm focus:ring-0 outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
              Lista
            </button>
            <button className="px-4 py-2.5 bg-primary text-white border border-primary rounded-xl text-sm font-medium shadow-sm">
              Cuadrícula
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full p-12 text-center text-slate-400 italic">Cargando inventario...</div>
          ) : products?.map((product: any) => (
            <div key={product.id} className="bg-white rounded-2xl border border-border overflow-hidden group hover:shadow-lg transition-all cursor-pointer relative">
              <div className="relative h-48 w-full bg-slate-100">
                <img
                  src={product.image || "https://images.unsplash.com/photo-1586769852044-692d6e3703a0?w=400&h=300&fit=crop"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-700 px-2 py-1 rounded-md shadow-sm uppercase tracking-wider">
                    {product.category?.name || "General"}
                  </span>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingProduct(product); setIsModalOpen(true); }}
                      className="p-2 bg-white rounded-lg shadow-md text-slate-600 hover:text-primary transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); /* Delete logic */ }}
                      className="p-2 bg-white rounded-lg shadow-md text-slate-600 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Precio</p>
                    <p className="text-lg font-black text-slate-800">${Number(product.price).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Stock</p>
                    <p className={cn(
                      "text-sm font-bold",
                      product.stock > 10 ? "text-emerald-600" :
                        product.stock > 0 ? "text-amber-600" : "text-rose-600"
                    )}>{product.stock}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-slate-400 border-spacing-4 hover:border-primary hover:text-primary transition-all cursor-pointer group min-h-[300px]"
          >
            <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
              <Plus size={24} />
            </div>
            <p className="font-bold text-sm">Nuevo Producto</p>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />
    </AppLayout>
  );
}
