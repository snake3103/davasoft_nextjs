"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calculator,
  Loader2,
  BarChart3,
  Calendar,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface TrialBalanceAccount {
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
  balance: number;
}

interface BalanceSheetSection {
  code: string;
  name: string;
  balance: number;
}

interface IncomeStatementItem {
  code: string;
  name: string;
  amount: number;
}

const navItems = [
  { href: "/contabilidad/asientos", label: "Asientos", icon: FileText },
  { href: "/contabilidad/plan-cuentas", label: "Plan de Cuentas", icon: Calculator },
  { href: "/contabilidad/reportes", label: "Reportes", icon: BarChart3 },
];

const getTypeBadge = (type: string) => {
  switch (type) {
    case "ASSET":
      return <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-600">Activo</span>;
    case "LIABILITY":
      return <span className="text-xs font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-600">Pasivo</span>;
    case "EQUITY":
      return <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-600">Patrimonio</span>;
    case "REVENUE":
      return <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">Ingreso</span>;
    case "EXPENSE":
      return <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-600">Gasto</span>;
    default:
      return null;
  }
};

export default function ReportesPage() {
  const [activeReport, setActiveReport] = useState<"trial" | "balance" | "income">("trial");
  const [dateRange, setDateRange] = useState<"all" | "today" | "month" | "year" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [incomeStatement, setIncomeStatement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const getDateParams = () => {
    const now = new Date();
    let start: string | undefined;
    let end: string | undefined;

    switch (dateRange) {
      case "today":
        start = now.toISOString().split("T")[0];
        end = now.toISOString().split("T")[0];
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        end = now.toISOString().split("T")[0];
        break;
      case "year":
        start = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
        end = now.toISOString().split("T")[0];
        break;
      case "custom":
        start = startDate;
        end = endDate;
        break;
    }

    return { startDate: start, endDate: end };
  };

  const fetchReports = async () => {
    setIsLoading(true);
    const { startDate: start, endDate: end } = getDateParams();
    const params = new URLSearchParams();
    if (start) params.set("startDate", start);
    if (end) params.set("endDate", end);

    try {
      const [trialRes, balanceRes, incomeRes] = await Promise.all([
        fetch(`/api/accounting/reports/trial-balance${params.toString() ? "?" + params : ""}`),
        fetch(`/api/accounting/reports/balance-sheet${params.toString() ? "?" + params : ""}`),
        fetch(`/api/accounting/reports/income-statement${params.toString() ? "?" + params : ""}`),
      ]);

      if (trialRes.ok) setTrialBalance(await trialRes.json());
      if (balanceRes.ok) setBalanceSheet(await balanceRes.json());
      if (incomeRes.ok) setIncomeStatement(await incomeRes.json());
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange, startDate, endDate]);

  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  return (
    <AppLayout>
      <div className="max-w-7xl">
        <div className="mb-6">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Reportes Contables</h1>
            <p className="text-slate-500 mt-1">
              Consulta estados financieros y balance de prueba
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-border rounded-lg p-1">
              {[
                { id: "trial", label: "Balance de Prueba" },
                { id: "balance", label: "Balance General" },
                { id: "income", label: "Estado Resultados" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveReport(tab.id as any)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    activeReport === tab.id
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="appearance-none pl-9 pr-8 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
              >
                <option value="all">Todo el tiempo</option>
                <option value="today">Hoy</option>
                <option value="month">Este mes</option>
                <option value="year">Este año</option>
                <option value="custom">Personalizado</option>
              </select>
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {dateRange === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {activeReport === "trial" && trialBalance && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <p className="text-xs font-medium text-emerald-600 uppercase">Total Débitos</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">
                      {formatCurrency(trialBalance.totalDebit)}
                    </p>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                    <p className="text-xs font-medium text-rose-600 uppercase">Total Créditos</p>
                    <p className="text-2xl font-bold text-rose-700 mt-1">
                      {formatCurrency(trialBalance.totalCredit)}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase px-4 py-3">Código</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase px-4 py-3">Cuenta</th>
                          <th className="text-center text-xs font-bold text-slate-500 uppercase px-4 py-3">Tipo</th>
                          <th className="text-right text-xs font-bold text-slate-500 uppercase px-4 py-3">Débito</th>
                          <th className="text-right text-xs font-bold text-slate-500 uppercase px-4 py-3">Crédito</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {trialBalance.accounts?.map((account: TrialBalanceAccount) => (
                          <tr key={account.code} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-mono font-bold text-slate-600">{account.code}</td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-800">{account.name}</td>
                            <td className="px-4 py-3 text-center">{getTypeBadge(account.type)}</td>
                            <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                              {account.debit > 0 ? formatCurrency(account.debit) : "-"}
                            </td>
                            <td className="px-4 py-3 text-right text-rose-600 font-medium">
                              {account.credit > 0 ? formatCurrency(account.credit) : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-100 border-t-2 border-slate-200">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 font-bold text-slate-700">TOTALES</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatCurrency(trialBalance.totalDebit)}</td>
                          <td className="px-4 py-3 text-right font-bold text-rose-700">{formatCurrency(trialBalance.totalCredit)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeReport === "balance" && balanceSheet && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-medium text-blue-600 uppercase">Total Activos</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(balanceSheet.totals?.assets)}</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                    <p className="text-xs font-medium text-rose-600 uppercase">Total Pasivos</p>
                    <p className="text-2xl font-bold text-rose-700 mt-1">{formatCurrency(balanceSheet.totals?.liabilities)}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                    <p className="text-xs font-medium text-purple-600 uppercase">Patrimonio</p>
                    <p className="text-2xl font-bold text-purple-700 mt-1">{formatCurrency(balanceSheet.totals?.equity)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 bg-blue-50 border-b border-blue-100">
                      <h3 className="font-bold text-blue-800">ACTIVOS</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {balanceSheet.assets?.map((item: BalanceSheetSection) => (
                        <div key={item.code} className="flex justify-between px-4 py-3">
                          <span className="text-sm font-medium text-slate-700">{item.name}</span>
                          <span className="text-sm font-bold text-blue-700">{formatCurrency(item.balance)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between px-4 py-3 bg-blue-50">
                        <span className="font-bold text-blue-800">TOTAL ACTIVOS</span>
                        <span className="font-bold text-blue-800">{formatCurrency(balanceSheet.totals?.assets)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-border overflow-hidden">
                      <div className="p-4 bg-rose-50 border-b border-rose-100">
                        <h3 className="font-bold text-rose-800">PASIVOS</h3>
                      </div>
                      <div className="divide-y divide-border">
                        {balanceSheet.liabilities?.map((item: BalanceSheetSection) => (
                          <div key={item.code} className="flex justify-between px-4 py-3">
                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                            <span className="text-sm font-bold text-rose-700">{formatCurrency(item.balance)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between px-4 py-3 bg-rose-50">
                          <span className="font-bold text-rose-800">TOTAL PASIVOS</span>
                          <span className="font-bold text-rose-800">{formatCurrency(balanceSheet.totals?.liabilities)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-border overflow-hidden">
                      <div className="p-4 bg-purple-50 border-b border-purple-100">
                        <h3 className="font-bold text-purple-800">PATRIMONIO</h3>
                      </div>
                      <div className="divide-y divide-border">
                        {balanceSheet.equity?.map((item: BalanceSheetSection) => (
                          <div key={item.code} className="flex justify-between px-4 py-3">
                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                            <span className="text-sm font-bold text-purple-700">{formatCurrency(item.balance)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between px-4 py-3 bg-purple-50">
                          <span className="font-bold text-purple-800">TOTAL PATRIMONIO</span>
                          <span className="font-bold text-purple-800">{formatCurrency(balanceSheet.totals?.equity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeReport === "income" && incomeStatement && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <p className="text-xs font-medium text-emerald-600 uppercase">Ingresos</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(incomeStatement.summary?.totalRevenue)}</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                    <p className="text-xs font-medium text-rose-600 uppercase">Gastos</p>
                    <p className="text-2xl font-bold text-rose-700 mt-1">{formatCurrency(incomeStatement.summary?.totalExpenses)}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs font-medium text-amber-600 uppercase">Utilidad Bruta</p>
                    <p className="text-2xl font-bold text-amber-700 mt-1">{formatCurrency(incomeStatement.summary?.grossProfit)}</p>
                  </div>
                  <div className={cn(
                    "border rounded-xl p-4",
                    incomeStatement.summary?.isProfitable 
                      ? "bg-green-50 border-green-100" 
                      : "bg-red-50 border-red-100"
                  )}>
                    <p className="text-xs font-medium uppercase" style={{ color: incomeStatement.summary?.isProfitable ? "#15803d" : "#be123c" }}>
                      Utilidad Neta
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: incomeStatement.summary?.isProfitable ? "#166534" : "#9f1239" }}>
                      {formatCurrency(incomeStatement.summary?.netProfit)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 bg-emerald-50 border-b border-emerald-100">
                      <h3 className="font-bold text-emerald-800">INGRESOS</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {incomeStatement.revenues?.map((item: IncomeStatementItem) => (
                        <div key={item.code} className="flex justify-between px-4 py-3">
                          <span className="text-sm font-medium text-slate-700">{item.name}</span>
                          <span className="text-sm font-bold text-emerald-700">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between px-4 py-3 bg-emerald-50">
                        <span className="font-bold text-emerald-800">TOTAL INGRESOS</span>
                        <span className="font-bold text-emerald-800">{formatCurrency(incomeStatement.summary?.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 bg-rose-50 border-b border-rose-100">
                      <h3 className="font-bold text-rose-800">GASTOS</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {incomeStatement.expenses?.map((item: IncomeStatementItem) => (
                        <div key={item.code} className="flex justify-between px-4 py-3">
                          <span className="text-sm font-medium text-slate-700">{item.name}</span>
                          <span className="text-sm font-bold text-rose-700">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between px-4 py-3 bg-rose-50">
                        <span className="font-bold text-rose-800">TOTAL GASTOS</span>
                        <span className="font-bold text-rose-800">{formatCurrency(incomeStatement.summary?.totalExpenses)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
