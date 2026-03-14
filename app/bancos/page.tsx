"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Plus,
  Search,
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Building2,
  X,
  Edit,
  Trash,
  Wallet
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useBankAccounts, useDeleteBankAccount } from "@/hooks/useDatabase";

export default function BancosPage() {
  const { data: accounts = [], isLoading } = useBankAccounts();
  const deleteBankAccount = useDeleteBankAccount();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc: any) =>
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.bankName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [accounts, searchQuery]);

  const totalBalance = useMemo(() => {
    return accounts.reduce((sum: number, acc: any) => sum + Number(acc.currentBalance || 0), 0);
  }, [accounts]);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta cuenta bancaria?")) {
      try {
        await deleteBankAccount.mutateAsync(id);
      } catch (error: any) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "CASH":
        return Wallet;
      case "CREDIT":
        return CreditCard;
      default:
        return Building2;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Activa";
      case "INACTIVE":
        return "Inactiva";
      case "CLOSED":
        return "Cerrada";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500";
      case "INACTIVE":
        return "bg-amber-500";
      case "CLOSED":
        return "bg-slate-400";
      default:
        return "bg-slate-400";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Bancos y Cajas</h1>
            <p className="text-slate-500 mt-1">Administra tus cuentas bancarias y flujo de efectivo.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20"
            >
              <Plus size={18} className="mr-2" />
              Nueva Cuenta
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full bg-white px-4 py-2.5 rounded-xl border border-border flex items-center shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="text-slate-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre de cuenta o banco..."
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
        </div>

        {!isLoading && accounts.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total en Bancos</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cuentas Activas</p>
                <p className="text-2xl font-black text-primary mt-1">{accounts.filter((a: any) => a.status === "ACTIVE").length}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 italic">Cargando cuentas...</div>
        ) : filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 font-medium">
            {filteredAccounts.map((account: any) => {
              const IconComponent = getAccountIcon(account.accountType);
              const accountNumber = account.accountNumber.slice(-4);
              
              return (
                <div key={account.id} className="bg-white rounded-[2rem] border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className={cn(
                        "p-4 rounded-2xl text-white shadow-sm",
                        account.accountType === "CASH" ? "bg-emerald-600" :
                          account.accountType === "CREDIT" ? "bg-rose-600" : "bg-blue-600"
                      )}>
                        <IconComponent size={28} />
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleDelete(account.id)}
                          className="text-slate-400 p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash size={18} />
                        </button>
                        <button className="text-slate-400 p-1 hover:bg-slate-50 rounded-lg">
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 truncate">{account.name}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{account.bankName}</p>
                    </div>

                    <div className="mt-10">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                        {account.accountType === "CHECKING" ? "Cuenta Corriente" :
                          account.accountType === "SAVINGS" ? "Cuenta de Ahorros" :
                            account.accountType === "CASH" ? "Efectivo" : "Tarjeta de Crédito"}
                      </p>
                      <p className="text-sm font-bold text-slate-600 mt-1">•••• {accountNumber}</p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Saldo Actual</p>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <p className={cn(
                          "text-3xl font-black",
                          Number(account.currentBalance) < 0 ? "text-rose-600" : "text-slate-800"
                        )}>{formatCurrency(account.currentBalance)}</p>
                        <span className="text-xs font-black text-slate-400">{account.currency}</span>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={cn("h-2 w-2 rounded-full", getStatusColor(account.status))}></span>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          {getStatusLabel(account.status)}
                        </span>
                      </div>
                      <Link
                        href="/bancos/conciliacion"
                        className="bg-primary/5 hover:bg-primary/10 text-primary p-2 rounded-xl transition-colors group"
                        title="Conciliar"
                      >
                        <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
            <div 
              onClick={() => setShowModal(true)}
              className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:border-primary/50 hover:bg-primary/[0.02] transition-all min-h-[380px]"
            >
              <div className="h-16 w-16 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                <Plus size={32} />
              </div>
              <h4 className="font-black text-slate-800 text-lg">Agregar Nueva Cuenta</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-[180px]">Conecta un banco o crea una caja chica manualmente.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-20 text-center">
            <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 font-bold">
              <Building2 size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No hay cuentas bancarias</h3>
            <p className="text-slate-500 mt-2">Comienza agregando una cuenta bancaria o caja.</p>
            <button 
              onClick={() => setShowModal(true)}
              className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Crear Primera Cuenta
            </button>
          </div>
        )}
      </div>

      {showModal && <BankAccountModal onClose={() => setShowModal(false)} />}
    </AppLayout>
  );
}

import { useForm } from "react-hook-form";
import { useCreateBankAccount } from "@/hooks/useDatabase";

function BankAccountModal({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const createBankAccount = useCreateBankAccount();

  const onSubmit = async (data: any) => {
    try {
      await createBankAccount.mutateAsync(data);
      onClose();
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Nueva Cuenta Bancaria</h2>
            <p className="text-sm text-slate-500">Agrega una nueva cuenta o caja.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1">Nombre de la Cuenta</label>
            <input
              {...register("name", { required: true })}
              placeholder="Ej: Cuenta Corriente Principal"
              className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.name && <span className="text-rose-500 text-xs">Requerido</span>}
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1">Banco / Entidad</label>
            <input
              {...register("bankName", { required: true })}
              placeholder="Ej: Banco Popular, Efectivo"
              className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.bankName && <span className="text-rose-500 text-xs">Requerido</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Número de Cuenta</label>
              <input
                {...register("accountNumber", { required: true })}
                placeholder="•••• •••• ••••"
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.accountNumber && <span className="text-rose-500 text-xs">Requerido</span>}
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Tipo de Cuenta</label>
              <select
                {...register("accountType")}
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="CHECKING">Cuenta Corriente</option>
                <option value="SAVINGS">Cuenta de Ahorros</option>
                <option value="CASH">Efectivo / Caja</option>
                <option value="CREDIT">Tarjeta de Crédito</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Saldo Inicial</label>
              <input
                type="number"
                {...register("initialBalance", { valueAsNumber: true })}
                defaultValue={0}
                step="0.01"
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Moneda</label>
              <select
                {...register("currency")}
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="DOP">DOP (Peso RD)</option>
                <option value="USD">USD (Dólar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-border flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createBankAccount.isPending}
            className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center disabled:opacity-50"
          >
            {createBankAccount.isPending ? "Guardando..." : "Guardar Cuenta"}
          </button>
        </div>
      </form>
    </div>
  );
}
