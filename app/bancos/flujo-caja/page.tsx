"use client";

import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  DollarSign,
  Clock,
  ChevronRight,
  FileText,
  ArrowRight
} from "lucide-react";
import { cn, formatMoney, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  getProjectedCashFlow,
  getCashFlowAccounts,
  CashFlowProjection,
  CashFlowItem
} from "@/app/actions/cash-flow";

// ============================================
// Types locales
// ============================================

interface CashFlowAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

// ============================================
// Componentes UI
// ============================================

function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default"
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  variant?: "default" | "success" | "danger";
}) {
  const colors = {
    default: "border-border bg-white",
    success: "border-emerald-200 bg-emerald-50",
    danger: "border-rose-200 bg-rose-50"
  };

  const iconColors = {
    default: "text-primary bg-primary/10",
    success: "text-emerald-600 bg-emerald-100",
    danger: "text-rose-600 bg-rose-100"
  };

  return (
    <div className={cn("rounded-2xl border p-6 shadow-sm", colors[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
          <p className={cn("text-2xl font-black", variant === "success" ? "text-emerald-600" : variant === "danger" ? "text-rose-600" : "text-slate-800")}>
            {value}
          </p>
        </div>
        <div className={cn("p-3 rounded-xl", iconColors[variant])}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function AlertBanner({ alerts }: { alerts: CashFlowProjection["alerts"] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl",
            alert.type === "CRITICAL" ? "bg-rose-50 border border-rose-200 text-rose-700" :
            alert.type === "WARNING" ? "bg-amber-50 border border-amber-200 text-amber-700" :
            "bg-blue-50 border border-blue-200 text-blue-700"
          )}
        >
          <AlertTriangle size={18} />
          <p className="text-sm font-medium">{alert.message}</p>
        </div>
      ))}
    </div>
  );
}

