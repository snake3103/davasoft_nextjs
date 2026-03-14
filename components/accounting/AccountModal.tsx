"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { X } from "lucide-react";
import { createAccount, updateAccount } from "@/app/actions/accounting";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: {
    id: string;
    code: string;
    name: string;
    type: string;
    parentId?: string | null;
    description?: string | null;
    isActive: boolean;
  } | null;
}

export function AccountModal({ isOpen, onClose, account }: AccountModalProps) {
  const [state, formAction, isPending] = useActionState(
    account?.id ? updateAccount.bind(null, account.id) : createAccount,
    { error: undefined, success: false }
  );

  const [localError, setLocalError] = useState<string | null>(null);
  const [parentAccounts, setParentAccounts] = useState<Array<{ id: string; code: string; name: string }>>([]);

  // Cargar cuentas padre cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetch("/api/accounting/accounts")
        .then((res) => res.json())
        .then((data) => {
          // Filtrar solo cuentas que pueden ser padre (mismo tipo o sin jerarquía)
          const availableParents = data.filter((a: any) => 
            !account || a.id !== account.id // No permitir la misma cuenta como padre
          );
          setParentAccounts(availableParents);
        })
        .catch((error) => {
          console.error("Error loading parent accounts:", error);
        });
    }
  }, [isOpen, account]);

  useEffect(() => {
    if (state?.error) {
      setLocalError(state.error);
    }
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800">
            {account?.id ? "Editar Cuenta" : "Nueva Cuenta Contable"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X size={20} />
          </button>
        </div>

        <form action={formAction} className="p-6 space-y-4">
          {localError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {localError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Código *
            </label>
            <input
              type="text"
              name="code"
              defaultValue={account?.code}
              placeholder="Ej: 1105"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Usa códigos jerárquicos (ej: 1105, 1305, 2205)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="name"
              defaultValue={account?.name}
              placeholder="Ej: Caja General"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tipo *
            </label>
            <select
              name="type"
              defaultValue={account?.type || "ASSET"}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              required
            >
              <option value="ASSET">Activo (1xxx)</option>
              <option value="LIABILITY">Pasivo (2xxx)</option>
              <option value="EQUITY">Patrimonio (3xxx)</option>
              <option value="REVENUE">Ingreso (4xxx)</option>
              <option value="EXPENSE">Gasto (5xxx)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cuenta Padre
            </label>
            <select
              name="parentId"
              defaultValue={account?.parentId || ""}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="">Ninguna (cuenta principal)</option>
              {parentAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.code} - {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              defaultValue={account?.description || ""}
              placeholder="Descripción opcional de la cuenta"
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              defaultChecked={account?.isActive ?? true}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              Cuenta activa
            </label>
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
              {isPending ? "Guardando..." : account?.id ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
