"use client";

import { useState, useEffect } from "react";
import { 
  Lock, 
  Unlock, 
  DollarSign, 
  Clock, 
  User,
  Loader2,
  AlertTriangle,
  CheckCircle,
  X,
  Calculator,
  ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Shift {
  id: string;
  status: "OPEN" | "CLOSED" | "AUDITED";
  openingDate: string;
  closingDate?: string;
  openingAmount: number;
  expectedAmount?: number;
  actualAmount?: number;
  totalCashSales?: number;
  totalCardSales?: number;
  totalTransferSales?: number;
  totalSales?: number;
  transactionCount?: number;
  user?: {
    name?: string;
    email?: string;
  };
}

export function CashDrawerShiftWidget() {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("0");
  const [actualAmount, setActualAmount] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCurrentShift();
  }, []);

  const fetchCurrentShift = async () => {
    try {
      const res = await fetch("/api/cash-register");
      if (res.ok) {
        const data = await res.json();
        const openShift = data.find((s: Shift) => s.status === "OPEN");
        setCurrentShift(openShift || null);
      }
    } catch (err) {
      console.error("Error fetching shift:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenShift = async () => {
    setIsSubmitting(true);
    setError("");
    
    try {
      const res = await fetch("/api/cash-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "open",
          openingAmount: parseFloat(openingAmount) || 0,
          notes: "",
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccess("Turno abierto correctamente");
        setCurrentShift(data.shift);
        setIsOpenModalOpen(false);
        setOpeningAmount("0");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Error al abrir turno");
      }
    } catch (err) {
      setError("Error al abrir turno");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseShift = async () => {
    if (!currentShift || !actualAmount) return;
    
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/cash-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "close",
          shiftId: currentShift.id,
          actualAmount: parseFloat(actualAmount),
          notes: closingNotes,
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccess(`Turno cerrado. Diferencia: $${data.summary.difference}`);
        setCurrentShift(null);
        setIsCloseModalOpen(false);
        setActualAmount("");
        setClosingNotes("");
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "Error al cerrar turno");
      }
    } catch (err) {
      setError("Error al cerrar turno");
    } finally {
      setIsSubmitting(false);
    }
  };

  const expectedAmount = currentShift 
    ? Number(currentShift.openingAmount) + Number(currentShift.totalCashSales || 0)
    : 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Turno de Caja
          </h3>
          {currentShift && (
            <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Abierto
            </span>
          )}
        </div>

        {currentShift ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Cajero</p>
                <p className="font-bold text-slate-800">{currentShift.user?.name || "Usuario"}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Transacciones</p>
                <p className="font-bold text-slate-800">{currentShift.transactionCount || 0}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Dinero Inicial</p>
                <p className="font-bold text-slate-800">${Number(currentShift.openingAmount).toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Ventas Efectivo</p>
                <p className="font-bold text-emerald-600">${Number(currentShift.totalCashSales || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-slate-500">Esperado en caja:</span>
                <span className="font-bold text-slate-800">${expectedAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCloseModalOpen(true)}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Lock size={18} />
              Cerrar Turno
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800 text-sm">No hay turno abierto</p>
                <p className="text-xs text-amber-700">Abre un turno para registrar las ventas del día</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpenModalOpen(true)}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Unlock size={18} />
              Abrir Turno
            </button>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-600" />
            <p className="text-sm font-bold text-emerald-700">{success}</p>
          </div>
        )}
      </div>

      {/* Open Shift Modal */}
      {isOpenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">Abrir Turno de Caja</h2>
              <button onClick={() => setIsOpenModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Dinero inicial en caja
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-300">$</span>
                  <input
                    type="number"
                    value={openingAmount}
                    onChange={(e) => setOpeningAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold outline-none focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Ingresa el dinero que hay en la caja al iniciar el turno
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-sm font-bold text-rose-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleOpenShift}
                disabled={isSubmitting}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Unlock size={20} />
                    Abrir Turno
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {isCloseModalOpen && currentShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">Cerrar Turno de Caja</h2>
              <button onClick={() => setIsCloseModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Dinero inicial:</span>
                  <span className="font-bold">${Number(currentShift.openingAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ventas efectivo:</span>
                  <span className="font-bold text-emerald-600">+${Number(currentShift.totalCashSales || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ventas tarjeta:</span>
                  <span className="font-bold text-blue-600">+${Number(currentShift.totalCardSales || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ventas transferencia:</span>
                  <span className="font-bold text-purple-600">+${Number(currentShift.totalTransferSales || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
                  <span className="font-bold text-slate-800">Esperado en caja:</span>
                  <span className="font-black text-slate-800">${expectedAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Actual Amount */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Calculator size={16} className="inline mr-1" />
                  Dinero real en caja
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-300">$</span>
                  <input
                    type="number"
                    value={actualAmount}
                    onChange={(e) => setActualAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold outline-none focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
                {actualAmount && (
                  <div className={cn(
                    "mt-2 p-2 rounded-xl text-center font-bold",
                    parseFloat(actualAmount) >= expectedAmount 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "bg-rose-50 text-rose-700"
                  )}>
                    Diferencia: ${(parseFloat(actualAmount || "0") - expectedAmount).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary resize-none"
                  rows={3}
                  placeholder="Observaciones del cierre..."
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-sm font-bold text-rose-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleCloseShift}
                disabled={isSubmitting || !actualAmount}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Lock size={20} />
                    Cerrar Turno
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
