"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Decimal } from "decimal.js";

// ============================================
// PAGOS A FACTURAS Y GASTOS
// ============================================

export async function registerPayment(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const invoiceId = formData.get("invoiceId") as string;
    const expenseId = formData.get("expenseId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const method = formData.get("method") as string;
    const reference = formData.get("reference") as string;
    const date = formData.get("date") as string;

    if (!invoiceId && !expenseId) {
      return { error: "Debe seleccionar una factura o gasto" };
    }

    if (isNaN(amount) || amount <= 0) {
      return { error: "El monto debe ser mayor a 0" };
    }

    const organizationId = session.user.organizationId;

    // Verificar que el documento existe y pertenece a la organización
    let document;
    let documentType;
    
    if (invoiceId) {
      document = await prisma.invoice.findUnique({
        where: { id: invoiceId, organizationId },
        include: { client: true },
      });
      documentType = "INVOICE";
      
      if (!document) {
        return { error: "Factura no encontrada" };
      }
    } else {
      document = await prisma.expense.findUnique({
        where: { id: expenseId, organizationId },
        include: { category: true },
      });
      documentType = "EXPENSE";
      
      if (!document) {
        return { error: "Gasto no encontrado" };
      }
    }

    // Verificar si ya está totalmente pagado
    const existingPayments = await prisma.payment.findMany({
      where: {
        ...(invoiceId ? { invoiceId } : { expenseId }),
      },
    });

    const totalPaid = existingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remaining = Number(document.total) - totalPaid;

    if (remaining <= 0) {
      return { error: "El documento ya está totalmente pagado" };
    }

    if (amount > remaining) {
      return { error: `El monto no puede ser mayor al saldo pendiente (RD$${remaining.toFixed(2)})` };
    }

    // Crear el pago
    const payment = await prisma.payment.create({
      data: {
        date: new Date(date),
        amount: new Decimal(amount),
        method: method as any,
        reference: reference || null,
        invoiceId: invoiceId || null,
        expenseId: expenseId || null,
      },
    });

    // Actualizar el estado del documento
    const newTotalPaid = totalPaid + amount;
    const isFullyPaid = Math.abs(newTotalPaid - Number(document.total)) < 0.01;

    if (invoiceId) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: isFullyPaid ? "PAID" : "PARTIAL",
        },
      });
    } else {
      await prisma.expense.update({
        where: { id: expenseId },
        data: {
          status: isFullyPaid ? "PAID" : "PENDING",
        },
      });
    }

    // Generar asiento contable para el pago
    if (documentType === "INVOICE") {
      await generatePaymentJournalEntry(payment.id, "INVOICE");
    } else {
      await generatePaymentJournalEntry(payment.id, "EXPENSE");
    }

    revalidatePath("/pagos");
    revalidatePath("/ventas");
    revalidatePath("/compras");
    revalidatePath("/contabilidad/asientos");

    return { success: true, paymentId: payment.id };
  } catch (error: any) {
    console.error("Error registering payment:", error);
    return { error: "Error interno del servidor al registrar pago" };
  }
}

/**
 * Genera asiento contable para un pago
 * 
 * Para pago de factura (cliente):
 *   Débito: Banco/Caja (activo aumenta)
 *   Crédito: Cuentas por Cobrar (activo disminuye)
 * 
 * Para pago de gasto (proveedor):
 *   Débito: Cuentas por Pagar (pasivo disminuye)
 *   Crédito: Banco/Caja (activo disminuye)
 */
