"use client";

import { use, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Building2,
    Clock,
    DollarSign,
    FileText,
    MoreVertical,
    Edit,
    Activity,
    Calendar,
    CreditCard,
    Loader2,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useClient, useDeleteClient, useUpdateClient } from "@/hooks/useDatabase";
import { useRouter } from "next/navigation";

export default function ContactDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: contact, isLoading, error } = useClient(id);
    const deleteClient = useDeleteClient();
    const updateClient = useUpdateClient();

    if (isLoading) return <AppLayout><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-primary" size={40} /></div></AppLayout>;
    if (error || !contact) return <AppLayout><div className="p-8 text-center text-rose-500 font-bold">Error al cargar el contacto</div></AppLayout>;

    const handleDelete = async () => {
        if (confirm("¿Estás seguro de que deseas eliminar este contacto? Esta acción no se puede deshacer.")) {
            try {
                await deleteClient.mutateAsync(id);
                router.push("/contactos");
            } catch (err: any) {
                alert("Error al eliminar: " + err.message);
            }
        }
    };

    // Placeholder for real transaction logic
    const transactions: any[] = [];

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Back Button and Actions */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Volver a Contactos
                    </button>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleDelete}
                            className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                        <Link
                            href={`/contactos/${id}/editar`}
                            className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center"
                        >
                            <Edit size={16} className="mr-2" />
                            Editar
                        </Link>
                        <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20">
                            <FileText size={16} className="mr-2" />
                            Estado de Cuenta
                        </button>
                    </div>
                </div>

                {/* Profile Header Card */}
                <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden p-8">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="flex-1 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
                                    <Building2 size={40} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{contact.name}</h1>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full",
                                            contact.type === 'CLIENT' ? "bg-blue-50 text-blue-600" :
                                                contact.type === 'PROVIDER' ? "bg-amber-50 text-amber-600" :
                                                    "bg-purple-50 text-purple-600"
                                        )}>
                                            {contact.type === 'CLIENT' ? 'Cliente' : contact.type === 'PROVIDER' ? 'Proveedor' : 'Ambos'}
                                        </span>
                                    </div>
                                    <div className="flex items-center mt-1 space-x-2 text-slate-500">
                                        <span className="text-sm">NIT/Identificación: <span className="font-bold text-slate-700">{contact.idNumber || 'Sin registrar'}</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                                <div className="flex items-center text-sm text-slate-600">
                                    <Mail size={16} className="mr-3 text-slate-400" />
                                    {contact.email || 'Sin correo registrado'}
                                </div>
                                <div className="flex items-center text-sm text-slate-600">
                                    <Phone size={16} className="mr-3 text-slate-400" />
                                    {contact.phone || 'Sin teléfono registrado'}
                                </div>
                                <div className="flex items-center text-sm text-slate-600">
                                    <MapPin size={16} className="mr-3 text-slate-400" />
                                    {contact.address || 'Sin dirección registrada'}
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-72 bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Pendiente</p>
                                <p className="text-3xl font-black text-slate-800">$0.00</p>
                            </div>
                            <div className="pt-4 border-t border-slate-200">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold">Vencido</span>
                                    <span className="text-rose-600 font-bold">$0.00</span>
                                </div>
                                <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500 w-[0%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Activity} label="Ventas Totales" value="$0.00" color="bg-emerald-500" />
                    <StatCard icon={Calendar} label="Última Venta" value="N/A" color="bg-blue-500" />
                    <StatCard icon={Clock} label="Facturas Vencidas" value="0" color="bg-rose-500" />
                    <StatCard icon={CreditCard} label="Pago Promedio" value="N/A" color="bg-amber-500" />
                </div>

                {/* Transactions Section */}
                <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-border flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center">
                            <History className="mr-2 text-primary" size={20} />
                            Historial de Transacciones
                        </h2>
                    </div>
                    {transactions.length > 0 ? (
                        <Table headers={["ID", "Tipo", "Fecha", "Monto", "Estado", "Acción"]}>
                            {transactions.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-bold text-primary">{t.id}</TableCell>
                                    <TableCell>{t.type}</TableCell>
                                    <TableCell>{t.date}</TableCell>
                                    <TableCell className="font-bold">{t.amount}</TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                            t.status === "Pagada" || t.status === "Completado" || t.status === "Aceptada"
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-rose-50 text-rose-600"
                                        )}>
                                            {t.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <button className="text-slate-400 hover:text-primary transition-colors">
                                            <FileText size={16} />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </Table>
                    ) : (
                        <div className="p-12 text-center space-y-4">
                            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                                <History size={32} />
                            </div>
                            <p className="text-slate-400 text-sm font-medium italic">Este contacto no tiene transacciones registradas.</p>
                        </div>
                    )}
                </div>
            </div>

        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm flex items-center space-x-4">
            <div className={cn("p-3 rounded-2xl text-white", color)}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-xl font-black text-slate-800">{value}</p>
            </div>
        </div>
    );
}

function History(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
        </svg>
    )
}
