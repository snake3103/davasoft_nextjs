"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { JournalEntryModal } from "@/components/accounting/JournalEntryModal";
import {
  Plus,
  Search,
  FileText,
  ChevronRight,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference?: string | null;
  status: string;
  sourceType?: string | null;
  totalDebit: number;
  totalCredit: number;
  lineCount: number;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "POSTED":
      return (
        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={12} />
          Publicado
        </span>
      );
    case "DRAFT":
      return (
        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
          <AlertCircle size={12} />
          Borrador
        </span>
      );
    case "CANCELLED":
      return (
        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
          <XCircle size={12} />
          Cancelado
        </span>
      );
    default:
      return null;
  }
};

const getSourceTypeBadge = (sourceType: string | null) => {
  if (!sourceType) return null;
  switch (sourceType) {
    case "INVOICE":
      return (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-600">
          Factura
        </span>
      );
    case "EXPENSE":
      return (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-600">
          Gasto
        </span>
      );
    case "PAYMENT":
      return (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">
          Pago
        </span>
      );
    default:
      return (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          Manual
        </span>
      );
  }
};

const navItems = [
  { href: "/contabilidad/asientos", label: "Asientos", icon: FileText },
  { href: "/contabilidad/plan-cuentas", label: "Plan de Cuentas", icon: BookOpen },
  { href: "/contabilidad/reportes", label: "Reportes", icon: BarChart3 },
];

export default function AsientosPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/accounting/entries");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDebit = filteredEntries.reduce((sum, entry) => sum + entry.totalDebit, 0);
  const totalCredit = filteredEntries.reduce((sum, entry) => sum + entry.totalCredit, 0);

  return (
    <AppLayout>
      <div className="max-w-6xl">
        {/* Navegación del módulo de Contabilidad */}
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

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Asientos Contables</h1>
            <p className="text-slate-500 mt-1">
              Gestiona y consulta los asientos contables de tu empresa
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus size={18} />
            Nuevo Asiento
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Total Débitos</p>
                <p className="text-xl font-bold text-slate-800 mt-1">
                  ${formatCurrency(totalDebit).replace("$", "")}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Total Créditos</p>
                <p className="text-xl font-bold text-slate-800 mt-1">
                  ${totalCredit.toLocaleString("es-DO", { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <FileText size={20} className="text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Asientos</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{filteredEntries.length}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm mb-6">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por descripción o referencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="POSTED">Publicados</option>
              <option value="DRAFT">Borradores</option>
              <option value="CANCELLED">Cancelados</option>
            </select>
          </div>

          {/* Lista de asientos */}
          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 size={48} className="mx-auto mb-4 animate-spin" />
                <p className="text-sm">Cargando asientos contables...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">No se encontraron asientos contables</p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/contabilidad/asientos/${entry.id}`}
                  className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-white group-hover:text-primary transition-colors">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800">{entry.description}</span>
                        {entry.reference && (
                          <span className="text-xs font-medium text-slate-500">
                            Ref: {entry.reference}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(entry.date).toLocaleDateString("es-CO", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText size={12} />
                          {entry.lineCount} líneas
                        </span>
                        {getSourceTypeBadge(entry.sourceType || null)}
                        {getStatusBadge(entry.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500">Débito / Crédito</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-600">
                          ${entry.totalDebit.toLocaleString("es-DO", { minimumFractionDigits: 0 })}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-sm font-bold text-rose-600">
                          ${entry.totalCredit.toLocaleString("es-DO", { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                    <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Ayuda */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Información sobre Asientos</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Los asientos se generan automáticamente al crear facturas y gastos</li>
            <li>• También puedes crear asientos manuales para ajustes contables</li>
            <li>• Todos los asientos deben estar cuadrados (débitos = créditos)</li>
            <li>• Los asientos cancelados no pueden ser modificados</li>
          </ul>
        </div>
      </div>

      <JournalEntryModal 
        isOpen={modalOpen} 
        onClose={() => {
          setModalOpen(false);
          fetchEntries();
        }} 
      />
    </AppLayout>
  );
}