function CashFlowItemRow({
  item,
  type
}: {
  item: CashFlowItem;
  type: "inflow" | "outflow";
}) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "short"
    });
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-xl border transition-colors hover:bg-slate-50",
      item.isOverdue ? "border-rose-200 bg-rose-50/50" : "border-border"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          type === "inflow" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
        )}>
          {type === "inflow" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
        </div>
        <div>
          <p className="font-medium text-slate-800">{item.documentNumber}</p>
          <p className="text-sm text-slate-500">
            {item.client && <span className="mr-2">{item.client}</span>}
            {item.description}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn(
          "font-bold",
          type === "inflow" ? "text-emerald-600" : "text-rose-600"
        )}>
          {type === "outflow" && "-"}{formatCurrency(item.amount)}
        </p>
        <div className="flex items-center justify-end gap-2 mt-1">
          {item.isOverdue && (
            <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
              VENCIDO
            </span>
          )}
          <span className="text-xs text-slate-400">
            {formatDate(item.dueDate)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Página Principal
// ============================================

export default function FlujoCajaPage() {
  const [accounts, setAccounts] = useState<CashFlowAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [cashFlow, setCashFlow] = useState<CashFlowProjection | null>(null);
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInflows, setShowInflows] = useState(true);
  const [showOutflows, setShowOutflows] = useState(true);

  // Cargar cuentas
  useEffect(() => {
    getCashFlowAccounts("demo-org").then(setAccounts).catch(console.error);
  }, []);

  // Calcular fechas según período
  const getDateRange = (p: string) => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    switch (p) {
      case "week":
        end.setDate(end.getDate() + 7);
        break;
      case "month":
        end.setMonth(end.getMonth() + 1);
        break;
      case "quarter":
        end.setMonth(end.getMonth() + 3);
        break;
    }

    return { start, end };
  };

  // Cargar flujo de caja
  const loadCashFlow = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    setError(null);

    try {
      const { start, end } = getDateRange(period);
      const data = await getProjectedCashFlow(selectedAccount, start, end);
      setCashFlow(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAccount) {
      loadCashFlow();
    }
  }, [selectedAccount, period]);

  const handleAccountChange = (id: string) => {
    setSelectedAccount(id);
    const account = accounts.find(a => a.id === id);
    if (account) {
      // Crear datos mock para demo
      setCashFlow({
        accountId: account.id,
        accountName: account.name,
        currency: account.currency,
        currentBalance: account.balance,
        projectedInflows: [
          { id: "1", type: "INVOICE", documentNumber: "FAC-001", client: "Cliente A", description: "Servicios profesionales", dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), amount: 15000, daysUntilDue: 2, status: "PENDING", isOverdue: false },
          { id: "2", type: "INVOICE", documentNumber: "FAC-002", client: "Cliente B", description: "Consultoría", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), amount: 8500, daysUntilDue: 5, status: "PENDING", isOverdue: false },
          { id: "3", type: "INVOICE", documentNumber: "FAC-003", client: "Cliente C", description: "Mantenimiento", dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), amount: 12000, daysUntilDue: 10, status: "PENDING", isOverdue: false },
        ],
        projectedOutflows: [
          { id: "4", type: "EXPENSE", documentNumber: "G-001", description: "Pago proveedores", dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), amount: 5500, daysUntilDue: 3, status: "PENDING", isOverdue: false },
          { id: "5", type: "EXPENSE", documentNumber: "G-002", description: "Servicios básicos", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), amount: 2800, daysUntilDue: 7, status: "PENDING", isOverdue: false },
          { id: "6", type: "PAYMENT", documentNumber: "Nómina", description: "Pago empleados", dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), amount: 25000, daysUntilDue: 15, status: "PENDING", isOverdue: false },
        ],
        projectedBalance: account.balance + 10000 - 33300,
        summary: {
          totalInflows: 35700,
          totalOutflows: 33300,
          netFlow: 2400,
          daysInPeriod: 30,
          averageDailyInflow: 1190,
          averageDailyOutflow: 1110,
        },
        alerts: [
          { type: "INFO", message: "3 facturas pendientes por cobrar", affectedItems: [] },
          { type: "WARNING", message: "Pago de nómina en 15 días", affectedItems: [] },
        ],
      });
    }
  };

  // Seleccionar primera cuenta automáticamente
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      handleAccountChange(accounts[0].id);
    }
  }, [accounts]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "short"
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <Wallet className="mr-3 text-primary" size={24} />
              Flujo de Caja
            </h1>
            <p className="text-slate-500 mt-1">Proyección de ingresos y egresos futuros.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={loadCashFlow} disabled={loading || !selectedAccount}>
              <RefreshCw size={16} className={cn(loading && "animate-spin", "mr-2")} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-auto">
            <select
              value={selectedAccount}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full sm:w-64 bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm"
            >
              <option value="">Seleccionar cuenta...</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - {formatCurrency(account.balance)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={period === "week" ? "primary" : "outline"}
              onClick={() => setPeriod("week")}
            >
              Semana
            </Button>
            <Button
              size="sm"
              variant={period === "month" ? "primary" : "outline"}
              onClick={() => setPeriod("month")}
            >
              Mes
            </Button>
            <Button
              size="sm"
              variant={period === "quarter" ? "primary" : "outline"}
              onClick={() => setPeriod("quarter")}
            >
              Trimestre
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <RefreshCw size={32} className="animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <p className="text-rose-600 font-medium">{error}</p>
            <Button variant="outline" className="mt-4" onClick={loadCashFlow}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Contenido Principal */}
        {!loading && !error && cashFlow && (
          <>
            {/* Alerts */}
            <AlertBanner alerts={cashFlow.alerts} />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Saldo Actual"
                value={formatCurrency(cashFlow.currentBalance)}
                icon={Wallet}
              />
              <StatCard
                title="Ingresos Proyectados"
                value={formatCurrency(cashFlow.summary.totalInflows)}
                icon={TrendingUp}
                variant="success"
              />
              <StatCard
                title="Egresos Proyectados"
                value={formatCurrency(cashFlow.summary.totalOutflows)}
                icon={TrendingDown}
                variant="danger"
              />
              <StatCard
                title="Proyección Final"
                value={formatCurrency(cashFlow.projectedBalance)}
                icon={DollarSign}
                variant={cashFlow.projectedBalance >= 0 ? "success" : "danger"}
              />
            </div>

            {/* Resumen del Período */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                Resumen del Período ({period === "week" ? "7 días" : period === "month" ? "30 días" : "90 días"})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Ingreso Diario Prom.</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(cashFlow.summary.averageDailyInflow)}
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Egreso Diario Prom.</p>
                  <p className="text-lg font-bold text-rose-600">
                    {formatCurrency(cashFlow.summary.averageDailyOutflow)}
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Flujo Neto</p>
                  <p className={cn(
                    "text-lg font-bold",
                    cashFlow.summary.netFlow >= 0 ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {cashFlow.summary.netFlow >= 0 ? "+" : ""}{formatCurrency(cashFlow.summary.netFlow)}
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Días Restantes</p>
                  <p className="text-lg font-bold text-slate-800">
                    {cashFlow.summary.daysInPeriod}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalle de Transacciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ingresos */}
              <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <div 
                  className="px-6 py-4 bg-slate-50 border-b border-border flex items-center justify-between cursor-pointer"
                  onClick={() => setShowInflows(!showInflows)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                      <TrendingUp size={18} />
                    </div>
                    <h2 className="text-sm font-bold text-slate-700">
                      Ingresos Esperados
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-emerald-600">
                      {formatCurrency(cashFlow.summary.totalInflows)}
                    </span>
                    <ChevronRight size={18} className={cn("text-slate-400 transition-transform", showInflows && "rotate-90")} />
                  </div>
                </div>
                {showInflows && (
                  <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                    {cashFlow.projectedInflows.length === 0 ? (
                      <p className="text-center text-slate-400 py-8">No hay ingresos proyectados</p>
                    ) : (
                      cashFlow.projectedInflows.map(item => (
                        <CashFlowItemRow key={item.id} item={item} type="inflow" />
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Egresos */}
              <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <div 
                  className="px-6 py-4 bg-slate-50 border-b border-border flex items-center justify-between cursor-pointer"
                  onClick={() => setShowOutflows(!showOutflows)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                      <TrendingDown size={18} />
                    </div>
                    <h2 className="text-sm font-bold text-slate-700">
                      Egresos Esperados
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-rose-600">
                      {formatCurrency(cashFlow.summary.totalOutflows)}
                    </span>
                    <ChevronRight size={18} className={cn("text-slate-400 transition-transform", showOutflows && "rotate-90")} />
                  </div>
                </div>
                {showOutflows && (
                  <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                    {cashFlow.projectedOutflows.length === 0 ? (
                      <p className="text-center text-slate-400 py-8">No hay egresos proyectados</p>
                    ) : (
                      cashFlow.projectedOutflows.map(item => (
                        <CashFlowItemRow key={item.id} item={item} type="outflow" />
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && !cashFlow && (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-20 text-center">
            <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
              <Wallet size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Selecciona una cuenta</h3>
            <p className="text-slate-500 mt-2">Elige una cuenta bancaria para ver su flujo de caja proyectado.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
