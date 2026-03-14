"use client";

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PaymentModal } from "@/components/payments/PaymentModal";
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface PendingDocument {
  id: string;
  type: "INVOICE" | "EXPENSE";
  number: string;
  date: string;
  client?: { name: string };
  provider?: string;
  total: number;
  balance: number;
  totalPaid: number;
  status: string;
}

export default function PagosPage() {
  const [pendingDocs, setPendingDocs] = useState<PendingDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<PendingDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "INVOICE" | "EXPENSE">("all");

  const fetchPendingDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/payments/pending");
      if (res.ok) {
        const data = await res.json();
        const allDocs = [
          ...(data.invoices || []),
          ...(data.expenses || []),
        ];
        setPendingDocs(allDocs);
      }
    } catch (error) {
      console.error("Error fetching pending documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingDocs();
  }, [fetchPendingDocs]);

  const filteredDocs = pendingDocs.filter((doc) => {
    const searchName = doc.type === "INVOICE" ? doc.client?.name : doc.provider;
    const matchesSearch =
      doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (searchName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPending = filteredDocs.reduce((sum, doc) => sum + doc.balance, 0);
  const totalInvoices = filteredDocs.filter(d => d.type === "INVOICE").reduce((sum, doc) => sum + doc.balance, 0);
  const totalExpenses = filteredDocs.filter(d => d.type === "EXPENSE").reduce((sum, doc) => sum + doc.balance, 0);

  const handleRegisterPayment = (doc: PendingDocument) => {
    setSelectedDoc(doc);
    setIsModalOpen(true);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Pagos</h1>
            <p className="text-slate-500 mt-1">Registra pagos de facturas y compras a crédito</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Total por Cobrar</p>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  ${totalInvoices.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Total por Pagar</p>
                <p className="text-xl font-bold text-rose-600 mt-1">
                  ${totalExpenses.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-rose-50 rounded-lg">
                <TrendingDown size={20} className="text-rose-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Documentos Pendientes</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{filteredDocs.length}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm mb-6">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filterType === "all"
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType("INVOICE")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filterType === "INVOICE"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Facturas
              </button>
              <button
                onClick={() => setFilterType("EXPENSE")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filterType === "EXPENSE"
                    ? "bg-rose-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Compras
              </button>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por número o cliente/proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
            </div>
          </div>

          {/* Lista de documentos */}
          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 size={48} className="mx-auto mb-4 animate-spin" />
                <p className="text-sm">Cargando documentos pendientes...</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">No hay documentos pendientes de pago</p>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      doc.type === "INVOICE" ? "bg-blue-100 text-blue-600" : "bg-rose-100 text-rose-600"
                    }`}>
                      {doc.type === "INVOICE" ? <DollarSign size={20} /> : <Building2 size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800">{doc.number}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          doc.status === "PAID" ? "bg-emerald-100 text-emerald-600" :
                          doc.status === "PARTIAL" ? "bg-amber-100 text-amber-600" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {doc.type === "INVOICE" 
                            ? doc.status === "PARTIAL" ? "Parcial" : "Pendiente"
                            : "Pendiente"
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {doc.type === "INVOICE" ? doc.client?.name : doc.provider}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(doc.date).toLocaleDateString("es-DO")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500 mb-1">Saldo Pendiente</p>
                      <p className={`text-lg font-black ${
                        doc.type === "INVOICE" ? "text-blue-600" : "text-rose-600"
                      }`}>
                        ${doc.balance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-400">
                        Pagado: ${doc.totalPaid.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRegisterPayment(doc)}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Registrar Pago
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ayuda */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Información sobre Pagos</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Los pagos generan asientos contables automáticamente</li>
            <li>• Puedes registrar pagos parciales o totales</li>
            <li>• El sistema actualiza el estado de la factura/compra automáticamente</li>
            <li>• Los asientos de pago usan las cuentas de Banco o Caja según el método</li>
          </ul>
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDoc(null);
          fetchPendingDocs();
        }}
        document={selectedDoc}
      />
    </AppLayout>
  );
}
