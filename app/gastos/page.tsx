"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Plus, Search, Filter, Download, MoreHorizontal, Receipt, CheckCircle2, Clock, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExpenseModal } from "@/components/modals/ExpenseModal";

import { useExpenses } from "@/hooks/useDatabase";

export default function GastosPage() {
  const { data: expenses, isLoading } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSaveExpense = async (formData: any) => {
    console.log("Saving expense:", formData);
    setIsModalOpen(false);
  };

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter((e: any) =>
      e.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [expenses, searchQuery]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gastos</h1>
            <p className="text-slate-500 mt-1">Registra y controla los egresos de tu empresa.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center">
              <Download size={18} className="mr-2" />
              Exportar
            </button>
            <button
              onClick={() => { setEditingExpense(null); setIsModalOpen(true); }}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors flex items-center shadow-sm"
            >
              <Plus size={18} className="mr-2" />
              Nuevo Gasto
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por proveedor o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-transparent rounded-lg py-2 pl-10 pr-4 text-sm focus:bg-white focus:border-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 italic">Cargando gastos...</div>
        ) : filteredExpenses.length > 0 ? (
          <Table headers={["Referencia", "Proveedor / Concepto", "Fecha", "Categoría", "Total", "Estado", ""]}>
            {filteredExpenses.map((expense: any) => (
              <TableRow key={expense.id}>
                <TableCell className="font-bold text-slate-500">{expense.number}</TableCell>
                <TableCell className="font-medium text-slate-700">{expense.provider}</TableCell>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{expense.category?.name || "Gasto"}</span>
                </TableCell>
                <TableCell className="font-bold text-rose-600">${Number(expense.total).toLocaleString()}</TableCell>
                <TableCell>
                  <div className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                    expense.status === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {expense.status === "PAID" && <CheckCircle2 size={12} className="mr-1" />}
                    {expense.status === "PENDING" && <Clock size={12} className="mr-1" />}
                    {expense.status === "PAID" ? "Pagado" : "Pendiente"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => { setEditingExpense(expense); setIsModalOpen(true); }}
                      className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-primary transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => { /* Delete logic */ }}
                      className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <h3 className="text-lg font-bold text-slate-700">No se encontraron gastos</h3>
          </div>
        )}
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
        initialData={editingExpense}
      />
    </AppLayout>
  );
}
