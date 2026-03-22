"use client";

import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Save, X, Plus, Trash2, Search, Package, Loader2, ArrowLeft, User, FileText, Calendar, Building2, Calculator, ChevronDown, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCategories, useProducts, useCreatePurchase, useClients, useTaxes } from "@/hooks/useDatabase";
import { useToast } from "@/components/ui/Toast";

import { ContactSearch, CategorySearch, ProductSearch } from "@/components/ui/Autocomplete";
import { Select } from "@/components/ui/Select";

export default function NuevaCompraPage() {
    const router = useRouter();
    const { data: categories = [] } = useCategories();
    const { data: products = [] } = useProducts();
    const { data: contacts = [] } = useClients();
    const { data: taxes = [] } = useTaxes();
    const createPurchase = useCreatePurchase();
    const { showToast } = useToast();

    const providers = contacts.filter((c: any) => c.type === "PROVIDER" || c.type === "BOTH");
    const activeTaxes = taxes.filter((t: any) => t.isActive);

    const [formData, setFormData] = useState({
        number: "",
        date: new Date().toISOString().split("T")[0],
        provider: "",
        categoryId: "",
        items: [{ productId: "", description: "", quantity: 1, price: 0, total: 0 }],
        status: "PAID",
        taxId: "",
        taxIncluded: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showTaxDropdown, setShowTaxDropdown] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Generar número de compra solo en cliente para evitar hydration mismatch
    useEffect(() => {
        if (!formData.number) {
            setFormData(prev => ({
                ...prev,
                number: `COMP-${Math.floor(Math.random() * 90000) + 10000}`
            }));
        }
    }, []);

    const selectedTax = taxes.find((t: any) => t.id === formData.taxId);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!formData.provider) e.provider = "Proveedor requerido";
        if (!formData.categoryId) e.categoryId = "Categoría requerida";
        if (formData.items.some(i => !i.description)) e.items = "Todos los ítems deben tener descripción";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        setErrorMessage(null);
        if (!validate()) return;
        try {
            const subtotalCalc = formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
            let taxAmountCalc = 0;
            
            if (selectedTax) {
                if (selectedTax.type === "PERCENTAGE") {
                    taxAmountCalc = subtotalCalc * (selectedTax.value / 100);
                } else {
                    taxAmountCalc = selectedTax.value;
                }
            }
            
            const totalCalc = subtotalCalc + taxAmountCalc;
            
            const result = await createPurchase.mutateAsync({
                ...formData,
                subtotal: subtotalCalc,
                taxName: selectedTax?.name || null,
                taxRate: selectedTax?.type === "PERCENTAGE" ? selectedTax.value : null,
                taxAmount: taxAmountCalc,
                total: totalCalc,
                items: formData.items
            });
            showToast("success", "Compra creada exitosamente!");
            setTimeout(() => router.push("/compras"), 1000);
        } catch (err: any) {
            console.error("Error creating purchase:", err);
            setErrorMessage(err.message || "Error al crear la compra");
            showToast("error", err.message || "Error al crear la compra");
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

    const subtotal = formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    
    const calculateTax = () => {
        if (!selectedTax) return 0;
        if (selectedTax.type === "PERCENTAGE") {
            return subtotal * (selectedTax.value / 100);
        }
        return selectedTax.value;
    };
    
    const taxAmount = calculateTax();
    const total = subtotal + taxAmount;

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
                        disabled={createPurchase.isPending}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 flex items-center disabled:opacity-50"
                    >
                        {createPurchase.isPending ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                        Guardar Compra
                    </button>
                </div>

                {/* Mensajes de éxito/error */}
                {successMessage && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center gap-3 animate-pulse">
                        <CheckCircle size={20} />
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-xl flex items-center gap-3">
                        <X size={20} />
                        {errorMessage}
                    </div>
                )}

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
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="font-bold text-slate-700">${subtotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
                                </div>
                                
                                {/* Selector de Impuesto */}
                                <div className="pt-4 border-t border-border">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Impuesto</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowTaxDropdown(!showTaxDropdown)}
                                            className="w-full flex items-center justify-between bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm"
                                        >
                                            <span className={selectedTax ? "text-slate-700 font-medium" : "text-slate-400"}>
                                                {selectedTax ? `${selectedTax.name} (${selectedTax.type === "PERCENTAGE" ? selectedTax.value + "%" : "$" + selectedTax.value})` : "Sin impuesto"}
                                            </span>
                                            <ChevronDown size={16} className="text-slate-400" />
                                        </button>
                                        {showTaxDropdown && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => { setFormData({ ...formData, taxId: "" }); setShowTaxDropdown(false); }}
                                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 border-b border-border"
                                                >
                                                    Sin impuesto
                                                </button>
                                                {activeTaxes.map((tax: any) => (
                                                    <button
                                                        key={tax.id}
                                                        type="button"
                                                        onClick={() => { setFormData({ ...formData, taxId: tax.id }); setShowTaxDropdown(false); }}
                                                        className={cn(
                                                            "w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex justify-between",
                                                            tax.id === formData.taxId && "bg-primary/5",
                                                            tax.id !== formData.taxId && "border-b border-border"
                                                        )}
                                                    >
                                                        <span>{tax.name}</span>
                                                        <span className="text-slate-400">
                                                            {tax.type === "PERCENTAGE" ? `${tax.value}%` : `$${tax.value}`}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {selectedTax && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-1">
                                            <Calculator size={14} />
                                            {selectedTax.name}
                                        </span>
                                        <span className="font-bold text-rose-600">${taxAmount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                
                                <div className="pt-4 border-t border-border flex justify-between items-center">
                                    <span className="text-base font-bold text-slate-800">Total</span>
                                    <span className="text-2xl font-black text-primary">${total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            <div className="mt-8 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Estado de Pago</label>
                                    <Select
                                        value={formData.status}
                                        onChange={(val) => setFormData({ ...formData, status: val })}
                                        options={[
                                            { value: "PAID", label: "Pagado", description: "La compra ya fue pagada" },
                                            { value: "PENDING", label: "Pendiente / Por Pagar", description: "La compra está pendiente de pago" },
                                        ]}
                                        placeholder="Seleccionar estado..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
