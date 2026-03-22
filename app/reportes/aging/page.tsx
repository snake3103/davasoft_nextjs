"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { formatMoney } from "@/lib/utils";
import { ChevronDown, ChevronRight, Users, CreditCard } from "lucide-react";

interface FacturaAging {
  ncf: string;
  fecha: string;
  fechaVencimiento: string;
  diasVencido: number;
  monto: number;
}

interface ClienteAging {
  id: string;
  nombre: string;
  rnc: string;
  current: number;
  days31_60: number;
  days61_90: number;
  days91_plus: number;
  total: number;
  facturas: FacturaAging[];
}

interface AgingTotales {
  current: number;
  d31_60: number;
  d61_90: number;
  d90plus: number;
  total: number;
}

// Datos de ejemplo
const sampleCustomers: ClienteAging[] = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    rnc: '001-2345678-9',
    current: 25000,
    days31_60: 15000,
    days61_90: 5000,
    days91_plus: 0,
    total: 45000,
    facturas: [
      { ncf: 'B0100000001', fecha: '2026-03-15', fechaVencimiento: '2026-03-20', diasVencido: 1, monto: 15000 },
      { ncf: 'B0100000002', fecha: '2026-02-20', fechaVencimiento: '2026-03-20', diasVencido: 1, monto: 5000 },
      { ncf: 'B0100000003', fecha: '2026-01-10', fechaVencimiento: '2026-02-10', diasVencido: 39, monto: 15000 },
      { ncf: 'B0100000004', fecha: '2025-12-15', fechaVencimiento: '2026-01-15', diasVencido: 65, monto: 5000 },
      { ncf: 'B0100000005', fecha: '2025-11-01', fechaVencimiento: '2025-12-01', diasVencido: 110, monto: 5000 },
    ].filter(f => f.monto > 0)
  },
  {
    id: '2',
    nombre: 'María García',
    rnc: '002-3456789-1',
    current: 8000,
    days31_60: 0,
    days61_90: 0,
    days91_plus: 0,
    total: 8000,
    facturas: [
      { ncf: 'B0100000010', fecha: '2026-03-18', fechaVencimiento: '2026-03-23', diasVencido: -2, monto: 8000 },
    ]
  },
  {
    id: '3',
    nombre: 'Carlos López',
    rnc: '003-4567890-2',
    current: 0,
    days31_60: 20000,
    days61_90: 10000,
    days91_plus: 15000,
    total: 45000,
    facturas: [
      { ncf: 'B0100000020', fecha: '2026-02-01', fechaVencimiento: '2026-03-01', diasVencido: 20, monto: 20000 },
      { ncf: 'B0100000021', fecha: '2026-01-10', fechaVencimiento: '2026-02-10', diasVencido: 39, monto: 10000 },
      { ncf: 'B0100000022', fecha: '2025-12-01', fechaVencimiento: '2026-01-01', diasVencido: 79, monto: 15000 },
    ]
  },
  {
    id: '4',
    nombre: 'Ana Rodríguez',
    rnc: '004-5678901-3',
    current: 30000,
    days31_60: 8000,
    days61_90: 0,
    days91_plus: 0,
    total: 38000,
    facturas: [
      { ncf: 'B0100000030', fecha: '2026-03-10', fechaVencimiento: '2026-03-15', diasVencido: 6, monto: 20000 },
      { ncf: 'B0100000031', fecha: '2026-03-05', fechaVencimiento: '2026-03-10', diasVencido: 11, monto: 10000 },
      { ncf: 'B0100000032', fecha: '2026-02-01', fechaVencimiento: '2026-03-01', diasVencido: 20, monto: 8000 },
    ]
  },
  {
    id: '5',
    nombre: 'Pedro Sánchez',
    rnc: '005-6789012-4',
    current: 5000,
    days31_60: 5000,
    days61_90: 5000,
    days91_plus: 10000,
    total: 25000,
    facturas: [
      { ncf: 'B0100000040', fecha: '2026-03-01', fechaVencimiento: '2026-03-31', diasVencido: -10, monto: 5000 },
      { ncf: 'B0100000041', fecha: '2026-02-01', fechaVencimiento: '2026-03-01', diasVencido: 20, monto: 5000 },
      { ncf: 'B0100000042', fecha: '2026-01-15', fechaVencimiento: '2026-02-15', diasVencido: 34, monto: 5000 },
      { ncf: 'B0100000043', fecha: '2025-12-01', fechaVencimiento: '2026-01-01', diasVencido: 79, monto: 10000 },
    ]
  },
];

function getDiasColor(dias: number): string {
  if (dias <= 0) return 'bg-green-100 text-green-700';
  if (dias <= 30) return 'bg-green-100 text-green-700';
  if (dias <= 60) return 'bg-yellow-100 text-yellow-700';
  if (dias <= 90) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}

