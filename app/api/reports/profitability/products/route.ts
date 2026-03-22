import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { generateProfitabilityByProduct } from "@/app/actions/reports/profitability";
import ExcelJS from "exceljs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const categoryId = searchParams.get("categoryId");
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

    const report = await generateProfitabilityByProduct(organizationId, start, end, categoryId || undefined);

    // Exportar a Excel
    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Rentabilidad Productos");
      
      // Headers
      const headers = ["Código", "Producto", "Categoría", "Cantidad", "Ventas Netas", "Costo Total", "Utilidad Bruta", "Margen %"];
      worksheet.addRow(headers);
      
      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9E1F2" }
      };
      
      // Data rows
      report.productos.forEach(p => {
        worksheet.addRow([
          p.codigo,
          p.nombre,
          p.categoria,
          p.cantidadNeta,
          p.ventasNetas,
          p.costoTotal,
          p.utilidadBruta,
          p.margenBruto
        ]);
      });
      
      // Add totals row
      const totalRow = worksheet.addRow([
        "TOTALES",
        "",
        "",
        report.productos.length,
        report.totales.totalVentasNetas,
        report.totales.totalCostos,
        report.totales.totalUtilidad,
        report.totales.margenPromedio
      ]);
      totalRow.font = { bold: true };
      totalRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFB4C6E7" }
      };
      
      // Auto-fit columns
      headers.forEach((_, i) => {
        worksheet.getColumn(i + 1).width = 15;
      });
      worksheet.getColumn(2).width = 35;
      worksheet.getColumn(3).width = 20;

      const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="rentabilidad-productos-${report.periodo}.xlsx"`
        }
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating profitability report:", error);
    return errorResponse("Error generando reporte de rentabilidad");
  }
}
