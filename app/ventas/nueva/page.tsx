"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
    Plus,
    Trash2,
    Save,
    X,
    UserPlus,
    ChevronDown,
    FileText,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceFormData } from "@/lib/schemas/invoice";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function NuevaFactura() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Fetch existing clients and products
    const { data: clients } = useQuery({ queryKey: ["clients"], queryFn: () => fetch("/api/clients").then(res => res.json()) });
    const { data: products } = useQuery({ queryKey: ["products"], queryFn: () => fetch("/api/products").then(res => res.json()) });

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            number: `FE-${Math.floor(Math.random() * 1000) + 1000}`,
            date: new Date().toISOString().split('T')[0],
            items: [{ productId: "", description: "", quantity: 1, price: 0, tax: 19, total: 0 }],
            subtotal: 0,
            tax: 0,
            total: 0,
            status: "DRAFT"
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const watchedItems = watch("items");

    // Recalculate totals whenever items change
    useEffect(() => {
        const subtotal = watchedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const tax = subtotal * 0.19; // Simplified 19% tax logic
        const total = subtotal + tax;

        setValue("subtotal", subtotal);
        setValue("tax", tax);
        setValue("total", total);

        // Update individual item totals
        watchedItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            if (item.total !== itemTotal) {
                setValue(`items.${index}.total`, itemTotal);
            }
        });
    }, [watchedItems, setValue]);

    const mutation = useMutation({
        mutationFn: async (data: InvoiceFormData) => {
            const res = await fetch("/api/invoices", {
                method: "POST",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Error al guardar la factura");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            router.push("/");
        }
    });

    const onSubmit = (data: InvoiceFormData) => {
        mutation.mutate(data);
    };

    const generatePDF = () => {
        setIsGeneratingPDF(true);
        const doc = new jsPDF() as any;
        const data = watch();
        const client = clients?.find((c: any) => c.id === data.clientId);

        // Header
        doc.setFontSize(20);
        doc.text("DAVASOFT - FACTURA DE VENTA", 105, 20, { align: "center" });

        doc.setFontSize(10);
        doc.text(`Número: ${data.number}`, 14, 40);
        doc.text(`Fecha: ${data.date}`, 14, 45);
        doc.text(`Cliente: ${client?.name || "Sin cliente"}`, 14, 55);
        doc.text(`NIT/CC: ${client?.idNumber || "N/A"}`, 14, 60);

        // Table
        const tableBody = data.items.map(item => [
            item.description,
            item.quantity,
            `$${item.price.toLocaleString()}`,
            "19%",
            `$${item.total.toLocaleString()}`
        ]);

        doc.autoTable({
            startY: 70,
            head: [['Descripción', 'Cant.', 'Precio Unit.', 'IVA', 'Total']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] } // Primary color
        });

        // Totals
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.text(`Subtotal: $${data.subtotal.toLocaleString()}`, 140, finalY);
        doc.text(`IVA (19%): $${data.tax.toLocaleString()}`, 140, finalY + 5);
        doc.setFont(undefined, 'bold');
        doc.text(`TOTAL: $${data.total.toLocaleString()}`, 140, finalY + 12);

        doc.save(`Factura_${data.number}.pdf`);
        setIsGeneratingPDF(false);
    };

    return (
        <AppLayout>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/"
                            className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200"
                        >
                            <X size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Nueva Factura de Venta</h1>
                            <p className="text-sm text-slate-500">Completa los datos para generar el documento.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={generatePDF}
                            disabled={isGeneratingPDF}
                            className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors flex items-center"
                        >
                            {isGeneratingPDF ? <Loader2 className="animate-spin mr-2" size={18} /> : <FileText size={18} className="mr-2" />}
                            Vista Previa / PDF
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
                            Guardar Factura
                        </button>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-8 space-y-8">
                        {/* Top Row: Client and Date */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-slate-700">Cliente</label>
                                <div className="relative">
                                    <select
                                        {...register("clientId")}
                                        className={`w-full bg-slate-50 border ${errors.clientId ? 'border-rose-300' : 'border-slate-100'} rounded-xl py-3 pl-4 pr-10 text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all`}
                                    >
                                        <option value="">Selecciona un cliente...</option>
                                        {clients?.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    {errors.clientId && <p className="text-xs text-rose-500 mt-1">{errors.clientId.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Fecha</label>
                                <input
                                    type="date"
                                    {...register("date")}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        {/* Middle Row: Numbers and Terms */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Número de Factura</label>
                                <input
                                    type="text"
                                    {...register("number")}
                                    className={`w-full bg-slate-50 border ${errors.number ? 'border-rose-300' : 'border-slate-100'} rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all`}
                                />
                                {errors.number && <p className="text-xs text-rose-500 mt-1">{errors.number.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Término de Pago</label>
                                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all">
                                    <option>De contado</option>
                                    <option>8 días</option>
                                    <option>15 días</option>
                                    <option>30 días</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Vencimiento</label>
                                <input
                                    type="date"
                                    {...register("dueDate")}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        {/* Items Grid */}
                        <div className="mt-10 overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-left">
                                        <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Ítem / Descripción</th>
                                        <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-24">Cantidad</th>
                                        <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-32">Precio</th>
                                        <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-32">Impuesto</th>
                                        <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-32 text-right">Total</th>
                                        <th className="pb-4 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {fields.map((field, index) => (
                                        <tr key={field.id} className="group">
                                            <td className="py-4 pr-4">
                                                <Controller
                                                    name={`items.${index}.productId`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <select
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                const prod = products?.find((p: any) => p.id === e.target.value);
                                                                if (prod) {
                                                                    setValue(`items.${index}.description`, prod.name);
                                                                    setValue(`items.${index}.price`, Number(prod.price));
                                                                }
                                                            }}
                                                            className="w-full bg-transparent p-2 text-sm outline-none focus:bg-slate-50 rounded-lg transition-colors"
                                                        >
                                                            <option value="">Selecciona producto...</option>
                                                            {products?.map((p: any) => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                />
                                            </td>
                                            <td className="py-4 pr-4">
                                                <input
                                                    type="number"
                                                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                    className="w-full bg-transparent p-2 text-sm outline-none focus:bg-slate-50 rounded-lg transition-colors text-right"
                                                />
                                            </td>
                                            <td className="py-4 pr-4">
                                                <input
                                                    type="number"
                                                    {...register(`items.${index}.price`, { valueAsNumber: true })}
                                                    className="w-full bg-transparent p-2 text-sm outline-none focus:bg-slate-50 rounded-lg transition-colors text-right"
                                                />
                                            </td>
                                            <td className="py-4 pr-4 text-sm text-slate-500 text-right">
                                                19% IVA
                                            </td>
                                            <td className="py-4 font-bold text-slate-800 text-right">
                                                ${watchedItems[index]?.total?.toLocaleString() || 0}
                                            </td>
                                            <td className="py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button
                                type="button"
                                onClick={() => append({ productId: "", description: "", quantity: 1, price: 0, tax: 19, total: 0 })}
                                className="mt-4 flex items-center text-primary font-bold text-sm hover:underline"
                            >
                                <Plus size={16} className="mr-1" />
                                Agregar otra línea
                            </button>
                        </div>

                        {/* Totals Section */}
                        <div className="mt-12 flex justify-end">
                            <div className="w-full max-w-xs space-y-4">
                                <div className="flex justify-between items-center text-sm text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-slate-700">${watch("subtotal").toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-slate-500">
                                    <span>Impuestos (19%)</span>
                                    <span className="font-medium text-slate-700">${watch("tax").toLocaleString()}</span>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-lg">
                                    <span className="font-bold text-slate-800">Total</span>
                                    <span className="font-black text-primary">${watch("total").toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
