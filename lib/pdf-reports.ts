import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string | null;
  total: number;
  paid: number;
  balance: number;
  status: string;
  daysOverdue?: number;
  agingLabel?: string;
}

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  idNumber?: string | null;
  address?: string | null;
}

interface StatementData {
  client: Client;
  invoices: Invoice[];
  totals: {
    totalInvoices: number;
    totalPaid: number;
    totalBalance: number;
  };
  agingTotals: {
    current: number;
    over_0: number;
    over_30: number;
    over_60: number;
    over_90: number;
  };
  generatedAt: string;
}

export function generateClientStatementPDF(data: StatementData): Blob {
  const doc = new jsPDF();
  
  // Colores corporativos
  const primaryColor = [59, 130, 246] as [number, number, number]; // Azul
  
  // Encabezado
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ESTADO DE CUENTA", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha de Emisión: ${new Date(data.generatedAt).toLocaleDateString("es-DO")}`, 105, 30, { align: "center" });
  
  // Información del cliente
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMACIÓN DEL CLIENTE", 14, 55);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const clientInfo = [
    ["Cliente:", data.client.name],
    ["RNC/Cédula:", data.client.idNumber || "N/A"],
    ["Teléfono:", data.client.phone || "N/A"],
    ["Email:", data.client.email || "N/A"],
    ["Dirección:", data.client.address || "N/A"],
  ];
  
  let yPos = 62;
  clientInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value, 60, yPos);
    yPos += 7;
  });
  
  // Tabla de facturas
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLE DE FACTURAS", 14, yPos + 10);
  
  const tableData = data.invoices.map((inv: any) => [
    inv.number,
    new Date(inv.date).toLocaleDateString("es-DO"),
    inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("es-DO") : "N/A",
    inv.daysOverdue !== undefined && inv.daysOverdue > 0 
      ? `${inv.daysOverdue} días` 
      : "Al día",
    `$${inv.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`,
    `$${inv.paid.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`,
    `$${inv.balance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`,
    inv.status === "PAID" ? "Pagada" : inv.status === "PARTIAL" ? "Parcial" : "Pendiente",
  ]);
  
  autoTable(doc, {
    startY: yPos + 17,
    head: [["Nº Factura", "Fecha", "Vencimiento", "Días", "Total", "Pagado", "Saldo", "Estado"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 18 },
      2: { cellWidth: 18 },
      3: { cellWidth: 15, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 22, halign: "right", fontStyle: "bold" },
      7: { cellWidth: 20, halign: "center" },
    },
  });
  
  // Totales
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Caja de totales
  doc.setFillColor(245, 247, 250);
  doc.rect(120, finalY, 76, 30, "F");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Total Facturas:", 125, finalY + 8);
  doc.text("Total Pagado:", 125, finalY + 16);
  doc.setFont("helvetica", "bold");
  doc.text("Saldo Pendiente:", 125, finalY + 24);
  
  doc.setFont("helvetica", "normal");
  doc.text(`$${data.totals.totalInvoices.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`, 190, finalY + 8, { align: "right" });
  doc.text(`$${data.totals.totalPaid.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`, 190, finalY + 16, { align: "right" });
  
  // Color del saldo pendiente
  if (data.totals.totalBalance > 0) {
    doc.setTextColor(239, 68, 68); // Rojo
  } else {
    doc.setTextColor(16, 185, 129); // Verde
  }
  doc.setFont("helvetica", "bold");
  doc.text(
    `$${data.totals.totalBalance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`,
    190,
    finalY + 24,
    { align: "right" }
  );
  
  // Tabla de Antigüedad de Saldos (solo si hay saldo pendiente)
  if (data.totals.totalBalance > 0 && data.agingTotals) {
    finalY += 10;
    
    // Encabezado de sección
    doc.setFillColor(245, 158, 11); // Ámbar
    doc.rect(14, finalY, 182, 10, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("📊 ANTIGÜEDAD DE SALDOS (AGING)", 105, finalY + 6.5, { align: "center" });
    
    finalY += 12;
    
    const agingData = [
      ["🟢 Al Corriente", `$${data.agingTotals.current.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`],
      ["🟡 1-30 Días", `$${data.agingTotals.over_0.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`],
      ["🟠 31-60 Días", `$${data.agingTotals.over_30.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`],
      ["🔴 61-90 Días", `$${data.agingTotals.over_60.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`],
      ["🔴 +90 Días", `$${data.agingTotals.over_90.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`],
    ];
    
    autoTable(doc, {
      startY: finalY,
      head: [["Categoría", "Monto Pendiente"]],
      body: agingData,
      theme: "striped",
      headStyles: { 
        fillColor: [59, 130, 246], // Azul
        textColor: 255, 
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { 
          cellWidth: 95, 
          fontStyle: "bold",
          fontSize: 10,
        },
        1: { 
          cellWidth: 87, 
          halign: "right", 
          fontStyle: "bold",
          fontSize: 11,
        },
      },
    });
    
    finalY = (doc as any).lastAutoTable.finalY + 5;
    
    // Nota informativa
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("* Análisis de antigüedad basado en días de vencimiento", 105, finalY, { align: "center" });
  }
  
  // Pie de página
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Este documento es un estado de cuenta informativo.", 105, 280, { align: "center" });
  doc.text("Para cualquier consulta, por favor contáctenos.", 105, 285, { align: "center" });
  
  // Reset color
  doc.setTextColor(0, 0, 0);
  
  return doc.output("blob");
}

