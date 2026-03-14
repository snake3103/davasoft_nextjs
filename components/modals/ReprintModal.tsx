"use client";

import { useState, useRef } from "react";
import { Printer, FileText, Receipt, X, CheckCircle } from "lucide-react";

interface InvoicePrintData {
  id: string;
  number: string;
  date: string;
  client?: { name: string };
  items?: Array<{ quantity: number; price: number; description: string }>;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
}

interface ReprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoicePrintData | null;
  type?: "invoice" | "estimate";
}

export function ReprintModal({ isOpen, onClose, invoice, type = "invoice" }: ReprintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !invoice) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const content = printRef.current?.innerHTML || "";
      
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${type === "invoice" ? "Factura" : "Cotización"} #${invoice.number}</title>
              <style>
                @page { margin: 5mm; }
                body { 
                  font-family: 'Arial', sans-serif; 
                  font-size: 12px;
                  width: 210mm;
                  margin: 0 auto;
                  padding: 10px;
                }
                @media print {
                  body { width: auto; }
                }
                .header { text-align: center; margin-bottom: 20px; }
                .company { font-size: 18px; font-weight: bold; }
                .info { margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #f5f5f5; }
                .totals { text-align: right; margin-top: 20px; }
                .total-row { font-size: 16px; font-weight: bold; }
              </style>
            </head>
            <body>${content}</body>
          </html>
        `);
        printWindow.document.close();
        await new Promise(resolve => setTimeout(resolve, 500));
        printWindow.print();
      }
    } catch (error) {
      console.error("Print error:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const generatePDF = () => {
    const content = printRef.current?.innerHTML || "";
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${type === "invoice" ? "Factura" : "Cotización"} #${invoice.number}</title>
            <style>
              body { font-family: 'Arial', sans-serif; font-size: 12px; width: 800px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .company { font-size: 24px; font-weight: bold; }
              .info { margin: 15px 0; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background: #f5f5f5; }
              .totals { text-align: right; margin-top: 20px; }
              .total-row { font-size: 18px; font-weight: bold; }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-800">
              {type === "invoice" ? "Reimprimir Factura" : "Reimprimir Cotización"}
            </h2>
            <p className="text-sm text-slate-500">#{invoice.number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
            <FileText className="text-blue-600 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-blue-800">Información del documento</p>
              <p className="text-sm text-blue-600">
                Cliente: {invoice.client?.name || "N/A"}<br />
                Fecha: {new Date(invoice.date).toLocaleDateString()}<br />
                Total: ${Number(invoice.total).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Hidden printable content */}
        <div ref={printRef} className="hidden">
          <div className="header">
            <div className="company">DAVASOFT S.A.S</div>
            <div>NIT: 901.234.567-8</div>
            <div>Av. Principal #123, Santo Domingo</div>
          </div>
          
          <div className="info">
            <strong>{type === "invoice" ? "FACTURA" : "COTIZACIÓN"} #{invoice.number}</strong><br />
            Fecha: {new Date(invoice.date).toLocaleDateString()}<br />
            Cliente: {invoice.client?.name || "N/A"}
          </div>

          <table>
            <thead>
              <tr>
                <th>Cantidad</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.quantity}</td>
                  <td>{item.description}</td>
                  <td>${Number(item.price).toLocaleString()}</td>
                  <td>${Number(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals">
            <div>Subtotal: ${Number(invoice.subtotal).toLocaleString()}</div>
            <div>ITBIS (18%): ${Number(invoice.tax).toLocaleString()}</div>
            <div className="total-row">Total: ${Number(invoice.total).toLocaleString()}</div>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '10px' }}>
            {type === "estimate" ? "Esta cotización tiene validez de 30 días" : "Gracias por su preferencia"}
          </div>
        </div>

        <div className="p-6 border-t border-border space-y-3">
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90"
          >
            <Printer size={18} />
            {isPrinting ? "Imprimiendo..." : "Imprimir"}
          </button>
          
          <button
            onClick={generatePDF}
            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200"
          >
            <Receipt size={18} />
            Guardar como PDF
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 text-slate-500 font-medium hover:text-slate-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
