import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { generateCustomerAgingReport, generateVendorAgingReport } from "@/app/actions/reports/aging";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "CUSTOMER";
  const date = searchParams.get("date");
  const format = searchParams.get("format") || "json";

  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    if (!date) {
      return errorResponse("Fecha requerida", 400);
    }

    const reportDate = new Date(date);
    
    const report = type === "CUSTOMER" 
      ? await generateCustomerAgingReport(organizationId, reportDate)
      : await generateVendorAgingReport(organizationId, reportDate);

    // Exportar a Excel
    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Aging");
      
      // Headers
      const headers = ["Entidad", "RNC", "0-30 días", "31-60 días", "61-90 días", "+90 días", "Total"];
      worksheet.addRow(headers);
      
      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9E1F2" }
      };
      
      // Data rows
      report.movimientos.forEach(m => {
        worksheet.addRow([
          m.entidad,
          m.rnc,
          m.current,
          m.days31_60,
          m.days61_90,
          m.days91_plus,
          m.total
        ]);
      });
      
      // Add totals row
      const totalRow = worksheet.addRow([
        "TOTALES",
        "",
        report.totales.totalCurrent,
        report.totales.totalDays31_60,
        report.totales.totalDays61_90,
        report.totales.totalDays91_plus,
        report.totales.totalGeneral
      ]);
      totalRow.font = { bold: true };
      totalRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFB4C6E7" }
      };
      
      // Auto-fit columns
      worksheet.getColumn(1).width = 35;
      worksheet.getColumn(2).width = 15;
      for (let i = 3; i <= 7; i++) {
        worksheet.getColumn(i).width = 15;
      }

      const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="aging-${type.toLowerCase()}-${date}.xlsx"`
        }
      });
    }

    // Exportar a PDF
    if (format === "pdf") {
      const doc = new jsPDF();
      const title = type === "CUSTOMER" ? "CUENTAS POR COBRAR" : "CUENTAS POR PAGAR";
      
      // Encabezado
      doc.setFillColor(type === "CUSTOMER" ? 39 : 192, type === "CUSTOMER" ? 174 : 57, type === "CUSTOMER" ? 196 : 81);
      doc.rect(0, 0, 210, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(`REPORTE DE ANTIGÜEDAD - ${title}`, 105, 18, { align: "center" });
      doc.setFontSize(10);
      doc.text(`Fecha de Corte: ${date}`, 105, 26, { align: "center" });

      // Tabla
      const tableData = report.movimientos.map(m => [
        m.entidad.substring(0, 25),
        m.current.toFixed(2),
        m.days31_60.toFixed(2),
        m.days61_90.toFixed(2),
        m.days91_plus.toFixed(2),
        m.total.toFixed(2)
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["Entidad", "0-30 días", "31-60 días", "61-90 días", "+90 días", "Total"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 10, right: 10 }
      });

      // Totales
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFillColor(236, 240, 241);
      doc.rect(10, finalY, 190, 20, "F");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text("TOTALES:", 15, finalY + 8);
      doc.text(`RD$ ${report.totales.totalCurrent.toFixed(2)}`, 50, finalY + 8);
      doc.text(`RD$ ${report.totales.totalDays31_60.toFixed(2)}`, 85, finalY + 8);
      doc.text(`RD$ ${report.totales.totalDays61_90.toFixed(2)}`, 120, finalY + 8);
      doc.text(`RD$ ${report.totales.totalDays91_plus.toFixed(2)}`, 155, finalY + 8);
      doc.setFont("helvetica", "bold");
      doc.text(`RD$ ${report.totales.totalGeneral.toFixed(2)}`, 190, finalY + 8, { align: "right" });

      const pdfBuffer = doc.output("arraybuffer");

      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="aging-${type.toLowerCase()}-${date}.pdf"`
        }
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating aging report:", error);
    return errorResponse("Error generando reporte de antigüedad");
  }
}
