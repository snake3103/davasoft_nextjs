/**
 * Utilidades para exportar reportes a diferentes formatos
 */
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Genera un buffer de Excel desde datos tabulares
 */
export async function generateExcelBuffer(
  data: Record<string, any>[],
  sheetName: string,
  title?: string
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  
  if (data.length > 0) {
    // Add headers
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);
    
    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2980B9" }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    
    // Add data rows
    data.forEach(row => {
      worksheet.addRow(Object.values(row));
    });
    
    // Auto-fit columns
    const maxWidths: number[] = [];
    headers.forEach((header, i) => {
      maxWidths[i] = Math.max(
        header.length,
        ...data.map(row => String(row[header] || "").length)
      );
      maxWidths[i] = Math.min(maxWidths[i], 50);
      worksheet.getColumn(i + 1).width = maxWidths[i] + 2;
    });
  }
  
  const bufferResult = await workbook.xlsx.writeBuffer();
  return Buffer.from(bufferResult as ArrayBuffer);
}

/**
 * Genera un PDF con tabla de datos
 */
export function generatePdfBuffer(
  data: Record<string, any>[],
  title: string,
  headers: string[]
): Buffer {
  const doc = new jsPDF();
  
  // Encabezado
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, 210, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 105, 16, { align: "center" });

  // Preparar datos para la tabla
  const tableData = data.map(row => headers.map(h => String(row[h] || "")));

  autoTable(doc, {
    startY: 30,
    head: [headers],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 10, right: 10 }
  });

  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Formatea un número como moneda RD$
 */
export function formatCurrency(value: number): string {
  return `RD$ ${value.toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Formatea un número como porcentaje
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
