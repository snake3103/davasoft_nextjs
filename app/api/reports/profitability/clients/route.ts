import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { generateProfitabilityByClient, getTopProfitabilityClients } from "@/app/actions/reports/profitability";
import ExcelJS from "exceljs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const limit = searchParams.get("limit");
  const top = searchParams.get("top");
  const format = searchParams.get("format") || "json";

  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    if (!startDate || !endDate) {
      return errorResponse("Fechas requeridas", 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);

    let report;
    if (top === "true") {
      report = await getTopProfitabilityClients(organizationId, start, end, parseInt(limit || "10"));
    } else {
      report = await generateProfitabilityByClient(organizationId, start, end);
    }

    // Exportar a Excel
    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Rentabilidad Clientes");
      
      // Add title row for each client
      let rowNum = 1;
      
      for (const client of report) {
        // Client header
        worksheet.addRow([`Cliente: ${client.nombre}`, `Código: ${client.codigo}`, `Ranking: ${client.totales.ranking}`]);
        worksheet.getRow(rowNum).font = { bold: true };
        worksheet.getRow(rowNum).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD9E1F2" }
        };
        worksheet.mergeCells(rowNum, 1, rowNum, 6);
        rowNum++;
        
        // Column headers for invoices
        worksheet.addRow(["Fecha", "NCF/Factura", "Total", "Costo", "Utilidad", "Margen"]);
        worksheet.getRow(rowNum).font = { bold: true };
        worksheet.getRow(rowNum).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFB4C6E7" }
        };
        rowNum++;
        
        // Invoice rows
        for (const fac of client.facturas) {
          worksheet.addRow([fac.fecha, fac.ncf, fac.total, fac.costo, fac.utilidad, `${fac.margen}%`]);
          rowNum++;
        }
        
        // Subtotal row
        const subtotalRow = worksheet.addRow([
          "SUBTOTAL",
          "",
          client.totales.totalVentas,
          client.totales.totalCostos,
          client.totales.totalUtilidad,
          ""
        ]);
        subtotalRow.font = { bold: true };
        subtotalRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFECF0F1" }
        };
        rowNum++;
        
        // Empty row separator
        worksheet.addRow([]);
        rowNum++;
      }
      
      // Auto-fit columns
      worksheet.getColumn(1).width = 15;
      worksheet.getColumn(2).width = 20;
      for (let i = 3; i <= 6; i++) {
        worksheet.getColumn(i).width = 15;
      }

      const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="rentabilidad-clientes.xlsx"`
        }
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating client profitability:", error);
    return errorResponse("Error generando reporte de rentabilidad por cliente");
  }
}
