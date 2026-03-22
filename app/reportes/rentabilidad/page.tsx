"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { formatMoney } from "@/lib/utils";
import { TrendingUp, Users, Package } from "lucide-react";

interface ProductRentability {
  id: string;
  code: string;
  name: string;
  category: string;
  quantitySold: number;
  netSales: number;
  totalCost: number;
  grossProfit: number;
  marginPercent: number;
}

interface ClientRentability {
  id: string;
  name: string;
  rnc: string;
  invoiceCount: number;
  netSales: number;
  totalCost: number;
  grossProfit: number;
  marginPercent: number;
  rank: number;
}

// Datos de ejemplo para demostración
const sampleProducts: ProductRentability[] = [
  { id: '1', code: 'PROD-001', name: 'Filtro de Aceite', category: 'Filtros', quantitySold: 150, netSales: 45000, totalCost: 22500, grossProfit: 22500, marginPercent: 50 },
  { id: '2', code: 'PROD-002', name: 'Bujía de Encendido', category: 'Motor', quantitySold: 300, netSales: 30000, totalCost: 15000, grossProfit: 15000, marginPercent: 50 },
  { id: '3', code: 'PROD-003', name: 'Pastillas de Freno', category: 'Frenos', quantitySold: 80, netSales: 64000, totalCost: 38400, grossProfit: 25600, marginPercent: 40 },
  { id: '4', code: 'PROD-004', name: 'Llanta 175/65R14', category: 'Neumáticos', quantitySold: 50, netSales: 75000, totalCost: 52500, grossProfit: 22500, marginPercent: 30 },
  { id: '5', code: 'PROD-005', name: 'Aceite Motor 5W30', category: 'Lubricantes', quantitySold: 200, netSales: 40000, totalCost: 16000, grossProfit: 24000, marginPercent: 60 },
];

const sampleClients: ClientRentability[] = [
  { id: '1', name: 'Juan Pérez', rnc: '001-2345678-9', invoiceCount: 45, netSales: 450000, totalCost: 315000, grossProfit: 135000, marginPercent: 30, rank: 1 },
  { id: '2', name: 'María García', rnc: '002-3456789-1', invoiceCount: 38, netSales: 380000, totalCost: 266000, grossProfit: 114000, marginPercent: 30, rank: 2 },
  { id: '3', name: 'Carlos López', rnc: '003-4567890-2', invoiceCount: 25, netSales: 250000, totalCost: 175000, grossProfit: 75000, marginPercent: 30, rank: 3 },
  { id: '4', name: 'Ana Rodríguez', rnc: '004-5678901-3', invoiceCount: 20, netSales: 180000, totalCost: 126000, grossProfit: 54000, marginPercent: 30, rank: 4 },
  { id: '5', name: 'Pedro Sánchez', rnc: '005-6789012-4', invoiceCount: 15, netSales: 120000, totalCost: 84000, grossProfit: 36000, marginPercent: 30, rank: 5 },
];

