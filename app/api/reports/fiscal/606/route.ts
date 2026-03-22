import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { generateReport606 } from "@/app/actions/reports/fiscal";
import ExcelJS from "exceljs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
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

    const report = await generateReport606(organizationId, start, end);

    // Exportar a Excel
    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Reporte 606");
      
      // Headers
      const headers = ["Fecha", "NCF", "RNC Proveedor", "Nombre Proveedor", "Monto Gravado", "Monto Exento", "ITBIS 18%", "Monto Total"];
      worksheet.addRow(headers);
      
      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9E1F2" }
      };
      
      // Data rows
      report.facturas.forEach(f => {
        worksheet.addRow([
          f.fecha,
          f.ncf,
          f.rncCedulaProveedor,
          f.nombreProveedor,
          f.montoGravadoTotal,
          f.montoExento,
          f.ITBIS18,
          f.montoTotal
        ]);
      });
      
      // Auto-fit columns
      worksheet.getColumn(1).width = 12;
      worksheet.getColumn(2).width = 15;
      worksheet.getColumn(3).width = 18;
      worksheet.getColumn(4).width = 35;
      for (let i = 5; i <= 8; i++) {
        worksheet.getColumn(i).width = 15;
      }

      const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="reporte-606-${report.periodo}.xlsx"`
        }
      });
    }

    // JSON por defecto
    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating report 606:", error);
    return errorResponse("Error generando reporte 606");
  }
}
