"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn, formatMoney } from "@/lib/utils";
import { 
  DollarSign, 
  CreditCard, 
  Building2,
  Wallet,
  Receipt,
  ArrowLeft,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CashClosure {
  id: string;
  date: string;
  userId: string;
  initialCash: number;
  countedCash?: number;
  notes?: string;
  status: 'OPEN' | 'CLOSED';
}

export default function POSCuadrePage() {
  const [closure, setClosure] = useState<CashClosure | null>(null);
  const [countedCash, setCountedCash] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totals, setTotals] = useState({
    cash: 0,
    card: 0,
    transfer: 0,
    other: 0,
    total: 0
  });

  const router = useRouter();

  useEffect(() => {
    fetchClosure();
    fetchTotals();
  }, []);

  const fetchClosure = async () => {
    try {
      const res = await fetch('/api/cash-closures/current');
      if (res.ok) {
        const data = await res.json();
        setClosure(data);
        if (data.countedCash) {
          setCountedCash(data.countedCash.toString());
        }
        if (data.notes) {
          setNotes(data.notes);
        }
      }
    } catch (error) {
      console.error('Error fetching closure:', error);
    }
  };

  const fetchTotals = async () => {
    try {
      const res = await fetch('/api/pos/totals');
      if (res.ok) {
        const data = await res.json();
        setTotals(data);
      }
    } catch (error) {
      console.error('Error fetching totals:', error);
    }
  };

  const difference = parseFloat(countedCash || '0') - totals.cash;

  const getDifferenceClass = () => {
    if (difference === 0) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (difference > 0) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const handleClose = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cash-closures/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          countedCash: parseFloat(countedCash || '0'),
          notes 
        })
      });
      
      if (res.ok) {
        router.push('/pos');
      } else {
        alert('Error al cerrar el cuadre');
      }
    } catch (error) {
      console.error('Error closing cuadre:', error);
      alert('Error al cerrar el cuadre');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/pos" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Cuadre de Caja - POS</h1>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString('es-DO', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Totales del Sistema */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
            <h2 className="font-semibold flex items-center gap-2">
              <Receipt size={18} />
              Totales del Sistema
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <DollarSign size={18} className="text-emerald-600" />
                </div>
                <span className="text-slate-600">Efectivo</span>
              </div>
              <span className="font-semibold text-lg">{formatMoney(totals.cash)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard size={18} className="text-blue-600" />
                </div>
                <span className="text-slate-600">Tarjeta</span>
              </div>
              <span className="font-semibold text-lg">{formatMoney(totals.card)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 size={18} className="text-purple-600" />
                </div>
                <span className="text-slate-600">Transferencia</span>
              </div>
              <span className="font-semibold text-lg">{formatMoney(totals.transfer)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Wallet size={18} className="text-slate-600" />
                </div>
                <span className="text-slate-600">Otros</span>
              </div>
              <span className="font-semibold text-lg">{formatMoney(totals.other)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-4 mt-2">
              <span className="font-bold text-lg text-slate-800">TOTAL</span>
              <span className="font-black text-2xl text-primary">{formatMoney(totals.total)}</span>
            </div>
          </div>
        </Card>

        {/* Conteo de Efectivo */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white">
            <h2 className="font-semibold flex items-center gap-2">
              <DollarSign size={18} />
              Conteo de Efectivo
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Cantidad en caja (efectivo contado)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-border rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className={cn(
              "p-4 rounded-xl text-center border-2 transition-all",
              getDifferenceClass()
            )}>
              <p className="text-sm font-medium opacity-75">Diferencia</p>
              <p className={cn(
                "text-3xl font-black",
                difference === 0 && "text-emerald-600",
                difference > 0 && "text-blue-600",
                difference < 0 && "text-red-600"
              )}>
                {difference >= 0 ? '+' : ''}{formatMoney(difference)}
              </p>
              {difference !== 0 && (
                <p className="text-xs mt-1 opacity-75 flex items-center justify-center gap-1">
                  <AlertTriangle size={12} />
                  {difference > 0 ? 'Sobrante' : 'Faltante'}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Notas */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-500 text-white">
            <h2 className="font-semibold flex items-center gap-2">
              <Receipt size={18} />
              Observaciones
            </h2>
          </div>
          <div className="p-6">
            <textarea
              className="w-full p-3 border border-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones adicionales sobre el cuadre..."
            />
          </div>
        </Card>

        {/* Acciones */}
        <div className="flex gap-4">
          <Link href="/pos" className="flex-1">
            <Button 
              variant="outline" 
              className="w-full"
            >
              Cancelar
            </Button>
          </Link>
          <Button 
            className="flex-1"
            onClick={handleClose}
            isLoading={isLoading}
            disabled={!countedCash}
          >
            Cerrar Cuadre
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
