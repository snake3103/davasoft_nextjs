"use client";

import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Save, X, Plus, Trash2, Search, Package, Loader2, ArrowLeft, User, FileText, Calendar, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCategories, useProducts, useCreateExpense, useClients } from "@/hooks/useDatabase";

import { ContactSearch, CategorySearch, ProductSearch } from "@/components/ui/Autocomplete";

export default function NuevaCompraPage() {
    const router = useRouter();
    const { data: categories = [] } = useCategories();
    const { data: products = [] } = useProducts();
    const { data: contacts = [] } = useClients();
    const createExpense = useCreateExpense();

    const providers = contacts.filter((c: any) => c.type === "PROVIDER" || c.type === "BOTH");

    const [formData, setFormData] = useState({
        number: `COMP-${Math.floor(Math.random() * 90000) + 10000}`,
        date: new Date().toISOString().split("T")[0],
        provider: "",
        categoryId: "",
        items: [{ productId: "", description: "", quantity: 1, price: 0, total: 0 }],
        status: "PAID",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!formData.provider) e.provider = "Proveedor requerido";
        if (!formData.categoryId) e.categoryId = "Categoría requerida";
        if (formData.items.some(i => !i.description)) e.items = "Todos los ítems deben tener descripción";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            const total = formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
            await createExpense.mutateAsync({
                ...formData,
                total,
                items: formData.items
            });
            router.push("/compras");
        } catch (err: any) {
            alert(err.message);
        }
    };

    const addItem = () => setFormData({ ...formData, items: [...formData.items, { productId: "", description: "", quantity: 1, price: 0, total: 0 }] });
    const removeItem = (index: number) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === "quantity" || field === "price") newItems[index].total = newItems[index].quantity * newItems[index].price;
        setFormData({ ...formData, items: newItems });
    };

    const total = formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ArrowLeft size={20} /></button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Nueva Factura de Compra</h1>
                            <p className="text-sm text-slate-500">Aumenta tu inventario registrando compras a proveedores.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={createExpense.isPending}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 flex items-center disabled:opacity-50"
                    >
                        {createExpense.isPending ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                        Guardar Compra
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Proveedor</label>
                                    <ContactSearch
                                        value={formData.provider}
                                        onSelect={(c: any) => setFormData({ ...formData, provider: c.name })}
                                        onChange={(val: string) => setFormData({ ...formData, provider: val })}
                                        contacts={providers}
                                        placeholder="Buscar o seleccionar proveedor..."
                                        error={!!errors.provider}
                                    />
                                    {errors.provider && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.provider}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Categoría de Gasto</label>
                                    <CategorySearch
                                        value={categories.find((c: any) => c.id === formData.categoryId)?.name || ""}
                                        onChange={(val: string) => {
                                            if (!val) setFormData({ ...formData, categoryId: "" });
                                        }}
                                        onSelect={(c: any) => setFormData({ ...formData, categoryId: c.id })}
                                        categories={categories.filter((c: any) => c.type === 'EXPENSE' || c.type === 'PRODUCT')}
                                        placeholder="Buscar categoría..."
                                        error={!!errors.categoryId}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Número de Factura</label>
                                    <input
                                        type="text"
                                        value={formData.number}
                                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                        className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Fecha</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50/50">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Productos Comprados</h3>
                                <button onClick={addItem} className="text-xs font-bold text-primary hover:underline flex items-center"><Plus size={14} className="mr-1" /> Agregar Item</button>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Producto / Descrip.</th>
                                        <th className="px-4 py-3 w-24 text-center">Cant.</th>
                                        <th className="px-4 py-3 w-32 text-center">Precio Compra</th>
                                        <th className="px-6 py-3 w-32 text-right">Total</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {formData.items.map((item, index) => (
                                        <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <ProductSearch
                                                    value={item.description}
                                                    products={products}
                                                    onChange={(val: any) => updateItem(index, "description", val)}
                                                    onSelect={(p: any) => {
                                                        const ni = [...formData.items];
                                                        ni[index] = { ...ni[index], description: p.name, productId: p.id, price: p.price, total: p.price * ni[index].quantity };
                                                        setFormData({ ...formData, items: ni });
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <input type="number" value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number(e.target.value))} className="w-full bg-transparent border border-border rounded py-1 px-2 text-center text-sm" />
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <input type="number" value={item.price} onChange={(e) => updateItem(index, "price", Number(e.target.value))} className="w-full bg-transparent border border-border rounded py-1 px-2 text-center text-sm" />
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-sm text-slate-700">${(item.quantity * item.price).toLocaleString()}</td>
                                            <td className="px-4 py-4"><button onClick={() => removeItem(index)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-6">Resumen de Compra</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-bold text-slate-700">${total.toLocaleString()}</span></div>
                                <div className="pt-4 border-t border-border flex justify-between items-center">
                                    <span className="text-base font-bold text-slate-800">Total</span>
                                    <span className="text-2xl font-black text-primary">${total.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="mt-8 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Estado de Pago</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm font-bold"
                                    >
                                        <option value="PAID">Pagado</option>
                                        <option value="PENDING">Pendiente / Por Pagar</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