// ============================================
// ESTADO DE CUENTA DE PROVEEDORES
// ============================================

interface Expense {
  id: string;
  number: string;
  date: string;
  total: number;
  paid: number;
  balance: number;
  status: string;
  category: string;
}

interface Provider {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  idNumber?: string | null;
  address?: string | null;
}

interface ProviderStatementData {
  provider: Provider;
  expenses: Expense[];
  totals: {
    totalExpenses: number;
    totalPaid: number;
    totalBalance: number;
  };
  generatedAt: string;
}

export function generateProviderStatementPDF(data: ProviderStatementData): Blob {
  const doc = new jsPDF();
  
  // Colores corporativos
  const primaryColor = [239, 68, 68] as [number, number, number]; // Rojo para proveedores
  
  // Encabezado
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ESTADO DE CUENTA - PROVEEDOR", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha de Emisión: ${new Date(data.generatedAt).toLocaleDateString("es-DO")}`, 105, 30, { align: "center" });
  
  // Información del proveedor
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMACIÓN DEL PROVEEDOR", 14, 55);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const providerInfo = [
    ["Proveedor:", data.provider.name],
    ["RNC/Cédula:", data.provider.idNumber || "N/A"],
    ["Teléfono:", data.provider.phone || "N/A"],
    ["Email:", data.provider.email || "N/A"],
    ["Dirección:", data.provider.address || "N/A"],
  ];
  
  let yPos = 62;
  providerInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value, 60, yPos);
    yPos += 7;
  });
  
  // Tabla de gastos/compras
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLE DE COMPRAS", 14, yPos + 10);
  
  const tableData = data.expenses.map((exp) => [
    exp.number,
    new Date(exp.date).toLocaleDateString("es-DO"),
    exp.category,
    `$${exp.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`,
    `$${exp.paid.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`,
    `$${exp.balance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`,
    exp.status === "PAID" ? "Pagada" : "Pendiente",
  ]);
  
  autoTable(doc, {
    startY: yPos + 17,
    head: [["Nº Compra", "Fecha", "Categoría", "Total", "Pagado", "Saldo", "Estado"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [255, 245, 245] },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 22 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 25, halign: "right", fontStyle: "bold" },
      6: { cellWidth: 25, halign: "center" },
    },
  });
  
  // Totales
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Caja de totales
  doc.setFillColor(255, 245, 245);
  doc.rect(120, finalY, 76, 30, "F");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Total Compras:", 125, finalY + 8);
  doc.text("Total Pagado:", 125, finalY + 16);
  doc.setFont("helvetica", "bold");
  doc.text("Saldo Pendiente:", 125, finalY + 24);
  
  doc.setFont("helvetica", "normal");
  doc.text(`$${data.totals.totalExpenses.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`, 190, finalY + 8, { align: "right" });
  doc.text(`$${data.totals.totalPaid.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`, 190, finalY + 16, { align: "right" });
  
  // Color del saldo pendiente
  if (data.totals.totalBalance > 0) {
    doc.setTextColor(239, 68, 68); // Rojo
  } else {
    doc.setTextColor(16, 185, 129); // Verde
  }
  doc.setFont("helvetica", "bold");
  doc.text(
    `$${data.totals.totalBalance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`,
    190,
    finalY + 24,
    { align: "right" }
  );
  
  // Pie de página
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Este documento es un estado de cuenta informativo.", 105, 280, { align: "center" });
  doc.text("Para cualquier consulta, por favor contáctenos.", 105, 285, { align: "center" });
  
  // Reset color
  doc.setTextColor(0, 0, 0);
  
  return doc.output("blob");
}
