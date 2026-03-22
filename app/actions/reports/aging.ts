"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// ============================================
// TIPOS PARA REPORTE DE AGING
// ============================================

export interface AgingInvoice {
  ncf: string;
  fecha: string;
  fechaVencimiento: string;
  diasVencido: number;
  monto: number;
  saldo: number;
}

export interface AgingMovement {
  entityId: string;
  entidad: string;
  rnc: string;
  current: number;
  days31_60: number;
  days61_90: number;
  days91_plus: number;
  total: number;
  facturas: AgingInvoice[];
}

export interface AgingReport {
  tipo: "CUSTOMER" | "VENDOR";
  fechaCorte: string;
  movimientos: AgingMovement[];
  totales: {
    totalCurrent: number;
    totalDays31_60: number;
    totalDays61_90: number;
    totalDays91_plus: number;
    totalGeneral: number;
  };
}

// ============================================
// REPORTE AGING DE CLIENTES (CUENTAS POR COBRAR)
// ============================================

export async function generateCustomerAgingReport(
  organizationId: string,
  date: Date
): Promise<AgingReport> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("No autorizado");
  }

  // Obtener invoices con saldo pendiente
  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId,
      status: { in: ["SENT", "PARTIAL", "PAID"] }, // Incluir pagadas para calcular saldo
      date: { lte: date }
    },
    include: {
      client: true,
      payments: true
    }
  });

  // Calcular saldo por factura
  const invoiceBalances = invoices.map(invoice => {
    const total = Number(invoice.total);
    const paid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = total - paid;
    
    // Calcular días de vencimiento
    const dueDate = invoice.dueDate || new Date(invoice.date);
    const daysDiff = Math.floor((date.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      invoice,
      balance,
      dueDate,
      daysDiff
    };
  }).filter(item => item.balance > 0.01); // Solo facturas con saldo pendiente

  // Agrupar por cliente
  const clientMap = new Map<string, {
    client: any;
    facturas: {
      ncf: string;
      fecha: string;
      fechaVencimiento: string;
      diasVencido: number;
      monto: number;
      saldo: number;
    }[];
    current: number;
    days31_60: number;
    days61_90: number;
    days91_plus: number;
  }>();

  for (const item of invoiceBalances) {
    const clientId = item.invoice.clientId;
    const existing = clientMap.get(clientId) || {
      client: item.invoice.client,
      facturas: [],
      current: 0,
      days31_60: 0,
      days61_90: 0,
      days91_plus: 0
    };

    // Clasificar por bucket de antigüedad
    if (item.daysDiff <= 0) {
      existing.current += item.balance;
    } else if (item.daysDiff <= 30) {
      existing.current += item.balance;
    } else if (item.daysDiff <= 60) {
      existing.days31_60 += item.balance;
    } else if (item.daysDiff <= 90) {
      existing.days61_90 += item.balance;
    } else {
      existing.days91_plus += item.balance;
    }

    existing.facturas.push({
      ncf: item.invoice.number,
      fecha: new Date(item.invoice.date).toLocaleDateString("es-DO"),
      fechaVencimiento: new Date(item.dueDate).toLocaleDateString("es-DO"),
      diasVencido: Math.max(0, item.daysDiff),
      monto: Number(item.invoice.total),
      saldo: item.balance
    });

    clientMap.set(clientId, existing);
  }

  // Transformar a formato de aging
  const movimientos: AgingMovement[] = Array.from(clientMap.entries())
    .map(([entityId, data]) => ({
      entityId,
      entidad: data.client.name,
      rnc: data.client.idNumber || "",
      current: Math.round(data.current * 100) / 100,
      days31_60: Math.round(data.days31_60 * 100) / 100,
      days61_90: Math.round(data.days61_90 * 100) / 100,
      days91_plus: Math.round(data.days91_plus * 100) / 100,
      total: Math.round((data.current + data.days31_60 + data.days61_90 + data.days91_plus) * 100) / 100,
      facturas: data.facturas
    }))
    .filter(m => m.total > 0)
    .sort((a, b) => b.total - a.total);

  // Calcular totales
  const totales = movimientos.reduce(
    (acc, mov) => ({
      totalCurrent: acc.totalCurrent + mov.current,
      totalDays31_60: acc.totalDays31_60 + mov.days31_60,
      totalDays61_90: acc.totalDays61_90 + mov.days61_90,
      totalDays91_plus: acc.totalDays91_plus + mov.days91_plus,
      totalGeneral: 0
    }),
    { totalCurrent: 0, totalDays31_60: 0, totalDays61_90: 0, totalDays91_plus: 0, totalGeneral: 0 }
  );

  totales.totalGeneral = totales.totalCurrent + totales.totalDays31_60 + totales.totalDays61_90 + totales.totalDays91_plus;

  return {
    tipo: "CUSTOMER",
    fechaCorte: date.toISOString().split("T")[0],
    movimientos,
    totales: {
      totalCurrent: Math.round(totales.totalCurrent * 100) / 100,
      totalDays31_60: Math.round(totales.totalDays31_60 * 100) / 100,
      totalDays61_90: Math.round(totales.totalDays61_90 * 100) / 100,
      totalDays91_plus: Math.round(totales.totalDays91_plus * 100) / 100,
      totalGeneral: Math.round(totales.totalGeneral * 100) / 100
    }
  };
}

