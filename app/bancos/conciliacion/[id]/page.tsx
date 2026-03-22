"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertCircle,
  Search,
  Upload,
  ChevronRight,
  TrendingUp,
  Link as LinkIcon,
  X,
  FileSpreadsheet,
  ArrowRightLeft,
  Plus,
  Check,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { cn, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  getBankReconciliation,
  matchReconciliationItem,
  completeBankReconciliation,
  addReconciliationItem,
  findMatchingTransactions,
  BankReconciliationWithStats,
  ReconciliationItem,
  MatchItemInput,
  CreateReconciliationItemInput
} from "@/app/actions/bank-reconciliation";
import { getBankAccounts } from "@/app/actions/bank-accounts";

// ============================================
// Types
// ============================================

interface SystemTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  matched: boolean;
  reference?: string;
}

// ============================================
// Componentes UI
// ============================================

function StatCard({
  title,
  value,
  className,
  variant = "default"
}: {
  title: string;
  value: string;
  className?: string;
  variant?: "default" | "success" | "danger";
}) {
  const bgColors = {
    default: "bg-white",
    success: "bg-emerald-50",
    danger: "bg-rose-50"
  };
  
  const valueColors = {
    default: "text-slate-800",
    success: "text-emerald-600",
    danger: "text-rose-600"
  };

  return (
    <div className={cn("rounded-2xl border border-border p-6 shadow-sm", bgColors[variant], className)}>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      <p className={cn("text-2xl font-black", valueColors[variant])}>{value}</p>
    </div>
  );
}

function Badge({
  children,
  color
}: {
  children: React.ReactNode;
  color: "green" | "yellow" | "gray" | "red";
}) {
  const colors = {
    green: "bg-emerald-100 text-emerald-700",
    yellow: "bg-amber-100 text-amber-700",
    gray: "bg-slate-100 text-slate-600",
    red: "bg-rose-100 text-rose-700"
  };

  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-bold", colors[color])}>
      {children}
    </span>
  );
}

// ============================================
// Modal de Importación de Extracto
// ============================================

