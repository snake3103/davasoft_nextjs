"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { X } from "lucide-react";
import { registerPayment } from "@/app/actions/payments";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    type: "INVOICE" | "EXPENSE";
    number: string;
    balance: number;
    client?: { name: string };
    provider?: string;
  } | null;
}

export function PaymentModal({ isOpen, onClose, document }: PaymentModalProps) {
  const [state, formAction, isPending] = useActionState(registerPayment, null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.error) {
      setLocalError(state.error);
    }
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800">
            Registrar Pago - {document.number}
          </h2>
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

          <input type="hidden" name="invoiceId" value={document.type === "INVOICE" ? document.id : ""} />
          <input type="hidden" name="expenseId" value={document.type === "EXPENSE" ? document.id : ""} />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cliente/Proveedor
            </label>
            <input
              type="text"
              value={document.type === "INVOICE" ? document.client?.name : document.provider}
              disabled
              className="w-full px-3 py-2 border border-border rounded-lg bg-slate-50 text-slate-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Saldo Pendiente
            </label>
            <input
              type="text"
              value={`RD$ ${document.balance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`}
              disabled
              className="w-full px-3 py-2 border border-border rounded-lg bg-slate-50 text-slate-600 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Monto del Pago *
            </label>
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0.01"
              max={document.balance}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Máximo: RD$ {document.balance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Método de Pago *
            </label>
            <select
              name="method"
              defaultValue="CASH"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              required
            >
              <option value="CASH">Efectivo</option>
              <option value="BANK_TRANSFER">Transferencia Bancaria</option>
              <option value="CREDIT_CARD">Tarjeta de Crédito</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fecha del Pago *
            </label>
            <input
              type="date"
              name="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Referencia (Opcional)
            </label>
            <input
              type="text"
              name="reference"
              placeholder="Ej: Número de cheque, transferencia, etc."
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            />
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
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
            >
              {isPending ? "Registrando..." : "Registrar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
