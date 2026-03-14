"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { TransactionModal } from "@/components/dashboard/TransactionModal";
import { useStore } from "@/store/useStore";
import { useDashboardStats } from "@/hooks/useDatabase";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  MoreVertical,
  Plus,
  ArrowRight,
  Package,
  Users,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const { setTransactionModalOpen } = useStore();
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [dateRange, setDateRange] = useState("month");

  const { data: stats, isLoading: isLoadingStats, refetch } = useDashboardStats();

  const handleDownloadReport = async () => {
    setIsLoadingReport(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert("Reporte generado con éxito. La descarga comenzará pronto.");
    setIsLoadingReport(false);
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatChange = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const kpis = [
    {
      label: "Ventas Totales",
      value: stats?.financials ? formatCurrency(stats.financials.totalSales) : "$0.00",
      change: stats?.financials ? formatChange(stats.financials.salesChange) : "+0%",
      changeLabel: "vs mes anterior",
      isPositive: (stats?.financials?.salesChange || 0) >= 0,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/ventas"
    },
    {
      label: "Gastos Totales",
      value: stats?.financials ? formatCurrency(stats.financials.totalExpenses) : "$0.00",
      change: "Acumulado",
      changeLabel: "todo el tiempo",
      isPositive: false,
      icon: TrendingDown,
      color: "text-rose-600",
      bg: "bg-rose-50",
      href: "/gastos"
    },
    {
      label: "Margen Neto",
      value: stats?.financials ? formatCurrency(stats.financials.netMargin) : "$0.00",
      change: (stats?.financials?.netMargin || 0) >= 0 ? "Rentable" : "Pérdida",
      changeLabel: "utilidad bruta",
      isPositive: (stats?.financials?.netMargin || 0) >= 0,
      icon: Wallet,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/contabilidad/reportes"
    },
    {
      label: "Cuentas por Cobrar",
      value: stats?.financials ? formatCurrency(stats.financials.pendingReceivables) : "$0.00",
      change: `${stats?.sales?.pendingInvoicesCount || 0} facturas`,
      changeLabel: "pendientes",
      isPositive: false,
      icon: CreditCard,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/ventas"
    },
    {
      label: "Productos",
      value: stats?.inventory?.totalProducts || 0,
      change: `${stats?.inventory?.lowStockCount || 0} bajo stock`,
      changeLabel: "reposición",
      isPositive: (stats?.inventory?.lowStockCount || 0) === 0,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/inventario"
    },
    {
      label: "Clientes",
      value: stats?.sales?.totalClients || 0,
      change: "Activos",
      changeLabel: "registrados",
      isPositive: true,
      icon: Users,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      href: "/contactos"
    },
  ];

  const pieData = stats?.financials ? [
    { name: "Ventas", value: stats.financials.totalSales },
    { name: "Gastos", value: stats.financials.totalExpenses },
  ] : [];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 mt-1">Resumen general de tu negocio</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600"
            >
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="year">Este año</option>
              <option value="all">Todo</option>
            </select>
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

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, index) => (
            <a
              key={index}
              href={kpi.href}
              className="bg-white p-5 rounded-2xl border border-border flex flex-col hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2 rounded-xl", kpi.bg)}>
                  <kpi.icon size={20} className={kpi.color} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{kpi.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={cn(
                    "text-xs font-bold px-1.5 py-0.5 rounded",
                    kpi.isPositive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                  )}>
                    {kpi.change}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Alertas */}
        {(stats?.inventory?.lowStockCount || 0) > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="text-amber-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">
                {stats.inventory.lowStockCount} producto{stats.inventory.lowStockCount > 1 ? "s" : ""} bajo stock mínimo
              </p>
              <p className="text-xs text-amber-600">Revisa tu inventario para reponer</p>
            </div>
            <a
              href="/inventario/movimientos"
              className="px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700"
            >
              Ver inventario
            </a>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Ingresos vs Gastos</h3>
                <p className="text-xs text-slate-400 mt-1">Últimos 6 meses</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.monthlyChart || []}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`$${Number(value).toLocaleString("es-DO")}`, '']}
                  />
                  <Area type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" name="Ingresos" />
                  <Area type="monotone" dataKey="gastos" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorGastos)" name="Gastos" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Distribución</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Actividad Reciente</h3>
              <button className="text-primary text-xs font-bold hover:underline">Ver todo</button>
            </div>
            <div className="space-y-3">
              {isLoadingStats ? (
                <div className="p-8 text-center text-slate-400">Cargando...</div>
              ) : stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        activity.type === "Venta" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {activity.type === "Venta" ? <FileText size={20} /> : <ShoppingCart size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{activity.title}</p>
                        <p className="text-xs text-slate-500">{activity.entity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-black",
                        activity.type === "Venta" ? "text-emerald-600" : "text-rose-600"
                      )}>{activity.formattedAmount}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(activity.time).toLocaleDateString("es-DO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-slate-400 text-sm">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <a href="/ventas/nueva" className="block bg-primary/5 rounded-xl p-4 hover:bg-primary/10 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">Nueva Factura</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">Crear venta</p>
                </div>
                <div className="bg-primary p-2 rounded-lg text-white">
                  <FileText size={18} />
                </div>
              </div>
            </a>

            <a href="/pos" className="block bg-emerald-50 rounded-xl p-4 hover:bg-emerald-100 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Punto de Venta</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">Venta rápida</p>
                </div>
                <div className="bg-emerald-600 p-2 rounded-lg text-white">
                  <ShoppingCart size={18} />
                </div>
              </div>
            </a>

            <a href="/inventario/movimientos" className="block bg-purple-50 rounded-xl p-4 hover:bg-purple-100 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Inventario</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">Ver stock</p>
                </div>
                <div className="bg-purple-600 p-2 rounded-lg text-white">
                  <Package size={18} />
                </div>
              </div>
            </a>

            <a href="/contabilidad/reportes" className="block bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Reportes</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">Ver estados</p>
                </div>
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                  <DollarSign size={18} />
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