function ProgressBar({ value, colorClass = "bg-primary" }: { value: number; colorClass?: string }) {
  return (
    <div className="w-full bg-slate-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${colorClass}`} 
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export default function RentabilidadPage() {
  const [tab, setTab] = useState<'products' | 'clients'>('products');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ProductRentability[]>([]);
  const [clients, setClients] = useState<ClientRentability[]>([]);

  const fetchData = async () => {
    if (!dateRange.start || !dateRange.end) return;
    
    setIsLoading(true);
    try {
      // Aquí se haría la llamada a la API cuando esté implementada
      // Por ahora usamos datos de ejemplo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (tab === 'products') {
        setProducts(sampleProducts);
      } else {
        setClients(sampleClients);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = () => {
    fetchData();
  };

  // Calcular totales
  const productTotals = products.reduce((acc, p) => ({
    quantity: acc.quantity + p.quantitySold,
    sales: acc.sales + p.netSales,
    cost: acc.cost + p.totalCost,
    profit: acc.profit + p.grossProfit,
  }), { quantity: 0, sales: 0, cost: 0, profit: 0 });

  const clientTotals = clients.reduce((acc, c) => ({
    invoices: acc.invoices + c.invoiceCount,
    sales: acc.sales + c.netSales,
    cost: acc.cost + c.totalCost,
    profit: acc.profit + c.grossProfit,
  }), { invoices: 0, sales: 0, cost: 0, profit: 0 });

  // Margen promedio
  const avgMarginProducts = productTotals.sales > 0 
    ? (productTotals.profit / productTotals.sales) * 100 
    : 0;
  
  const avgMarginClients = clientTotals.sales > 0 
    ? (clientTotals.profit / clientTotals.sales) * 100 
    : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Análisis de Rentabilidad</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <TrendingUp size={16} />
            <span>Margen de ganancia por item</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border">
          <button
            onClick={() => {
              setTab('products');
              setProducts([]);
            }}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              tab === 'products'
                ? 'text-primary border-primary'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <Package size={16} />
            Por Producto
          </button>
          <button
            onClick={() => {
              setTab('clients');
              setClients([]);
            }}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              tab === 'clients'
                ? 'text-primary border-primary'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <Users size={16} />
            Por Cliente
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1.5">
                Fecha Inicio
              </label>
              <Input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1.5">
                Fecha Fin
              </label>
              <Input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleGenerate} isLoading={isLoading}>
                Generar
              </Button>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <div className="text-sm text-slate-500">
              {tab === 'products' ? 'Productos Vendidos' : 'Total Clientes'}
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {tab === 'products' ? productTotals.quantity : clients.length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <div className="text-sm text-slate-500">Ventas Netas</div>
            <div className="text-2xl font-bold text-slate-800">
              {formatMoney(tab === 'products' ? productTotals.sales : clientTotals.sales)}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <div className="text-sm text-slate-500">Costo Total</div>
            <div className="text-2xl font-bold text-slate-800">
              {formatMoney(tab === 'products' ? productTotals.cost : clientTotals.cost)}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm bg-primary/5">
            <div className="text-sm text-slate-500">Margen Promedio</div>
            <div className="text-2xl font-bold text-primary">
              {tab === 'products' ? avgMarginProducts.toFixed(1) : avgMarginClients.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Tabla */}
        {tab === 'products' ? (
          <div>
            {products.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 shadow-sm text-center text-slate-500">
                {dateRange.start && dateRange.end 
                  ? "No hay datos para el período seleccionado"
                  : "Seleccione un rango de fechas y haga clic en Generar"
                }
              </div>
            ) : (
              <Table headers={[
                "Código",
                "Nombre",
                "Categoría",
                "Cantidad",
                "Ventas Netas",
                "Costo",
                "Utilidad",
                "Margen"
              ]}>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs">{product.code}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{product.quantitySold}</TableCell>
                    <TableCell className="text-right">{formatMoney(product.netSales)}</TableCell>
                    <TableCell className="text-right">{formatMoney(product.totalCost)}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatMoney(product.grossProfit)}
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="flex items-center gap-2">
                        <ProgressBar 
                          value={product.marginPercent} 
                          colorClass={product.marginPercent >= 40 ? 'bg-green-500' : product.marginPercent >= 25 ? 'bg-yellow-500' : 'bg-red-500'}
                        />
                        <span className="text-xs font-medium w-8">{product.marginPercent.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            )}
          </div>
        ) : (
          <div>
            {clients.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 shadow-sm text-center text-slate-500">
                {dateRange.start && dateRange.end 
                  ? "No hay datos para el período seleccionado"
                  : "Seleccione un rango de fechas y haga clic en Generar"
                }
              </div>
            ) : (
              <Table headers={[
                "#",
                "Cliente",
                "RNC/Cédula",
                "Facturas",
                "Ventas Netas",
                "Costo",
                "Utilidad",
                "Margen"
              ]}>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        client.rank <= 3 
                          ? 'bg-primary text-white' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {client.rank}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="font-mono text-xs">{client.rnc}</TableCell>
                    <TableCell className="text-center">{client.invoiceCount}</TableCell>
                    <TableCell className="text-right">{formatMoney(client.netSales)}</TableCell>
                    <TableCell className="text-right">{formatMoney(client.totalCost)}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatMoney(client.grossProfit)}
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="flex items-center gap-2">
                        <ProgressBar 
                          value={client.marginPercent} 
                          colorClass={client.marginPercent >= 30 ? 'bg-green-500' : client.marginPercent >= 20 ? 'bg-yellow-500' : 'bg-red-500'}
                        />
                        <span className="text-xs font-medium w-8">{client.marginPercent.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}