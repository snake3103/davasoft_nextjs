"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

/**
 * Tipos para Flujo de Caja Proyectado
 */

export interface CashFlowProjection {
  accountId: string;
  accountName: string;
  currency: string;
  currentBalance: number;
  projectedInflows: CashFlowItem[];
  projectedOutflows: CashFlowItem[];
  projectedBalance: number;
  summary: {
    totalInflows: number;
    totalOutflows: number;
    netFlow: number;
    daysInPeriod: number;
    averageDailyInflow: number;
    averageDailyOutflow: number;
  };
  alerts: CashFlowAlert[];
}

export interface CashFlowItem {
  id: string;
  type: "INVOICE" | "EXPENSE" | "PAYMENT" | "INCOME";
  documentNumber: string;
  client?: string;
  description: string;
  dueDate: Date;
  amount: number;
  daysUntilDue: number;
  status: string;
  isOverdue: boolean;
}

export interface CashFlowAlert {
  type: "INFO" | "WARNING" | "CRITICAL";
  message: string;
  affectedItems: string[];
}

/**
 * Obtiene el saldo actual de una cuenta bancaria
 */
async function getCurrentBalance(
  accountId: string,
  organizationId: string
): Promise<{ balance: number; name: string; currency: string }> {
  const account = await prisma.bankAccount.findFirst({
    where: { id: accountId, organizationId },
    select: {
      name: true,
      currency: true,
      currentBalance: true,
    },
  });

  if (!account) {
    throw new Error("Cuenta bancaria no encontrada");
  }

  return {
    balance: Number(account.currentBalance),
    name: account.name,
    currency: account.currency,
  };
}

/**
 * Obtiene facturas pendientes por vencer (clientes que nos deben)
 */
