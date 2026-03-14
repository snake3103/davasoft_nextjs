"use client";

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Printer,
  BookOpen,
  DollarSign,
  Hash,
  Clipboard
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface JournalLine {
  id: string;
  accountId: string;
  account: {
    code: string;
    name: string;
    type: string;
  };
  debit: number;
  credit: number;
  description?: string | null;
}

interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference?: string | null;
  status: string;
  sourceType?: string | null;
  sourceId?: string | null;
  lines: JournalLine[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "POSTED":
      return (
        <span className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 size={16} />
          Publicado
        </span>
      );
    case "DRAFT":
      return (
        <span className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">
          <AlertCircle size={16} />
          Borrador
        </span>
      );
    case "CANCELLED":
      return (
        <span className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
          <XCircle size={16} />
          Cancelado
        </span>
      );
    default:
      return null;
  }
};

const getSourceTypeLabel = (sourceType: string | null) => {
  if (!sourceType) return "Manual";
  switch (sourceType) {
    case "INVOICE": return "Factura";
    case "EXPENSE": return "Gasto";
    case "PAYMENT": return "Pago";
    case "ESTIMATE": return "Cotización";
    default: return "Manual";
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case "ASSET":
      return <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">Activo</span>;
    case "LIABILITY":
      return <span className="text-xs font-bold px-2 py-1 rounded bg-rose-100 text-rose-700">Pasivo</span>;
    case "EQUITY":
      return <span className="text-xs font-bold px-2 py-1 rounded bg-purple-100 text-purple-700">Patrimonio</span>;
    case "REVENUE":
      return <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-700">Ingreso</span>;
    case "EXPENSE":
      return <span className="text-xs font-bold px-2 py-1 rounded bg-amber-100 text-amber-700">Gasto</span>;
    default:
      return null;
  }
};

export default function JournalEntryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntry = useCallback(async () => {
    try {
      const res = await fetch(`/api/accounting/entries/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEntry(data);
      }
    } catch (error) {
      console.error("Error fetching journal entry:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  const totalDebit = entry?.lines.reduce((sum, line) => sum + Number(line.debit), 0) || 0;
  const totalCredit = entry?.lines.reduce((sum, line) => sum + Number(line.credit), 0) || 0;
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-slate-400">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm">Cargando asiento contable...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!entry) {
    return (
      <AppLayout>
        <div className="max-w-3xl">
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <FileText size={64} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Asiento no encontrado</h2>
            <p className="text-slate-500 mb-6">El asiento contable que buscas no existe o fue eliminado.</p>
            <Link
              href="/contabilidad/asientos"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <ArrowLeft size={18} />
              Volver a Asientos
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl">
        {/* Header con navegación */}
        <div className="mb-6">
          <Link
            href="/contabilidad/asientos"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Volver a Asientos
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-800">Asiento Contable</h1>
                {getStatusBadge(entry.status)}
              </div>
              <p className="text-slate-500">{entry.description}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Printer size={18} />
                Imprimir
              </button>
              <button className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Download size={18} />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar size={18} className="text-blue-600" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase">Fecha</span>
            </div>
            <p className="text-lg font-bold text-slate-800">
              {new Date(entry.date).toLocaleDateString("es-DO", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Hash size={18} className="text-purple-600" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase">Referencia</span>
            </div>
            <p className="text-lg font-bold text-slate-800">
              {entry.reference || "N/A"}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <BookOpen size={18} className="text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase">Origen</span>
            </div>
            <p className="text-lg font-bold text-slate-800">
              {getSourceTypeLabel(entry.sourceType || null)}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clipboard size={18} className="text-amber-600" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase">Líneas</span>
            </div>
            <p className="text-lg font-bold text-slate-800">
              {entry.lines.length} líneas
            </p>
          </div>
        </div>

        {/* Tabla de líneas */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm mb-6">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Líneas del Asiento
            </h2>
            {isBalanced ? (
              <span className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={16} />
                Cuadrado
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-600">
                <XCircle size={16} />
                No Cuadrado
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-3">Cuenta</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-3">Tipo</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-3">Descripción</th>
                  <th className="text-right text-xs font-bold text-slate-500 uppercase px-6 py-3">Débito</th>
                  <th className="text-right text-xs font-bold text-slate-500 uppercase px-6 py-3">Crédito</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entry.lines.map((line, index) => (
                  <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-black text-slate-500">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block mb-1">
                            {line.account.code}
                          </p>
                          <p className="text-sm font-semibold text-slate-800">{line.account.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(line.account.type)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{line.description || "-"}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {line.debit > 0 ? (
                        <span className="text-sm font-bold text-emerald-600">
                          ${Number(line.debit).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {line.credit > 0 ? (
                        <span className="text-sm font-bold text-rose-600">
                          ${Number(line.credit).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-200">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-sm font-bold text-slate-700">TOTALES</td>
                  <td className={`px-6 py-4 text-right text-sm font-bold ${isBalanced ? "text-emerald-600" : "text-red-600"}`}>
                    ${totalDebit.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`px-6 py-4 text-right text-sm font-bold ${isBalanced ? "text-emerald-600" : "text-red-600"}`}>
                    ${totalCredit.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Resumen de verificación */}
        <div className={`rounded-2xl border p-6 ${isBalanced ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isBalanced ? "bg-emerald-100" : "bg-red-100"}`}>
              {isBalanced ? (
                <CheckCircle2 size={24} className="text-emerald-600" />
              ) : (
                <XCircle size={24} className="text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${isBalanced ? "text-emerald-900" : "text-red-900"}`}>
                {isBalanced ? "Asiento Cuadrado" : "Asiento No Cuadrado"}
              </h3>
              <p className={`text-sm mt-1 ${isBalanced ? "text-emerald-700" : "text-red-700"}`}>
                {isBalanced
                  ? "El asiento está correctamente cuadrado. La suma de débitos es igual a la suma de créditos."
                  : "El asiento NO está cuadrado. Hay una diferencia entre débitos y créditos."
                }
              </p>
              {!isBalanced && (
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-red-700">Diferencia:</span>
                    <span className="text-lg font-black text-red-700">
                      ${(Math.abs(totalDebit - totalCredit)).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
