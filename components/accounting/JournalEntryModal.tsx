"use client";

import { useState, useEffect, useCallback } from "react";
import { useActionState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { createJournalEntry } from "@/app/actions/accounting";

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccountingAccount {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface JournalLine {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

export function JournalEntryModal({ isOpen, onClose }: JournalEntryModalProps) {
  const [state, formAction, isPending] = useActionState(
    createJournalEntry,
    { error: undefined, success: false }
  );

  const [localError, setLocalError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [lines, setLines] = useState<JournalLine[]>([
    { accountId: "", debit: 0, credit: 0, description: "" },
    { accountId: "", debit: 0, credit: 0, description: "" },
  ]);

  // Cargar cuentas cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setIsLoadingAccounts(true);
      fetch("/api/accounting/accounts")
        .then((res) => res.json())
        .then((data) => {
          setAccounts(data);
          setIsLoadingAccounts(false);
        })
        .catch((error) => {
          console.error("Error loading accounts:", error);
          setIsLoadingAccounts(false);
        });
    }
  }, [isOpen]);

  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  useEffect(() => {
    if (state?.error) {
      setLocalError(state.error);
    }
    if (state?.success) {
      onClose();
      setLines([
        { accountId: "", debit: 0, credit: 0, description: "" },
        { accountId: "", debit: 0, credit: 0, description: "" },
      ]);
    }
  }, [state, onClose]);

  const addLine = useCallback(() => {
    setLines((prev) => [...prev, { accountId: "", debit: 0, credit: 0, description: "" }]);
  }, []);

  const removeLine = useCallback((index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateLine = useCallback((index: number, field: keyof JournalLine, value: any) => {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, [field]: value } : line))
    );
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800">Nuevo Asiento Contable</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={20} />
          </button>
        </div>

        <form action={formAction} className="p-6 space-y-4">
          {localError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {localError}
            </div>
          )}

          <input type="hidden" name="lines" value={JSON.stringify(lines)} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                name="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Referencia
              </label>
              <input
                type="text"
                name="reference"
                placeholder="Opcional"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripción *
            </label>
            <input
              type="text"
              name="description"
              placeholder="Ej: Asiento por factura de venta #1024"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Líneas del Asiento *
              </label>
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  isBalanced
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {isBalanced ? "Cuadrado" : "No cuadrado"}
              </span>
            </div>

            <div className="space-y-2">
              {lines.map((line, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-start p-3 bg-slate-50 rounded-lg"
                >
                  <div className="col-span-5">
                    <select
                      value={line.accountId}
                      onChange={(e) => updateLine(index, "accountId", e.target.value)}
                      className="w-full px-2 py-1.5 border border-border rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      required
                      disabled={isLoadingAccounts}
                    >
                      <option value="">Seleccionar cuenta...</option>
                      {isLoadingAccounts ? (
                        <option disabled>Cargando cuentas...</option>
                      ) : (
                        accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.code} - {acc.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Débito"
                      value={line.debit || ""}
                      onChange={(e) =>
                        updateLine(index, "debit", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1.5 border border-border rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Crédito"
                      value={line.credit || ""}
                      onChange={(e) =>
                        updateLine(index, "credit", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1.5 border border-border rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Descripción"
                      value={line.description || ""}
                      onChange={(e) =>
                        updateLine(index, "description", e.target.value)
                      }
                      className="w-full px-2 py-1.5 border border-border rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div className="col-span-1">
                    {lines.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLine}
              className="mt-2 flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Plus size={16} className="mr-1" />
              Agregar línea
            </button>

            <div className="mt-4 p-3 bg-slate-100 rounded-lg flex justify-between text-sm">
              <span className="font-medium text-slate-600">Totales:</span>
              <div className="flex gap-4">
                <span className="font-bold text-emerald-600">
                  Débito: ${totalDebit.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                </span>
                <span className="font-bold text-rose-600">
                  Crédito: ${totalCredit.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !isBalanced}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Guardando..." : "Crear Asiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
