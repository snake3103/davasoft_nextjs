"use client";

import { use } from "react";
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
    CreditCard
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const contactData = {
    id: "1",
    name: "Tech Solutions S.A.S",
    type: "Cliente",
    nit: "900.123.456-7",
    email: "contacto@techsolutions.com",
    phone: "+57 300 123 4567",
    address: "Calle 100 #15-30, Bogotá",
    balance: "$12,450.00",
    overdue: "$2,300.00",
    totalSales: "$45,600.00",
    lastSale: "15 Feb 2026",
    status: "Activo"
};

const transactions = [
    { id: "FAC-124", type: "Factura", date: "15 Feb 2026", amount: "$3,400.00", status: "Pagada" },
    { id: "COT-101", type: "Cotización", date: "12 Feb 2026", amount: "$1,250.00", status: "Aceptada" },
    { id: "FAC-118", type: "Factura", date: "01 Feb 2026", amount: "$2,300.00", status: "Vencida" },
    { id: "PAG-089", type: "Pago", date: "28 Jan 2026", amount: "$1,500.00", status: "Completado" },
];

export default function ContactDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Back Button and Actions */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/contactos"
                        className="flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Volver a Contactos
                    </Link>
                    <div className="flex items-center space-x-3">
                        <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                            <MoreVertical size={20} />
                        </button>
                        <button className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center">
                            <Edit size={16} className="mr-2" />
                            Editar
                        </button>
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
                                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">{contactData.name}</h1>
                                    <div className="flex items-center mt-1 space-x-2 text-slate-500">
                                        <span className="text-sm font-bold bg-slate-100 px-3 py-1 rounded-full">{contactData.type}</span>
                                        <span className="text-sm border-l border-slate-300 pl-2">NIT: {contactData.nit}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                                <div className="flex items-center text-sm text-slate-600">
                                    <Mail size={16} className="mr-3 text-slate-400" />
                                    {contactData.email}
                                </div>
                                <div className="flex items-center text-sm text-slate-600">
                                    <Phone size={16} className="mr-3 text-slate-400" />
                                    {contactData.phone}
                                </div>
                                <div className="flex items-center text-sm text-slate-600">
                                    <MapPin size={16} className="mr-3 text-slate-400" />
                                    {contactData.address}
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-72 bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Pendiente</p>
                                <p className="text-3xl font-black text-slate-800">{contactData.balance}</p>
                            </div>
                            <div className="pt-4 border-t border-slate-200">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold">Vencido</span>
                                    <span className="text-rose-600 font-bold">{contactData.overdue}</span>
                                </div>
                                <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500 w-[18%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Activity} label="Ventas Totales" value={contactData.totalSales} color="bg-emerald-500" />
                    <StatCard icon={Calendar} label="Última Venta" value={contactData.lastSale} color="bg-blue-500" />
                    <StatCard icon={Clock} label="Facturas Vencidas" value="2" color="bg-rose-500" />
                    <StatCard icon={CreditCard} label="Pago Promedio" value="12 días" color="bg-amber-500" />
                </div>

                {/* Transactions Section */}
                <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-border flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center">
                            <History className="mr-2 text-primary" size={20} />
                            Historial de Transacciones
                        </h2>
                        <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filtrar por:</span>
                            <select className="bg-slate-50 border-none text-xs font-bold text-slate-600 rounded-lg py-1 px-2 focus:ring-0">
                                <option>Todos</option>
                                <option>Facturas</option>
                                <option>Pagos</option>
                                <option>Cotizaciones</option>
                            </select>
                        </div>
                    </div>
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
                    <div className="px-8 py-4 bg-slate-50 border-t border-border text-center">
                        <button className="text-xs font-bold text-primary hover:underline">
                            Ver todas las transacciones
                        </button>
                    </div>
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
