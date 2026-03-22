"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Plus,
  Search,
  MoreVertical,
  ArrowUpRight,
  Building2,
  X,
  Edit,
  Trash,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  Calendar,
  Download,
  Filter,
  Banknote,
  Link as LinkIcon,
  Unlink,
  FileSpreadsheet
} from "lucide-react";
import { cn, formatMoney, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { getBankReconciliations, createBankReconciliation, BankReconciliationWithStats } from "@/app/actions/bank-reconciliation";
import { getBankAccounts } from "@/app/actions/bank-accounts";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";

// ============================================
// Modal de Reporte de Conciliación
// ============================================
function ReportModal({
  isOpen,
  onClose,
  reconciliations,
}: {
  isOpen: boolean;
  onClose: () => void;
  reconciliations: BankReconciliationWithStats[];
}) {
  const [bankFilter, setBankFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const filteredRecons = useMemo(() => {
    return reconciliations.filter((r) => {
      const matchesBank = bankFilter === "all" || r.bankAccountId === bankFilter;
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesDate =
        (!dateFrom || new Date(r.date) >= new Date(dateFrom)) &&
        (!dateTo || new Date(r.date) <= new Date(dateTo));
      return matchesBank && matchesStatus && matchesDate;
    });
  }, [reconciliations, bankFilter, statusFilter, dateFrom, dateTo]);

  const totals = useMemo(() => {
    return {
      total: filteredRecons.length,
      completed: filteredRecons.filter((r) => r.status === "COMPLETED").length,
      matched: filteredRecons.filter((r) => r.difference === 0).length,
      unmatched: filteredRecons.filter((r) => r.difference !== 0).length,
      totalDifference: filteredRecons.reduce((sum, r) => sum + Number(r.difference), 0),
    };
  }, [filteredRecons]);

  const handleDownloadReport = () => {
    alert("Generando reporte de conciliación...");
    // Aquí se implementaría la generación del reporte PDF/Excel
  };

  const uniqueBanks = useMemo(() => {
    const banks = new Set(reconciliations.map((r) => r.bankAccountId));
    return Array.from(banks);
  }, [reconciliations]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-primary" />
            Reporte de Conciliación Bancaria
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros del reporte */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Banco</label>
              <select
                value={bankFilter}
                onChange={(e) => setBankFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm"
              >
                <option value="all">Todos</option>
                {uniqueBanks.map((bankId) => {
                  const recon = reconciliations.find((r) => r.bankAccountId === bankId);
                  return (
                    <option key={bankId} value={bankId}>
                      {recon?.bankAccount.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm"
              >
                <option value="all">Todos</option>
                <option value="DRAFT">Borrador</option>
                <option value="IN_PROGRESS">En Progreso</option>
                <option value="COMPLETED">Completada</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm"
              />
            </div>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-5 gap-3">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</p>
              <p className="text-2xl font-black text-slate-800">{totals.total}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Conciliadas</p>
              <p className="text-2xl font-black text-emerald-600">{totals.completed}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Coincidentes</p>
              <p className="text-2xl font-black text-blue-600">{totals.matched}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Sin Conciliar</p>
              <p className="text-2xl font-black text-amber-600">{totals.unmatched}</p>
            </div>
            <div className={cn(
              "rounded-xl p-4 text-center",
              totals.totalDifference === 0 ? "bg-emerald-50" : "bg-rose-50"
            )}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Diferencia</p>
              <p className={cn(
                "text-2xl font-black",
                totals.totalDifference === 0 ? "text-emerald-600" : "text-rose-600"
              )}>
                {formatCurrency(totals.totalDifference)}
              </p>
            </div>
          </div>

          {/* Tabla del reporte */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Cuenta</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Saldo Banco</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Saldo Libros</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Diferencia</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Matching</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecons.map((recon) => (
                    <tr key={recon.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-800">{recon.bankAccount.name}</p>
                        <p className="text-xs text-slate-400">{recon.bankAccount.bankName}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(recon.date).toLocaleDateString("es-DO")}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatCurrency(recon.statementTotal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatCurrency(recon.systemTotal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold">
                        <span className={cn(
                          recon.difference === 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {formatCurrency(recon.difference)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={recon.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {recon.difference === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                            <LinkIcon size={12} />
                            Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
                            <Unlink size={12} />
                            Sin Match
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handleDownloadReport}>
            <Download size={16} />
            Descargar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Modal de Nueva Conciliación
// ============================================

function NewReconciliationModal({
  isOpen,
  onClose,
  onCreated
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (reconciliation: BankReconciliationWithStats) => void;
}) {
  const [formData, setFormData] = useState({
    bankAccountId: "",
    date: new Date().toISOString().split("T")[0],
    initialBalance: 0,
    finalBalance: 0,
    statementTotal: 0
  });
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getBankAccounts().then(setBankAccounts).catch(console.error);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const reconciliation = await createBankReconciliation({
        bankAccountId: formData.bankAccountId,
        date: new Date(formData.date),
        initialBalance: formData.initialBalance,
        finalBalance: formData.finalBalance,
        statementTotal: formData.statementTotal
      });
      onCreated(reconciliation);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            Nueva Conciliación
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1">Cuenta Bancaria</label>
            <select
              value={formData.bankAccountId}
              onChange={(e) => setFormData({ ...formData, bankAccountId: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="">Seleccionar cuenta...</option>
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - {account.bankName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1">Fecha de Conciliación</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Saldo Inicial</label>
              <input
                type="number"
                step="0.01"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Saldo Final</label>
              <input
                type="number"
                step="0.01"
                value={formData.finalBalance}
                onChange={(e) => setFormData({ ...formData, finalBalance: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1">Total Extracto Bancario</label>
            <input
              type="number"
              step="0.01"
              value={formData.statementTotal}
              onChange={(e) => setFormData({ ...formData, statementTotal: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 border border-border rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.bankAccountId} isLoading={loading}>
              Crear Conciliación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Componentes de Estado
// ============================================

function StatusBadge({ status }: { status: string }) {
  const config = {
    DRAFT: { label: "Borrador", color: "bg-slate-100 text-slate-600", icon: FileText },
    IN_PROGRESS: { label: "En Progreso", color: "bg-amber-100 text-amber-700", icon: Clock },
    COMPLETED: { label: "Completada", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelada", color: "bg-rose-100 text-rose-600", icon: AlertCircle }
  };

  const { label, color, icon: Icon } = config[status as keyof typeof config] || config.DRAFT;

  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit", color)}>
      <Icon size={12} />
      {label}
    </span>
  );
}

// ============================================
// Selector de Banco (Dropdown)
// ============================================
function BankSelector({
  bankAccounts,
  selectedBank,
  onSelect
}: {
  bankAccounts: any[];
  selectedBank: string;
  onSelect: (bankId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedAccount = bankAccounts.find(a => a.id === selectedBank);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm hover:bg-slate-50 transition-colors"
      >
        <Banknote size={18} className="text-primary" />
        <span className="font-medium">
          {selectedAccount ? `${selectedAccount.name} - ${selectedAccount.bankName}` : "Todos los bancos"}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl border border-border shadow-lg z-50 overflow-hidden">
            <div className="p-2 border-b border-border">
              <button
                onClick={() => { onSelect(""); setIsOpen(false); }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedBank === "" ? "bg-primary/10 text-primary font-medium" : "hover:bg-slate-50"
                )}
              >
                Todos los bancos
              </button>
            </div>
            {bankAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => { onSelect(account.id); setIsOpen(false); }}
                className={cn(
                  "w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-3",
                  selectedBank === account.id ? "bg-primary/10 text-primary" : "hover:bg-slate-50"
                )}
              >
                <Banknote size={16} className="text-slate-400" />
                <div>
                  <p className="font-medium text-slate-800">{account.name}</p>
                  <p className="text-xs text-slate-400">{account.bankName}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// Página Principal
// ============================================

export default function ConciliacionPage() {
  const [reconciliations, setReconciliations] = useState<BankReconciliationWithStats[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBank, setSelectedBank] = useState<string>("");

  const loadReconciliations = async () => {
    try {
      setLoading(true);
      const [data, banks] = await Promise.all([
        getBankReconciliations(),
        getBankAccounts()
      ]);
      setReconciliations(data);
      setBankAccounts(banks);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReconciliations();
  }, []);

  const filteredReconciliations = useMemo(() => {
    return reconciliations.filter((r) => {
      const matchesSearch = r.bankAccount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.bankAccount.bankName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesBank = selectedBank === "" || r.bankAccountId === selectedBank;
      return matchesSearch && matchesStatus && matchesBank;
    });
  }, [reconciliations, searchQuery, statusFilter, selectedBank]);

  const stats = useMemo(() => {
    const filtered = filteredReconciliations;
    const total = filtered.length;
    const completed = filtered.filter(r => r.status === "COMPLETED").length;
    const inProgress = filtered.filter(r => r.status === "IN_PROGRESS").length;
    const matched = filtered.filter(r => r.difference === 0).length;
    const unmatched = filtered.filter(r => r.difference !== 0).length;
    const totalDifference = filtered.reduce((sum, r) => sum + Math.abs(Number(r.difference)), 0);
    return { total, completed, inProgress, matched, unmatched, totalDifference };
  }, [filteredReconciliations]);

  const handleReconciliationCreated = (reconciliation: BankReconciliationWithStats) => {
    loadReconciliations();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <Building2 className="mr-3 text-primary" size={24} />
              Conciliación Bancaria
            </h1>
            <p className="text-slate-500 mt-1">Compara tus registros con los extractos bancarios.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowReportModal(true)}>
              <FileSpreadsheet size={18} />
              Reporte
            </Button>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={18} className="mr-2" />
              Nueva Conciliación
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-xl font-black text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Completadas</p>
            <p className="text-xl font-black text-emerald-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">En Progreso</p>
            <p className="text-xl font-black text-amber-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Coincidentes</p>
            <p className="text-xl font-black text-blue-600">{stats.matched}</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">Sin Conciliar</p>
            <p className="text-xl font-black text-rose-600">{stats.unmatched}</p>
          </div>
          <div className={cn(
            "rounded-2xl border p-4 shadow-sm",
            stats.totalDifference === 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
          )}>
            <p className={cn(
              "text-xs font-bold uppercase tracking-widest mb-1",
              stats.totalDifference === 0 ? "text-emerald-400" : "text-rose-400"
            )}>
              Diferencia
            </p>
            <p className={cn(
              "text-xl font-black",
              stats.totalDifference === 0 ? "text-emerald-600" : "text-rose-600"
            )}>
              {formatCurrency(stats.totalDifference)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full bg-white px-4 py-2.5 rounded-xl border border-border flex items-center shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="text-slate-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Buscar por cuenta o banco..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none py-1 text-sm focus:ring-0 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>
          <BankSelector
            bankAccounts={bankAccounts}
            selectedBank={selectedBank}
            onSelect={setSelectedBank}
          />
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="DRAFT">Borrador</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="COMPLETED">Completadas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
            <Button variant="outline" size="sm" onClick={loadReconciliations}>
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw size={32} className="animate-spin mx-auto mb-4" />
            <p>Cargando conciliaciones...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <AlertCircle size={32} className="text-rose-500 mx-auto mb-4" />
            <p className="text-rose-600 font-medium">{error}</p>
            <Button variant="outline" className="mt-4" onClick={loadReconciliations}>
              Reintentar
            </Button>
          </div>
        ) : filteredReconciliations.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-20 text-center">
            <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No hay conciliaciones</h3>
            <p className="text-slate-500 mt-2 mb-6">Crea tu primera conciliación bancaria para comenzar.</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={18} className="mr-2" />
              Crear Conciliación
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-border">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Cuenta</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Banco</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Libros</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Diferencia</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Matching</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReconciliations.map((reconciliation) => (
                    <tr key={reconciliation.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-800">{reconciliation.bankAccount.name}</p>
                          <p className="text-xs text-slate-400">{reconciliation.bankAccount.bankName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{formatDate(reconciliation.date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{formatCurrency(reconciliation.statementTotal)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{formatCurrency(reconciliation.systemTotal)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={cn(
                          "text-sm font-bold",
                          reconciliation.difference === 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {formatCurrency(reconciliation.difference)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={reconciliation.status} />
                      </td>
                      <td className="px-6 py-4">
                        {reconciliation.difference === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                            <LinkIcon size={12} />
                            Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
                            <Unlink size={12} />
                            Sin Match
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/bancos/conciliacion/${reconciliation.id}`}
                          className="inline-flex items-center justify-center p-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl transition-colors"
                        >
                          <ArrowUpRight size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <NewReconciliationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleReconciliationCreated}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reconciliations={reconciliations}
      />
    </AppLayout>
  );
}