async function getPendingInvoices(
  accountId: string,
  organizationId: string,
  endDate: Date
): Promise<CashFlowItem[]> {
  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId,
      status: { in: ["SENT", "PARTIAL"] },
      dueDate: { lte: endDate },
    },
    include: {
      client: {
        select: { name: true },
      },
      payments: {
        select: { amount: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();

  return invoices
    .map((invoice) => {
      const paidAmount = invoice.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
      const pendingAmount = Number(invoice.total) - paidAmount;
      const daysUntilDue = Math.ceil(
        (invoice.dueDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: invoice.id,
        type: "INVOICE" as const,
        documentNumber: invoice.number,
        client: invoice.client.name,
        description: `Factura ${invoice.number}`,
        dueDate: invoice.dueDate!,
        amount: pendingAmount,
        daysUntilDue,
        status: invoice.status,
        isOverdue: daysUntilDue < 0,
      };
    })
    .filter((item) => item.amount > 0);
}

/**
 * Obtiene gastos pendientes por vencer (facturas de proveedores)
 */
async function getPendingExpenses(
  accountId: string,
  organizationId: string,
  endDate: Date
): Promise<CashFlowItem[]> {
  const expenses = await prisma.expense.findMany({
    where: {
      organizationId,
      status: "PENDING",
      date: { lte: endDate },
    },
    orderBy: { date: "asc" },
  });

  const now = new Date();

  return expenses.map((expense) => {
    const daysUntilDue = Math.ceil(
      (expense.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      id: expense.id,
      type: "EXPENSE" as const,
      documentNumber: expense.number,
      description: expense.description || `Gasto ${expense.number}`,
      dueDate: expense.date,
      amount: Number(expense.total),
      daysUntilDue,
      status: expense.status,
      isOverdue: daysUntilDue < 0,
    };
  });
}

/**
 * Obtiene ingresos pendientes por recibir
 */
async function getPendingIncomes(
  accountId: string,
  organizationId: string,
  endDate: Date
): Promise<CashFlowItem[]> {
  const incomes = await prisma.income.findMany({
    where: {
      organizationId,
      bankAccountId: accountId,
      status: "PENDING",
      date: { lte: endDate },
    },
    include: {
      client: {
        select: { name: true },
      },
    },
    orderBy: { date: "asc" },
  });

  const now = new Date();

  return incomes.map((income) => {
    const daysUntilDue = Math.ceil(
      (income.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      id: income.id,
      type: "INCOME" as const,
      documentNumber: income.number,
      client: income.client?.name,
      description: income.description || `Ingreso ${income.number}`,
      dueDate: income.date,
      amount: Number(income.amount),
      daysUntilDue,
      status: income.status,
      isOverdue: daysUntilDue < 0,
    };
  });
}

/**
 * Obtiene pagos programados
 */
async function getScheduledPayments(
  accountId: string,
  organizationId: string,
  endDate: Date
): Promise<CashFlowItem[]> {
  // Aquí se podrían incluir pagos programados de un calendario de pagos
  // Por ahora, buscamos pagos de facturas de compra pendientes
  const payments = await prisma.payment.findMany({
    where: {
      expense: {
        organizationId,
      },
      expenseId: { not: null },
      createdAt: { lte: endDate },
    },
    include: {
      expense: {
        select: {
          number: true,
          description: true,
          total: true,
          date: true,
          status: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  const now = new Date();

  return payments
    .filter((payment) => payment.expense?.status === "PENDING")
    .map((payment) => {
      const daysUntilDue = Math.ceil(
        (payment.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: payment.id,
        type: "PAYMENT" as const,
        documentNumber: payment.expense?.number || payment.id,
        description: payment.expense?.description || `Pago ${payment.reference || ""}`,
        dueDate: payment.date,
        amount: Number(payment.amount),
        daysUntilDue,
        status: payment.expense?.status || "PENDING",
        isOverdue: daysUntilDue < 0,
      };
    });
}

/**
 * Genera alertas basadas en el análisis del flujo de caja
 */
function generateAlerts(
  inflows: CashFlowItem[],
  outflows: CashFlowItem[],
  netFlow: number
): CashFlowAlert[] {
  const alerts: CashFlowAlert[] = [];

  // Alerta si hay flujo negativo proyectado
  if (netFlow < 0) {
    alerts.push({
      type: "CRITICAL",
      message: `Flujo de caja proyectado negativo: ${Math.abs(netFlow).toFixed(2)}`,
      affectedItems: [...inflows.map((i) => i.id), ...outflows.map((o) => o.id)],
    });
  }

  // Alerta si hay facturas vencidas
  const overdueInflows = inflows.filter((i) => i.isOverdue);
  if (overdueInflows.length > 0) {
    alerts.push({
      type: "WARNING",
      message: `${overdueInflows.length} facturas vencidas por cobrar`,
      affectedItems: overdueInflows.map((i) => i.id),
    });
  }

  // Alerta si hay muchos outflows próximos
  const imminentOutflows = outflows.filter((o) => o.daysUntilDue <= 3 && o.daysUntilDue >= 0);
  if (imminentOutflows.length > 0) {
    const total = imminentOutflows.reduce((sum, o) => sum + o.amount, 0);
    alerts.push({
      type: "INFO",
      message: `${imminentOutflows.length} pagos próximos por ${total.toFixed(2)}`,
      affectedItems: imminentOutflows.map((o) => o.id),
    });
  }

  return alerts;
}

/**
 * Obtiene la proyección de flujo de caja
 * 
 * @param accountId - ID de la cuenta bancaria
 * @param startDate - Fecha de inicio del período
 * @param endDate - Fecha de fin del período
 * @returns Proyección de flujo de caja con inflows, outflows y alertas
 */
export async function getProjectedCashFlow(
  accountId: string,
  startDate: Date,
  endDate: Date
): Promise<CashFlowProjection> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  // Obtener saldo actual
  const accountInfo = await getCurrentBalance(accountId, organizationId);

  // Obtener todos los componentes del flujo de caja
  const [inflows, outflows] = await Promise.all([
    getPendingInvoices(accountId, organizationId, endDate),
    Promise.all([
      getPendingExpenses(accountId, organizationId, endDate),
      getScheduledPayments(accountId, organizationId, endDate),
    ]).then(([expenses, payments]) => [...expenses, ...payments]),
  ]);

  // Calcular totales
  const totalInflows = inflows.reduce((sum, item) => sum + item.amount, 0);
  const totalOutflows = outflows.reduce((sum, item) => sum + item.amount, 0);
  const netFlow = totalInflows - totalOutflows;
  const projectedBalance = accountInfo.balance + netFlow;

  // Calcular días del período
  const daysInPeriod = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Generar alertas
  const alerts = generateAlerts(inflows, outflows, netFlow);

  return {
    accountId,
    accountName: accountInfo.name,
    currency: accountInfo.currency,
    currentBalance: accountInfo.balance,
    projectedInflows: inflows,
    projectedOutflows: outflows,
    projectedBalance,
    summary: {
      totalInflows,
      totalOutflows,
      netFlow,
      daysInPeriod,
      averageDailyInflow: daysInPeriod > 0 ? totalInflows / daysInPeriod : 0,
      averageDailyOutflow: daysInPeriod > 0 ? totalOutflows / daysInPeriod : 0,
    },
    alerts,
  };
}

/**
 * Obtiene las cuentas bancarias disponibles para proyección
 */
export async function getCashFlowAccounts(
  organizationId: string
): Promise<Array<{ id: string; name: string; balance: number; currency: string }>> {
  const accounts = await prisma.bankAccount.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      currentBalance: true,
      currency: true,
    },
    orderBy: { name: "asc" },
  });

  return accounts.map((account) => ({
    id: account.id,
    name: account.name,
    balance: Number(account.currentBalance),
    currency: account.currency,
  }));
}

/**
 * Obtiene resumen de flujo de caja por rangos de tiempo
 */
export async function getCashFlowSummary(
  accountId: string,
  organizationId: string
): Promise<{
  today: number;
  thisWeek: number;
  thisMonth: number;
  overdue: number;
}> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [inflows, outflows] = await Promise.all([
    getPendingInvoices(accountId, organizationId, endOfDay),
    Promise.all([
      getPendingExpenses(accountId, organizationId, endOfDay),
      getScheduledPayments(accountId, organizationId, endOfDay),
    ]).then(([expenses, payments]) => [...expenses, ...payments]),
  ]);

  const todayInflows = inflows
    .filter((i) => i.dueDate >= startOfDay && i.dueDate <= endOfDay)
    .reduce((sum, i) => sum + i.amount, 0);
  const todayOutflows = outflows
    .filter((o) => o.dueDate >= startOfDay && o.dueDate <= endOfDay)
    .reduce((sum, o) => sum + o.amount, 0);

  const weekInflows = inflows
    .filter((i) => i.dueDate >= startOfWeek && i.dueDate <= endOfDay)
    .reduce((sum, i) => sum + i.amount, 0);
  const weekOutflows = outflows
    .filter((o) => o.dueDate >= startOfWeek && o.dueDate <= endOfDay)
    .reduce((sum, o) => sum + o.amount, 0);

  const monthInflows = inflows
    .filter((i) => i.dueDate >= startOfMonth && i.dueDate <= endOfDay)
    .reduce((sum, i) => sum + i.amount, 0);
  const monthOutflows = outflows
    .filter((o) => o.dueDate >= startOfMonth && o.dueDate <= endOfDay)
    .reduce((sum, o) => sum + o.amount, 0);

  const overdueInflows = inflows
    .filter((i) => i.isOverdue)
    .reduce((sum, i) => sum + i.amount, 0);

  return {
    today: todayInflows - todayOutflows,
    thisWeek: weekInflows - weekOutflows,
    thisMonth: monthInflows - monthOutflows,
    overdue: overdueInflows,
  };
}