export async function generatePaymentJournalEntry(paymentId: string, documentType: "INVOICE" | "EXPENSE") {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: { include: { client: true } },
        expense: true,
      },
    });

    if (!payment) {
      return { error: "Pago no encontrado" };
    }

    const organizationId = session.user.organizationId;

    // Cuentas según el método de pago
    let cashAccount;
    if (payment.method === "CASH") {
      cashAccount = await prisma.accountingAccount.findFirst({
        where: { organizationId, code: "1-1-01-001" }, // Caja General
      });
    } else {
      cashAccount = await prisma.accountingAccount.findFirst({
        where: { organizationId, code: { contains: "1-1-02" } }, // Bancos
      });
    }

    if (!cashAccount) {
      // Fallback a cualquier cuenta de caja
      cashAccount = await prisma.accountingAccount.findFirst({
        where: { organizationId, type: "ASSET", code: { contains: "1-1-01" } },
      });
    }

    if (documentType === "INVOICE") {
      // Pago de cliente (recibimos dinero)
      const accountsReceivable = await prisma.accountingAccount.findFirst({
        where: { organizationId, code: { contains: "1-1-03" } }, // Cuentas por Cobrar
      });

      if (!cashAccount || !accountsReceivable) {
        return { error: "No se encontraron las cuentas contables requeridas" };
      }

      const invoice = payment.invoice!;
      
      const journalEntry = await prisma.journalEntry.create({
        data: {
          organizationId,
          date: payment.date,
          description: `Pago de Factura #${invoice.number} - ${invoice.client.name}`,
          reference: payment.reference || invoice.number,
          status: "POSTED",
          sourceType: "PAYMENT",
          sourceId: payment.id,
          lines: {
            create: [
              {
                // Débito: Banco/Caja (recibimos dinero)
                accountId: cashAccount.id,
                debit: payment.amount,
                credit: new Decimal(0),
                description: `Pago recibido - ${payment.method}`,
              },
              {
                // Crédito: Cuentas por Cobrar (disminuye la deuda)
                accountId: accountsReceivable.id,
                debit: new Decimal(0),
                credit: payment.amount,
                description: `Pago factura #${invoice.number}`,
              },
            ],
          },
        },
      });

      return { success: true, journalEntryId: journalEntry.id };
    } else {
      // Pago a proveedor (entregamos dinero)
      const accountsPayable = await prisma.accountingAccount.findFirst({
        where: { organizationId, code: { contains: "2-1-01" } }, // Cuentas por Pagar
      });

      if (!cashAccount || !accountsPayable) {
        return { error: "No se encontraron las cuentas contables requeridas" };
      }

      const expense = payment.expense!;

      const journalEntry = await prisma.journalEntry.create({
        data: {
          organizationId,
          date: payment.date,
          description: `Pago de Compra #${expense.number} - ${expense.provider}`,
          reference: payment.reference || expense.number,
          status: "POSTED",
          sourceType: "PAYMENT",
          sourceId: payment.id,
          lines: {
            create: [
              {
                // Débito: Cuentas por Pagar (disminuye la deuda)
                accountId: accountsPayable.id,
                debit: payment.amount,
                credit: new Decimal(0),
                description: `Pago compra #${expense.number}`,
              },
              {
                // Crédito: Banco/Caja (pagamos dinero)
                accountId: cashAccount.id,
                debit: new Decimal(0),
                credit: payment.amount,
                description: `Pago realizado - ${payment.method}`,
              },
            ],
          },
        },
      });

      return { success: true, journalEntryId: journalEntry.id };
    }
  } catch (error: any) {
    console.error("Error generating payment journal entry:", error);
    return { error: "Error interno del servidor al generar asiento contable" };
  }
}

// ============================================
// CONSULTAS DE PAGOS
// ============================================

export async function getPendingDocuments(organizationId: string) {
  try {
    // Facturas pendientes o parciales
    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ["SENT", "PARTIAL"] },
      },
      include: {
        client: true,
        payments: true,
      },
      orderBy: { date: "asc" },
    });

    // Gastos pendientes
    const pendingExpenses = await prisma.expense.findMany({
      where: {
        organizationId,
        status: "PENDING",
      },
      include: {
        category: true,
        payments: true,
      },
      orderBy: { date: "asc" },
    });

    // Calcular saldos pendientes
    const invoicesWithBalance = pendingInvoices.map((invoice) => {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      return {
        ...invoice,
        type: "INVOICE",
        balance: Number(invoice.total) - totalPaid,
        totalPaid,
      };
    });

    const expensesWithBalance = pendingExpenses.map((expense) => {
      const totalPaid = expense.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      return {
        ...expense,
        type: "EXPENSE",
        balance: Number(expense.total) - totalPaid,
        totalPaid,
      };
    });

    return {
      invoices: invoicesWithBalance,
      expenses: expensesWithBalance,
    };
  } catch (error: any) {
    console.error("Error getting pending documents:", error);
    return null;
  }
}