function ImportStatementModal({
  isOpen,
  onClose,
  onImport
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: CreateReconciliationItemInput[]) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CreateReconciliationItemInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);

    // Parse CSV simple (fecha,descripcion,referencia,monto)
    try {
      const text = await selectedFile.text();
      const lines = text.split("\n").filter(line => line.trim());
      const items: CreateReconciliationItemInput[] = [];

      // Skip header if present
      const startIndex = lines[0]?.toLowerCase().includes("fecha") ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(",").map(p => p.trim());
        if (parts.length >= 4) {
          const amount = parseFloat(parts[3].replace(/[^0-9.-]/g, ""));
          if (!isNaN(amount)) {
            items.push({
              description: parts[1] || "Sin descripción",
              reference: parts[2] || undefined,
              statementDate: new Date(parts[0]),
              statementAmount: amount
            });
          }
        }
      }

      setPreview(items);
    } catch (err) {
      setError("Error al parsear el archivo. Asegúrate que sea un CSV válido.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Upload size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Importar Extracto Bancario</h2>
              <p className="text-sm text-slate-500">Sube un archivo CSV con los movimientos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {!file ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-primary/50 transition-colors">
              <FileSpreadsheet size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium mb-2">Arrastra un archivo CSV o haz clic para seleccionar</p>
              <p className="text-xs text-slate-400">Formatos soportados: CSV (fecha, descripción, referencia, monto)</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium text-slate-700">{file.name}</p>
                <button onClick={() => { setFile(null); setPreview([]); }} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm mb-4">
                  {error}
                </div>
              )}

              {preview.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 max-h-60 overflow-y-auto">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-3">{preview.length} transacciones detectadas</p>
                  <div className="space-y-2">
                    {preview.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.description.substring(0, 30)}...</span>
                        <span className={cn("font-bold", item.statementAmount >= 0 ? "text-emerald-600" : "text-rose-600")}>
                          {formatMoney(item.statementAmount)}
                        </span>
                      </div>
                    ))}
                    {preview.length > 5 && (
                      <p className="text-xs text-slate-400 text-center">...y {preview.length - 5} más</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-border flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onImport(preview)} disabled={preview.length === 0}>
            Importar {preview.length} Movimientos
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Modal de Matching
// ============================================

function LinkTransactionModal({
  isOpen,
  onClose,
  onLink,
  item,
  suggestedTransactions
}: {
  isOpen: boolean;
  onClose: () => void;
  onLink: (transactionId: string, transactionType: "INCOME" | "EXPENSE", amount: number) => void;
  item: ReconciliationItem | null;
  suggestedTransactions: SystemTransaction[];
}) {
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("INCOME");

  if (!isOpen || !item) return null;

  const amount = Math.abs(item.statementAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <LinkIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Vincular Transacción</h2>
              <p className="text-sm text-slate-500">Selecciona la transacción del sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Movimiento del Banco</p>
            <p className="font-medium text-slate-800">{item.description}</p>
            <p className="text-lg font-black text-primary mt-2">{formatMoney(item.statementAmount)}</p>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">Tipo de Transacción</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTxType("INCOME")}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                  txType === "INCOME" ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300" : "bg-slate-50 text-slate-600 border border-slate-200"
                )}
              >
                Ingreso
              </button>
              <button
                onClick={() => setTxType("EXPENSE")}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                  txType === "EXPENSE" ? "bg-rose-100 text-rose-700 border-2 border-rose-300" : "bg-slate-50 text-slate-600 border border-slate-200"
                )}
              >
                Egreso
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">Transacciones Sugeridas</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {suggestedTransactions.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No se encontraron transacciones con monto similar</p>
              ) : (
                suggestedTransactions.map(tx => (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx.id)}
                    className={cn(
                      "p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center",
                      selectedTx === tx.id ? "border-primary bg-primary/5" : "border-border hover:border-slate-300"
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                      <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString("es-DO")}</p>
                    </div>
                    <p className={cn("font-bold", tx.amount >= 0 ? "text-emerald-600" : "text-rose-600")}>
                      {formatMoney(tx.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-border flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => {
            const tx = suggestedTransactions.find(t => t.id === selectedTx);
            if (tx) {
              onLink(tx.id, tx.type, tx.amount);
            }
          }} disabled={!selectedTx}>
            <LinkIcon size={16} className="mr-2" />
            Vincular
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Página Principal
// ============================================

export default function ConciliacionDetallePage() {
  const params = useParams();
  const router = useRouter();
  const reconciliationId = params?.id as string;

  const [reconciliation, setReconciliation] = useState<BankReconciliationWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [selectedBankItem, setSelectedBankItem] = useState<ReconciliationItem | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [matchingTransactions, setMatchingTransactions] = useState<SystemTransaction[]>([]);
  const [isLinking, setIsLinking] = useState(false);

  // Cargar datos
  const loadReconciliation = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBankReconciliation(reconciliationId);
      setReconciliation(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [reconciliationId]);

  useEffect(() => {
    loadReconciliation();
  }, [loadReconciliation]);

  // Obtener transacciones del sistema para matching
  // Esta función retorna transacciones sugeridas basadas en el monto del movimiento del banco
  const getSystemTransactions = useCallback(async (): Promise<SystemTransaction[]> => {
    if (!reconciliation) return [];

    // Por ahora retornamos las transacciones sugeridas desde el backend
    // que ya se obtienen en handleSelectItem
    return matchingTransactions;
  }, [reconciliation, matchingTransactions]);

  // Buscar transacciones para suggestion
  const handleSelectItem = async (item: ReconciliationItem) => {
    setSelectedBankItem(item);
    if (!item.matched) {
      try {
        const transactions = await findMatchingTransactions(
          reconciliationId,
          Math.abs(item.statementAmount)
        );
        setMatchingTransactions(
          transactions.map((t: any) => ({
            id: t.id,
            date: t.date,
            description: t.description || `Ingreso #${t.number}`,
            amount: Number(t.amount),
            type: "INCOME" as const,
            matched: false,
            reference: t.reference
          }))
        );
      } catch {
        setMatchingTransactions([]);
      }
      setShowLinkModal(true);
    }
  };

  // Importar extracto
  const handleImportStatement = async (items: CreateReconciliationItemInput[]) => {
    try {
      for (const item of items) {
        await addReconciliationItem(reconciliationId, item);
      }
      await loadReconciliation();
      setShowImportModal(false);
    } catch (err: any) {
      alert("Error al importar: " + err.message);
    }
  };

  // Vincular transacción
  const handleLinkTransaction = async (transactionId: string, transactionType: "INCOME" | "EXPENSE", amount: number) => {
    if (!selectedBankItem) return;

    try {
      setIsLinking(true);
      const input: MatchItemInput = {
        itemId: selectedBankItem.id,
        transactionId,
        transactionType,
        systemAmount: amount
      };
      await matchReconciliationItem(reconciliationId, input);
      await loadReconciliation();
      setShowLinkModal(false);
      setSelectedBankItem(null);
    } catch (err: any) {
      alert("Error al vincular: " + err.message);
    } finally {
      setIsLinking(false);
    }
  };

  // Completar conciliación
  const handleComplete = async () => {
    if (!reconciliation) return;

    if (reconciliation.difference !== 0) {
      if (!confirm(`Existe una diferencia de ${formatMoney(reconciliation.difference)}. ¿Desea finalizar de todas formas?`)) {
        return;
      }
    }

    try {
      await completeBankReconciliation(reconciliationId, { force: true });
      router.push("/bancos/conciliacion");
    } catch (err: any) {
      alert("Error al completar: " + err.message);
    }
  };

  // Calcular diferencia
  const difference = reconciliation?.difference ?? 0;
  const initialBalance = reconciliation?.initialBalance ?? 0;
  const statementTotal = reconciliation?.statementTotal ?? 0;
  const systemTotal = reconciliation?.systemTotal ?? 0;

  // Formatear fecha
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <RefreshCw size={48} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-500">Cargando conciliación...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !reconciliation) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle size={48} className="text-rose-500 mb-4" />
          <p className="text-slate-600 font-medium mb-4">Error al cargar la conciliación</p>
          <p className="text-sm text-slate-400">{error}</p>
          <Link href="/bancos/conciliacion" className="mt-6">
            <Button variant="outline">Volver a Conciliaciones</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/bancos/conciliacion" className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-800 flex items-center">
                <Building2 className="mr-3 text-primary" size={24} />
                {reconciliation.bankAccount.name}
              </h1>
              <p className="text-sm font-bold text-slate-400 mt-0.5 uppercase tracking-widest">
                {new Date(reconciliation.date).toLocaleDateString("es-DO", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Upload size={16} className="mr-2" />
              Importar Extracto
            </Button>
            <Button onClick={handleComplete} disabled={difference !== 0}>
              <Check size={16} className="mr-2" />
              Finalizar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Saldo Inicial" value={formatMoney(initialBalance)} />
          <StatCard title="Total Extracto" value={formatMoney(statementTotal)} />
          <StatCard title="Total Sistema" value={formatMoney(systemTotal)} />
          <StatCard
            title="Diferencia"
            value={formatMoney(difference)}
            variant={difference === 0 ? "success" : "danger"}
          />
        </div>

        {/* Sugerencia inteligente */}
        {reconciliation.stats && reconciliation.stats.unmatchedItems > 0 && selectedBankItem && (
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
              <TrendingUp size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-800">Sugerencia Inteligente</h4>
              <p className="text-sm text-slate-600">
                {matchingTransactions.length > 0
                  ? `Se encontraron ${matchingTransactions.length} transacciones con monto similar`
                  : "Selecciona un movimiento del banco para ver sugerencias"}
              </p>
            </div>
            {matchingTransactions.length > 0 && (
              <Button
                size="sm"
                onClick={() => setShowLinkModal(true)}
              >
                Ver Coincidencias
              </Button>
            )}
          </div>
        )}

        {/* Tablas de conciliación */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Movimientos del banco */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 flex items-center">
                <Building2 size={16} className="mr-2 text-primary" />
                Movimientos del Banco
              </h2>
              <span className="text-xs text-slate-400">
                {reconciliation.items.filter(i => i.matched).length}/{reconciliation.items.length} conciliados
              </span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {reconciliation.items.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <p className="text-sm">No hay movimientos importados</p>
                  <Button size="sm" variant="outline" className="mt-4" onClick={() => setShowImportModal(true)}>
                    <Upload size={14} className="mr-2" />
                    Importar Extracto
                  </Button>
                </div>
              ) : (
                reconciliation.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={cn(
                      "px-6 py-4 cursor-pointer transition-all flex items-center",
                      item.matched
                        ? "bg-emerald-50/50"
                        : selectedBankItem?.id === item.id
                        ? "bg-primary/5"
                        : "hover:bg-slate-50",
                      item.matched ? "opacity-60" : ""
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          {formatDate(item.statementDate)}
                        </p>
                        {item.reference && (
                          <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded font-black text-slate-500 uppercase">
                            REF: {item.reference}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-800 truncate pr-4">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-right flex items-center">
                      <p className={cn(
                        "text-sm font-bold mr-3",
                        item.statementAmount >= 0 ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {formatMoney(item.statementAmount)}
                      </p>
                      {item.matched ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <ChevronRight size={16} className="text-slate-300" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Transacciones del sistema */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 flex items-center">
                <ArrowRightLeft size={16} className="mr-2 text-primary" />
                Transacciones en Sistema
              </h2>
              <span className="text-xs text-slate-400">
                {reconciliation.stats?.matchedItems ?? 0} vinculadas
              </span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {/* Aquí mostraríamos las transacciones del sistema que no están conciliadas */}
              <div className="p-12 text-center text-slate-400">
                <p className="text-sm">Las transacciones del sistema aparecerán aquí</p>
                <p className="text-xs text-slate-400 mt-2">cuando intentes vincular un movimiento del banco</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con diferencia */}
        {reconciliation.items.length > 0 && (
          <div className={cn(
            "rounded-3xl p-6 flex flex-col lg:flex-row justify-between items-center gap-6",
            difference === 0 ? "bg-emerald-900" : "bg-slate-800"
          )}>
            <div className="flex items-center space-x-12">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Saldo en Banco</p>
                <p className="text-2xl font-black text-white">{formatCurrency(statementTotal)}</p>
              </div>
              <div className="h-12 w-px bg-slate-700 hidden lg:block"></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Saldo en Libros</p>
                <p className="text-2xl font-black text-white">{formatCurrency(systemTotal)}</p>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-xl",
              difference === 0 ? "bg-emerald-800" : "bg-amber-900/50"
            )}>
              <span className={cn("h-2 w-2 rounded-full", difference === 0 ? "bg-emerald-400" : "bg-amber-400 animate-pulse")}></span>
              <span className={cn("text-lg font-bold", difference === 0 ? "text-emerald-300" : "text-amber-300")}>
                Diferencia: {formatMoney(difference)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <ImportStatementModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportStatement}
      />

      <LinkTransactionModal
        isOpen={showLinkModal}
        onClose={() => { setShowLinkModal(false); setSelectedBankItem(null); }}
        onLink={handleLinkTransaction}
        item={selectedBankItem}
        suggestedTransactions={matchingTransactions}
      />
    </AppLayout>
  );
}

// Helper para formatear currency
function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "$0,00";
  return "$" + formatMoney(amount);
}