function getDiasLabel(dias: number): string {
  if (dias <= 0) return 'Corriente';
  if (dias <= 30) return '0-30 días';
  if (dias <= 60) return '31-60 días';
  if (dias <= 90) return '61-90 días';
  return '>90 días';
}

function AccordionItem({ 
  item, 
  children 
}: { 
  item: ClienteAging; 
  children: React.ReactNode 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-medium text-slate-800 truncate">{item.nombre}</span>
            <span className="text-xs text-slate-400 font-mono">{item.rnc}</span>
          </div>
        </div>
        <div className="flex gap-6 items-center ml-4">
          <span className={item.current > 0 ? 'text-green-600 font-medium' : 'text-slate-400'}>
            {formatMoney(item.current)}
          </span>
          <span className={item.days31_60 > 0 ? 'text-yellow-600 font-medium' : 'text-slate-400'}>
            {formatMoney(item.days31_60)}
          </span>
          <span className={item.days61_90 > 0 ? 'text-orange-600 font-medium' : 'text-slate-400'}>
            {formatMoney(item.days61_90)}
          </span>
          <span className={item.days91_plus > 0 ? 'text-red-600 font-medium' : 'text-slate-400'}>
            {formatMoney(item.days91_plus)}
          </span>
          <span className="font-bold text-slate-800 min-w-[100px] text-right">
            {formatMoney(item.total)}
          </span>
        </div>
      </button>
      {isOpen && (
        <div className="p-4 bg-white border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

export default function AgingPage() {
  const [type, setType] = useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  const [isLoading, setIsLoading] = useState(false);
  const [clientes, setClientes] = useState<ClienteAging[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 500));
      setClientes(sampleCustomers);
    } catch (error) {
      console.error('Error fetching aging data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  // Calcular totales
  const totales: AgingTotales = clientes.reduce((acc, c) => ({
    current: acc.current + c.current,
    d31_60: acc.d31_60 + c.days31_60,
    d61_90: acc.d61_90 + c.days61_90,
    d90plus: acc.d90plus + c.days91_plus,
    total: acc.total + c.total,
  }), { current: 0, d31_60: 0, d61_90: 0, d90plus: 0, total: 0 });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Estado de Cuenta Aging</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {type === 'CUSTOMER' ? <Users size={16} /> : <CreditCard size={16} />}
            <span>{type === 'CUSTOMER' ? 'Cuentas por Cobrar' : 'Cuentas por Pagar'}</span>
          </div>
        </div>

        {/* Selector */}
        <div className="flex gap-4">
          <Button 
            variant={type === 'CUSTOMER' ? 'primary' : 'outline'}
            onClick={() => setType('CUSTOMER')}
          >
            Cuentas por Cobrar
          </Button>
          <Button 
            variant={type === 'VENDOR' ? 'primary' : 'outline'}
            onClick={() => setType('VENDOR')}
          >
            Cuentas por Pagar
          </Button>
        </div>

        {/* Totales por bucket */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <div className="text-sm text-green-700">Corriente (0-30)</div>
            <div className="text-xl font-bold text-green-600">{formatMoney(totales.current)}</div>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
            <div className="text-sm text-yellow-700">31-60 días</div>
            <div className="text-xl font-bold text-yellow-600">{formatMoney(totales.d31_60)}</div>
          </div>
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
            <div className="text-sm text-orange-700">61-90 días</div>
            <div className="text-xl font-bold text-orange-600">{formatMoney(totales.d61_90)}</div>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-4">
            <div className="text-sm text-red-700">&gt;90 días</div>
            <div className="text-xl font-bold text-red-600">{formatMoney(totales.d90plus)}</div>
          </div>
          <div className="bg-slate-100 rounded-xl border border-slate-200 p-4">
            <div className="text-sm text-slate-600">Total</div>
            <div className="text-xl font-bold text-slate-800">{formatMoney(totales.total)}</div>
          </div>
        </div>

        {/* Tabla expandible */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="bg-white rounded-xl border border-border p-8 shadow-sm text-center text-slate-500">
              Cargando...
            </div>
          ) : clientes.length === 0 ? (
            <div className="bg-white rounded-xl border border-border p-8 shadow-sm text-center text-slate-500">
              No hay cuentas pendientes
            </div>
          ) : (
            clientes
              .sort((a, b) => b.total - a.total)
              .map((cliente) => (
                <AccordionItem key={cliente.id} item={cliente}>
                  <Table headers={["NCF", "Fecha", "Vence", "Días", "Monto"]}>
                    {cliente.facturas
                      .filter(f => f.monto > 0)
                      .map((fac, idx) => (
                        <TableRow key={fac.ncf || idx}>
                          <TableCell className="font-mono text-xs">{fac.ncf}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(fac.fecha).toLocaleDateString('es-DO')}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(fac.fechaVencimiento).toLocaleDateString('es-DO')}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDiasColor(fac.diasVencido)}`}>
                              {getDiasLabel(fac.diasVencido)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatMoney(fac.monto)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </Table>
                </AccordionItem>
              ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}