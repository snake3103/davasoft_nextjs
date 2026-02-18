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
  AlertCircle,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const initialAccounts = [
  { id: 1, name: "Cuenta Maestra", bank: "BBVA Bancomer", type: "Número de Cuenta", balance: "$854,230.00", currency: "MXN", status: "Al día", color: "bg-blue-600", icon: Building2 },
  { id: 2, name: "Nómina Operativa", bank: "Santander", type: "Número de Cuenta", balance: "$391,070.50", currency: "MXN", status: "Conciliado", color: "bg-rose-600", icon: Building2 },
  { id: 3, name: "Caja Chica", bank: "Efectivo - Oficina Central", type: "Responsable", balance: "$4,500.00", currency: "MXN", status: "Pendiente", color: "bg-emerald-600", icon: CreditCard },
  { id: 4, name: "Pagos Online", bank: "Stripe USD", type: "Email Asociado", balance: "$12,450.00", currency: "USD", status: "Conciliado", color: "bg-slate-800", icon: CreditCard },
];

export default function BancosPage() {
  const [accounts] = useState(initialAccounts);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) =>
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [accounts, searchQuery]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Bancos y Cajas</h1>
            <p className="text-slate-500 mt-1">Administra tus cuentas bancarias y flujo de efectivo.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20">
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
              placeholder="Buscar por nombre de cuenta o tipo..."
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

        {filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 font-medium">
            {filteredAccounts.map((account) => (
              <div key={account.id} className="bg-white rounded-[2rem] border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn("p-4 rounded-2xl text-white shadow-sm", account.color)}>
                      <account.icon size={28} />
                    </div>
                    <button className="text-slate-400 p-1 hover:bg-slate-50 rounded-lg">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 truncate">{account.name}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{account.bank}</p>
                  </div>

                  <div className="mt-10">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{account.type}</p>
                    <p className="text-sm font-bold text-slate-600 mt-1">•••• 4421</p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Saldo Actual</p>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <p className={cn(
                        "text-3xl font-black",
                        account.balance.startsWith("-") ? "text-rose-600" : "text-slate-800"
                      )}>{account.balance}</p>
                      <span className="text-xs font-black text-slate-400">{account.currency}</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        account.status === "Al día" ? "bg-emerald-500" :
                          account.status === "Conciliado" ? "bg-blue-500" :
                            account.status === "Vencida" ? "bg-rose-500" : "bg-amber-500"
                      )}></span>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{account.status}</span>
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
            ))}
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:border-primary/50 hover:bg-primary/[0.02] transition-all min-h-[380px]">
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
              ?
            </div>
            <h3 className="text-xl font-bold text-slate-700">No hay cuentas bancarias</h3>
            <p className="text-slate-500 mt-2">No se encontró ninguna cuenta que coincida con "{searchQuery}".</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
