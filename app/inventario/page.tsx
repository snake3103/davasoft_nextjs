"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Plus, Search, Filter, MoreVertical, Package, ShoppingBag, Edit, Trash2, Grid, List, AlertTriangle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductModal } from "@/components/modals/ProductModal";
import { useProducts, useCategories } from "@/hooks/useDatabase";
import Link from "next/link";

export default function InventarioPage() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product: any) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const totalValue = useMemo(() => {
    if (!products) return 0;
    return products.reduce((sum: number, p: any) => sum + (Number(p.price) * p.stock), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    if (!products) return 0;
    return products.filter((p: any) => p.minStock > 0 && p.stock <= p.minStock).length;
  }, [products]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
            <p className="text-slate-500 mt-1">Administra tus productos y control de stock.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/inventario/movimientos"
              className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center"
            >
              <Eye size={18} className="mr-2" />
              Movimientos
            </Link>
            <button
              onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center shadow-sm"
            >
              <Plus size={18} className="mr-2" />
              Nuevo Producto
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Productos</p>
                <p className="text-xl font-bold text-slate-800">{products?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <ShoppingBag size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Valor Inventario</p>
                <p className="text-xl font-bold text-slate-800">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Bajo Stock</p>
                <p className="text-xl font-bold text-slate-800">{lowStockCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Package size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Categorías</p>
                <p className="text-xl font-bold text-slate-800">{categories?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-border">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-transparent rounded-lg py-2 pl-10 pr-4 text-sm focus:bg-white focus:border-primary/20 outline-none transition-all"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-transparent rounded-lg text-sm focus:bg-white focus:border-primary/20 outline-none"
          >
            <option value="">Todas las categorías</option>
            {categories?.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === "grid" ? "bg-white shadow text-primary" : "text-slate-400"
              )}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === "list" ? "bg-white shadow text-primary" : "text-slate-400"
              )}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 italic">Cargando inventario...</div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product: any) => (
              <div key={product.id} className="bg-white rounded-2xl border border-border overflow-hidden group hover:shadow-lg transition-all">
                <div className="relative h-36 bg-slate-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package size={40} className="text-slate-300" />
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="bg-white/90 text-[10px] font-bold text-slate-700 px-2 py-1 rounded-md">
                      {product.category?.name || "General"}
                    </span>
                  </div>
                  {product.minStock > 0 && product.stock <= product.minStock && (
                    <div className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-md">
                      Bajo stock
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingProduct(product); setIsModalOpen(true); }}
                        className="p-1.5 bg-white rounded-lg shadow text-slate-600 hover:text-primary"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Precio</p>
                      <p className="font-bold text-slate-800">${Number(product.price).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase">Stock</p>
                      <p className={cn(
                        "font-bold",
                        product.stock > 10 ? "text-emerald-600" :
                          product.stock > 0 ? "text-amber-600" : "text-rose-600"
                      )}>{product.stock}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table headers={["Producto", "Categoría", "SKU", "Precio", "Stock", "Mín. Stock", "Estado", "Acciones"]}>
            {filteredProducts.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category?.name || "-"}</TableCell>
                <TableCell className="font-mono text-xs">{product.sku || "-"}</TableCell>
                <TableCell className="font-bold">${Number(product.price).toLocaleString()}</TableCell>
                <TableCell className={cn(
                  "font-bold",
                  product.stock > 10 ? "text-emerald-600" :
                    product.stock > 0 ? "text-amber-600" : "text-rose-600"
                )}>{product.stock}</TableCell>
                <TableCell>{product.minStock || 0}</TableCell>
                <TableCell>
                  {product.stock === 0 ? (
                    <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">Agotado</span>
                  ) : product.minStock > 0 && product.stock <= product.minStock ? (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Bajo</span>
                  ) : (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">OK</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                    className="p-1.5 hover:bg-blue-50 hover:text-primary rounded-lg text-slate-400"
                  >
                    <Edit size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}

        {filteredProducts.length === 0 && (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No se encontraron productos</h3>
            <p className="text-slate-500 mt-1">Intenta ajustar tus filtros</p>
          </div>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProduct}
      />
    </AppLayout>
  );
}
