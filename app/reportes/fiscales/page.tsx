"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { formatMoney } from "@/lib/utils";
import { FileSpreadsheet, FileText, Calculator } from "lucide-react";

interface InvoiceEntry {
  id: string;
  number: string;
  date: string;
  clientName: string;
  clientIdNumber: string;
  ncf?: string;
  subtotal: number;
  itbis: number;
  total: number;
}

interface ReportSummary {
  totalInvoices: number;
  totalSubtotal: number;
  totalItbis: number;
  total: number;
}

export default function FiscalReportsPage() {
  const [selectedReport, setSelectedReport] = useState<'606' | '607'>('607');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceEntry[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalInvoices: 0,
    totalSubtotal: 0,
    totalItbis: 0,
    total: 0,
  });

  const fetchReport = async () => {
    if (!dateRange.start || !dateRange.end) return;
    
    setIsLoading(true);
    try {
      const endpoint = selectedReport === '607' 
        ? '/api/reports/fiscal/607' 
        : '/api/reports/fiscal/606';
      
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
        format: 'json'
      });

      const response = await fetch(`${endpoint}?${params}`);
      const data = await response.json();
      
      if (selectedReport === '607') {
        setInvoices(data.facturas?.map((f: any, idx: number) => ({
          id: idx.toString(),
          number: f.ncf || `FAC-${idx}`,
          date: f.fecha,
          clientName: f.nombreCliente || 'Cliente',
          clientIdNumber: f.rncCedulaCliente || '',
          ncf: f.ncf,
          subtotal: f.montoGravadoTotal || 0,
          itbis: f.ITBIS18 || 0,
          total: f.montoTotal || 0,
        })) || []);
        setSummary({
          totalInvoices: data.totales?.cantidadRegistros || data.facturas?.length || 0,
          totalSubtotal: data.totales?.montoGravadoTotal || 0,
          totalItbis: data.totales?.montoITBIS18 || 0,
          total: data.totales?.montoTotal || 0,
        });
      } else {
        setInvoices(data.facturas?.map((f: any, idx: number) => ({
          id: idx.toString(),
          number: f.ncf || `FAC-${idx}`,
          date: f.fecha,
          clientName: f.nombreProveedor || 'Proveedor',
          clientIdNumber: f.rncCedulaProveedor || '',
          ncf: f.ncf,
          subtotal: f.montoGravadoTotal || 0,
          itbis: f.ITBIS18 || 0,
          total: f.montoTotal || 0,
        })) || []);
        setSummary({
          totalInvoices: data.totales?.cantidadRegistros || data.facturas?.length || 0,
          totalSubtotal: data.totales?.montoGravadoTotal || 0,
          totalItbis: data.totales?.montoITBIS18 || 0,
          total: data.totales?.montoTotal || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = () => {
    fetchReport();
  };

  const handleExportExcel = async () => {
    if (!dateRange.start || !dateRange.end) return;
    
    const endpoint = selectedReport === '607' 
      ? '/api/reports/fiscal/607' 
      : '/api/reports/fiscal/606';
    
    const params = new URLSearchParams({
      startDate: dateRange.start,
      endDate: dateRange.end,
      format: 'excel'
    });

    try {
      const response = await fetch(`${endpoint}?${params}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${selectedReport}-${dateRange.start}_${dateRange.end}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  const handleExportPDF = async () => {
    if (!dateRange.start || !dateRange.end || invoices.length === 0) return;
    
    // Generar PDF usando window.print() con estilos específicos
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const totalGravado = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const totalItbis = invoices.reduce((sum, inv) => sum + inv.itbis, 0);
    const totalGeneral = invoices.reduce((sum, inv) => sum + inv.total, 0);
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte ${selectedReport}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #4F46E5; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .totals { margin-top: 20px; text-align: right; }
          .totals-row { margin: 5px 0; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>Reporte ${selectedReport === '607' ? '607 - Ventas' : '606 - Compras'}</h1>
        <p>Período: ${dateRange.start} al ${dateRange.end}</p>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>NCF</th>
              <th>${selectedReport === '607' ? 'Cliente' : 'Proveedor'}</th>
              <th>RNC</th>
              <th style="text-align:right">Gravado</th>
              <th style="text-align:right">ITBIS</th>
              <th style="text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoices.map(inv => `
              <tr>
                <td>${inv.date}</td>
                <td>${inv.ncf || inv.number}</td>
                <td>${inv.clientName}</td>
                <td>${inv.clientIdNumber || '-'}</td>
                <td style="text-align:right">${formatMoney(inv.subtotal)}</td>
                <td style="text-align:right">${formatMoney(inv.itbis)}</td>
                <td style="text-align:right">${formatMoney(inv.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="totals">
          <div class="totals-row"><strong>Total Gravado: ${formatMoney(totalGravado)}</strong></div>
          <div class="totals-row"><strong>Total ITBIS: ${formatMoney(totalItbis)}</strong></div>
          <div class="totals-row"><strong>Total General: ${formatMoney(totalGeneral)}</strong></div>
        </div>
        <button onclick="window.print()" style="margin-top:20px;padding:10px 20px;cursor:pointer;">
          Imprimir / Guardar PDF
        </button>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Calcular totales
  const totales = {
    cantidad: summary.totalInvoices,
    gravado: summary.totalSubtotal,
    itbis: summary.totalItbis,
    total: summary.total,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Reportes Fiscales</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calculator size={16} />
            <span>Formato DGII (Rep. Dominicana)</span>
          </div>
        </div>

        {/* Selector de reporte */}
        <div className="flex gap-4">
          <Button 
            variant={selectedReport === '607' ? 'primary' : 'outline'}
            onClick={() => {
              setSelectedReport('607');
              setInvoices([]);
            }}
          >
            Reporte 607 - Ventas
          </Button>
          <Button 
            variant={selectedReport === '606' ? 'primary' : 'outline'}
            onClick={() => {
              setSelectedReport('606');
              setInvoices([]);
            }}
          >
            Reporte 606 - Compras
          </Button>
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
            <div className="flex items-end gap-2">
              <Button onClick={handleGenerate} isLoading={isLoading}>
                Generar
              </Button>
            </div>
            <div className="flex items-end gap-2 justify-end">
              <Button variant="outline" onClick={handleExportExcel} disabled={invoices.length === 0}>
                <FileSpreadsheet size={16} /> Excel
              </Button>
              <Button variant="outline" onClick={handleExportPDF} disabled={invoices.length === 0}>
                <FileText size={16} /> PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <div className="text-sm text-slate-500">Registros</div>
            <div className="text-2xl font-bold text-slate-800">{totales.cantidad}</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <div className="text-sm text-slate-500">Total Gravado</div>
            <div className="text-2xl font-bold text-slate-800">{formatMoney(totales.gravado)}</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <div className="text-sm text-slate-500">ITBIS</div>
            <div className="text-2xl font-bold text-slate-800">{formatMoney(totales.itbis)}</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm bg-primary/5">
            <div className="text-sm text-slate-500">Total</div>
            <div className="text-2xl font-bold text-primary">{formatMoney(totales.total)}</div>
          </div>
        </div>

        {/* Tabla de detalle */}
        <div>
          {invoices.length === 0 ? (
            <div className="bg-white rounded-xl border border-border p-8 shadow-sm text-center text-slate-500">
              {dateRange.start && dateRange.end 
                ? "No hay registros para el período seleccionado"
                : "Seleccione un rango de fechas y haga clic en Generar"
              }
            </div>
          ) : (
            <Table headers={[
              "Fecha",
              "Número",
              selectedReport === '607' ? "Cliente" : "Proveedor",
              "RNC/Cédula",
              "Gravado",
              "ITBIS",
              "Total"
            ]}>
              {invoices.map((invoice, idx) => (
                <TableRow key={invoice.id || idx}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(invoice.date).toLocaleDateString('es-DO')}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {invoice.ncf || invoice.number}
                  </TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{invoice.clientIdNumber || "-"}</TableCell>
                  <TableCell className="text-right">{formatMoney(invoice.subtotal)}</TableCell>
                  <TableCell className="text-right">{formatMoney(invoice.itbis)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatMoney(invoice.total)}</TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}