"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TransactionModal } from "@/components/dashboard/TransactionModal";
import { useStore } from "@/store/useStore";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  MoreVertical,
  Plus,
  ArrowRight,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const initialStats = [
  {
    label: "Ingresos del mes",
    value: "$12,500.00",
    change: "+12.5%",
    isPositive: true,
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    label: "Gastos del mes",
    value: "$8,200.00",
    change: "+5.2%",
    isPositive: false,
    icon: TrendingDown,
    color: "text-rose-600",
    bg: "bg-rose-50"
  },
  {
    label: "Saldo en Bancos",
    value: "$45,000.00",
    change: "$2,400 hoy",
    isPositive: true,
    icon: Wallet,
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    label: "Cuentas por cobrar",
    value: "$3,400.00",
    change: "3 facturas vencidas",
    isPositive: false,
    icon: FileText,
    color: "text-amber-600",
    bg: "bg-amber-50"
  },
];

const initialActivity = [
  { id: 1, title: "Factura #1024", entity: "Tech Solutions S.A.S", amount: "$1,250.00", type: "Venta", time: "Hace 2 horas" },
  { id: 2, title: "Gasto #542", entity: "Amazon Web Services", amount: "$340.00", type: "Gasto", time: "Hace 5 horas" },
  { id: 3, title: "Factura #1023", entity: "Almacenes Éxito", amount: "$890.00", type: "Venta", time: "Hace 1 día" },
  { id: 4, title: "Transferencia", entity: "Bancolombia - Principal", amount: "$2,000.00", type: "Banco", time: "Hace 2 días" },
];

const chartData = [
  { name: "Lun", ingresos: 4000, gastos: 2400 },
  { name: "Mar", ingresos: 3000, gastos: 1398 },
  { name: "Mie", ingresos: 2000, gastos: 9800 },
  { name: "Jue", ingresos: 2780, gastos: 3908 },
  { name: "Vie", ingresos: 1890, gastos: 4800 },
  { name: "Sab", ingresos: 2390, gastos: 3800 },
  { name: "Dom", ingresos: 3490, gastos: 4300 },
];

import { useDashboardStats } from "@/hooks/useDatabase";

export default function Dashboard() {
  const { setTransactionModalOpen } = useStore();
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();

  const dashboardStats = [
    {
      label: "Ingresos (Ventas Pagadas)",
      value: stats ? `$${stats.totalSales.toLocaleString()}` : "$0.00",
      change: "+0% este mes", // Placeholder
      isPositive: true,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      label: "Gastos Pagados",
      value: stats ? `$${stats.totalExpenses.toLocaleString()}` : "$0.00",
      change: "+0% este mes",
      isPositive: false,
      icon: TrendingDown,
      color: "text-rose-600",
      bg: "bg-rose-50"
    },
    {
      label: "Margen Neto",
      value: stats ? `$${stats.netMargin.toLocaleString()}` : "$0.00",
      change: "Utilidad bruta",
      isPositive: (stats?.netMargin || 0) >= 0,
      icon: Wallet,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Cuentas por cobrar",
      value: stats ? `$${stats.pendingReceivables.toLocaleString()}` : "$0.00",
      change: "Facturas pendientes",
      isPositive: false,
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
  ];

  const handleDownloadReport = async () => {
    setIsLoadingReport(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert("Reporte generado con éxito. La descarga comenzará pronto.");
    setIsLoadingReport(false);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Resumen de Negocio</h1>
            <p className="text-slate-500 mt-1">Aquí está lo que sucede con tu empresa hoy, 17 de Febrero.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadReport}
              disabled={isLoadingReport}
              className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {isLoadingReport ? "Generando..." : "Descargar Reporte"}
            </button>
            <button
              onClick={() => setTransactionModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Nueva Transacción
            </button>
          </div>
        </div>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-border flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl transition-colors group-hover:bg-white border border-transparent group-hover:border-slate-100", stat.bg)}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <button className="text-slate-300 hover:text-slate-600">
                  <MoreVertical size={20} />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                  <span className={cn(
                    "text-xs font-bold px-1.5 py-0.5 rounded",
                    stat.isPositive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                  )}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Flujo de Caja</h3>
                <p className="text-xs text-slate-400 mt-1">Ingresos vs Gastos últimos 30 días</p>
              </div>
              <select className="text-sm border-border rounded-lg bg-slate-50 px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/20">
                <option>Últimos 7 días</option>
                <option>Últimos 30 días</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3d84f5" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3d84f5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="ingresos" stroke="#3d84f5" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" />
                  <Area type="monotone" dataKey="gastos" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorGastos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Actividad Reciente</h3>
              <button className="text-primary text-xs font-bold hover:underline">Ver todo</button>
            </div>
            <div className="space-y-6">
              {isLoadingStats ? (
                <div className="p-8 text-center text-slate-400 italic">Cargando actividad...</div>
              ) : stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center mr-4 shadow-sm",
                        activity.type === "Venta" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{activity.title}</p>
                        <p className="text-xs text-slate-400 font-medium">{activity.entity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-black",
                        activity.type === "Venta" ? "text-emerald-600" : "text-rose-600"
                      )}>{activity.amount}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black mt-1">
                        {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-slate-400 text-sm">No hay actividad reciente</p>
                </div>
              )}
            </div>
            <a href="/ventas/nueva" className="mt-8 pt-6 border-t border-border group active:opacity-70 cursor-pointer block">
              <div className="bg-primary/5 rounded-xl p-4 transition-colors group-hover:bg-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Acción rápida</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">Crear nueva factura</p>
                  </div>
                  <div className="bg-primary p-2 rounded-lg text-white">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