// ============================================
// REPORTE AGING DE PROVEEDORES (CUENTAS POR PAGAR)
// ============================================

export async function generateVendorAgingReport(
  organizationId: string,
  date: Date
): Promise<AgingReport> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("No autorizado");
  }

  // Obtener expenses con saldo pendiente
  const expenses = await prisma.expense.findMany({
    where: {
      organizationId,
      status: { in: ["PENDING", "PAID"] },
      date: { lte: date }
    },
    include: {
      payments: true
    }
  });

  // Calcular saldo por gasto
  const expenseBalances = expenses.map(expense => {
    const total = Number(expense.total);
    const paid = expense.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = total - paid;
    
    // Calcular días de vencimiento (asumiendo 30 días por defecto)
    const dueDate = new Date(expense.date);
    dueDate.setDate(dueDate.getDate() + 30);
    const daysDiff = Math.floor((date.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      expense,
      balance,
      dueDate,
      daysDiff
    };
  }).filter(item => item.balance > 0.01);

  // Agrupar por proveedor (usando el nombre del proveedor)
  const vendorMap = new Map<string, {
    provider: string;
    idNumber?: string | null;
    facturas: {
      ncf: string;
      fecha: string;
      fechaVencimiento: string;
      diasVencido: number;
      monto: number;
      saldo: number;
    }[];
    current: number;
    days31_60: number;
    days61_90: number;
    days91_plus: number;
  }>();

  for (const item of expenseBalances) {
    const providerName = item.expense.provider;
    const existing = vendorMap.get(providerName) || {
      provider: providerName,
      idNumber: null,
      facturas: [],
      current: 0,
      days31_60: 0,
      days61_90: 0,
      days91_plus: 0
    };

    // Clasificar por bucket de antigüedad
    if (item.daysDiff <= 0) {
      existing.current += item.balance;
    } else if (item.daysDiff <= 30) {
      existing.current += item.balance;
    } else if (item.daysDiff <= 60) {
      existing.days31_60 += item.balance;
    } else if (item.daysDiff <= 90) {
      existing.days61_90 += item.balance;
    } else {
      existing.days91_plus += item.balance;
    }

    existing.facturas.push({
      ncf: item.expense.number,
      fecha: new Date(item.expense.date).toLocaleDateString("es-DO"),
      fechaVencimiento: new Date(item.dueDate).toLocaleDateString("es-DO"),
      diasVencido: Math.max(0, item.daysDiff),
      monto: Number(item.expense.total),
      saldo: item.balance
    });

    vendorMap.set(providerName, existing);
  }

  // Transformar a formato de aging
  const movimientos: AgingMovement[] = Array.from(vendorMap.entries())
    .map(([entityId, data]) => ({
      entityId,
      entidad: data.provider,
      rnc: data.idNumber || "",
      current: Math.round(data.current * 100) / 100,
      days31_60: Math.round(data.days31_60 * 100) / 100,
      days61_90: Math.round(data.days61_90 * 100) / 100,
      days91_plus: Math.round(data.days91_plus * 100) / 100,
      total: Math.round((data.current + data.days31_60 + data.days61_90 + data.days91_plus) * 100) / 100,
      facturas: data.facturas
    }))
    .filter(m => m.total > 0)
    .sort((a, b) => b.total - a.total);

  // Calcular totales
  const totales = movimientos.reduce(
    (acc, mov) => ({
      totalCurrent: acc.totalCurrent + mov.current,
      totalDays31_60: acc.totalDays31_60 + mov.days31_60,
      totalDays61_90: acc.totalDays61_90 + mov.days61_90,
      totalDays91_plus: acc.totalDays91_plus + mov.days91_plus,
      totalGeneral: 0
    }),
    { totalCurrent: 0, totalDays31_60: 0, totalDays61_90: 0, totalDays91_plus: 0, totalGeneral: 0 }
  );

  totales.totalGeneral = totales.totalCurrent + totales.totalDays31_60 + totales.totalDays61_90 + totales.totalDays91_plus;

  return {
    tipo: "VENDOR",
    fechaCorte: date.toISOString().split("T")[0],
    movimientos,
    totales: {
      totalCurrent: Math.round(totales.totalCurrent * 100) / 100,
      totalDays31_60: Math.round(totales.totalDays31_60 * 100) / 100,
      totalDays61_90: Math.round(totales.totalDays61_90 * 100) / 100,
      totalDays91_plus: Math.round(totales.totalDays91_plus * 100) / 100,
      totalGeneral: Math.round(totales.totalGeneral * 100) / 100
    }
  };
}
