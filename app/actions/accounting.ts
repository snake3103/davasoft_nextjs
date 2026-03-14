"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  accountingAccountSchema,
  journalEntrySchema,
  journalLineSchema,
} from "@/lib/schemas/accounting";
import { Decimal } from "decimal.js";

// ============================================
// PLAN DE CUENTAS
// ============================================

export async function createAccount(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawData = {
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      type: formData.get("type") as any,
      parentId: formData.get("parentId") as string | null,
      description: formData.get("description") as string | null,
      isActive: formData.get("isActive") === "on",
    };

    const result = accountingAccountSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    await prisma.accountingAccount.create({
      data: {
        ...result.data,
        organizationId: session.user.organizationId,
      },
    });

    revalidatePath("/contabilidad/plan-cuentas");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating account:", error);
    return { error: "Error interno del servidor al crear cuenta" };
  }
}

export async function updateAccount(
  id: string,
  prevState: any,
  formData: FormData
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawData = {
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      type: formData.get("type") as any,
      parentId: formData.get("parentId") as string | null,
      description: formData.get("description") as string | null,
      isActive: formData.get("isActive") === "on",
    };

    const result = accountingAccountSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    await prisma.accountingAccount.update({
      where: { id, organizationId: session.user.organizationId },
      data: result.data,
    });

    revalidatePath("/contabilidad/plan-cuentas");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating account:", error);
    return { error: "Error interno del servidor al actualizar cuenta" };
  }
}

export async function deleteAccount(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    // Verificar si la cuenta tiene líneas de asiento
    const account = await prisma.accountingAccount.findUnique({
      where: { id },
      include: { journalLines: true },
    });

    if (!account) {
      return { error: "Cuenta no encontrada" };
    }

    if (account.journalLines.length > 0) {
      return { error: "No se puede eliminar: la cuenta tiene movimientos contables" };
    }

    await prisma.accountingAccount.delete({
      where: { id, organizationId: session.user.organizationId },
    });

    revalidatePath("/contabilidad/plan-cuentas");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return { error: "Error interno del servidor al eliminar cuenta" };
  }
}

// ============================================
// ASIENTOS CONTABLES
// ============================================

function checkBalancedEntry(lines: any[]): { isBalanced: boolean; totalDebit: number; totalCredit: number; difference: number } {
  const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  
  return {
    isBalanced: difference < 0.01,
    totalDebit,
    totalCredit,
    difference,
  };
}

export async function createJournalEntry(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawLines = formData.get("lines") as string;
    const lines = JSON.parse(rawLines);

    const validation = checkBalancedEntry(lines);
    if (!validation.isBalanced) {
      return { 
        error: `Asiento no balanceado: Débito RD$${validation.totalDebit.toFixed(2)}, Crédito RD$${validation.totalCredit.toFixed(2)}, Diferencia RD$${validation.difference.toFixed(2)}` 
      };
    }

    const rawData = {
      date: formData.get("date") as string,
      description: formData.get("description") as string,
      reference: formData.get("reference") as string | null,
      status: (formData.get("status") as any) || "POSTED",
      sourceType: formData.get("sourceType") as string | null,
      sourceId: formData.get("sourceId") as string | null,
      lines,
    };

    const result = journalEntrySchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    await prisma.journalEntry.create({
      data: {
        organizationId: session.user.organizationId,
        date: result.data.date,
        description: result.data.description,
        reference: result.data.reference,
        status: result.data.status,
        sourceType: result.data.sourceType,
        sourceId: result.data.sourceId,
        lines: {
          create: result.data.lines.map((line: any) => ({
            accountId: line.accountId,
            debit: new Decimal(line.debit || 0),
            credit: new Decimal(line.credit || 0),
            description: line.description,
          })),
        },
      },
    });

    revalidatePath("/contabilidad/asientos");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating journal entry:", error);
    return { error: "Error interno del servidor al crear asiento" };
  }
}

export async function cancelJournalEntry(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    await prisma.journalEntry.update({
      where: { id, organizationId: session.user.organizationId },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/contabilidad/asientos");
    return { success: true };
  } catch (error: any) {
    console.error("Error cancelling journal entry:", error);
    return { error: "Error interno del servidor al cancelar asiento" };
  }
}

// ============================================
// GENERACIÓN AUTOMÁTICA DE ASIENTOS
// ============================================

/**
 * Genera asiento contable para una factura (República Dominicana)
 * Asiento típico:
 *   Débito: Cuentas por Cobrar (cliente) - total (para ventas a crédito)
 *   Crédito: Ingresos por ventas - subtotal
 *   Crédito: ITBIS Ventas (18%) - impuesto
 */
export async function generateInvoiceJournalEntry(invoiceId: string, isPOS: boolean = false) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true },
    });

    if (!invoice) {
      return { error: "Factura no encontrada" };
    }

    if (invoice.journalEntryId) {
      return { error: "La factura ya tiene un asiento contable generado" };
    }

    const organizationId = session.user.organizationId;

    // Cuenta de caja o cuentas por cobrar (dependiendo si es POS o no)
    let debitAccount;
    let debitDescription;
    
    if (isPOS) {
      // Para POS: usar Caja General (venta al contado)
      debitAccount = await prisma.accountingAccount.findFirst({
        where: { 
          organizationId, 
          type: "ASSET", 
          code: { contains: "1-1-01" } // Caja General
        },
      });
      debitDescription = "Venta POS - Contado";
    } else {
      // Para facturas normales: usar Cuentas por Cobrar
      debitAccount = await prisma.accountingAccount.findFirst({
        where: { 
          organizationId, 
          type: "ASSET", 
          code: { contains: "1-1-03" } // Cuentas por cobrar
        },
      });
      debitDescription = `Cliente: ${invoice.client.name}`;
    }

    // Cuenta de ingresos (Ingreso - Ventas)
    const revenueAccount = await prisma.accountingAccount.findFirst({
      where: { 
        organizationId, 
        type: "REVENUE", 
        code: { contains: "4-1" } // Ventas
      },
    });

    // Cuenta de ITBIS Ventas (Pasivo - Impuesto por pagar) - 18% RD
    const itbisAccount = await prisma.accountingAccount.findFirst({
      where: { 
        organizationId, 
        type: "LIABILITY", 
        code: { contains: "2-1-02" } // ITBIS Ventas
      },
    });

    if (!debitAccount || !revenueAccount) {
      return {
        error:
          "No se encontraron las cuentas contables requeridas. Configura el plan de cuentas (Caja para POS o Cuentas por Cobrar).",
      };
    }

    // Crear el asiento
    const journalEntry = await prisma.journalEntry.create({
      data: {
        organizationId,
        date: invoice.date,
        description: isPOS 
          ? `Venta POS #${invoice.number}` 
          : `Factura #${invoice.number} - ${invoice.client.name}`,
        reference: invoice.number,
        status: "POSTED",
        sourceType: isPOS ? "POS" : "INVOICE",
        sourceId: invoice.id,
        lines: {
          create: [
            {
              // Débito: Caja (POS) o Cuentas por Cobrar (factura)
              accountId: debitAccount.id,
              debit: new Decimal(invoice.total),
              credit: new Decimal(0),
              description: debitDescription,
            },
            {
              // Crédito: Ingresos (subtotal)
              accountId: revenueAccount.id,
              debit: new Decimal(0),
              credit: new Decimal(invoice.subtotal),
              description: `Venta - Factura #${invoice.number}`,
            },
            ...(itbisAccount && Number(invoice.tax) > 0
              ? [
                  {
                    // Crédito: ITBIS (impuesto 18%)
                    accountId: itbisAccount.id,
                    debit: new Decimal(0),
                    credit: new Decimal(invoice.tax),
                    description: `ITBIS 18% - Factura #${invoice.number}`,
                  },
                ]
              : []),
          ],
        },
      },
    });

    // Actualizar la factura con la referencia al asiento
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { journalEntryId: journalEntry.id },
    });

    revalidatePath("/contabilidad/asientos");
    revalidatePath("/ventas");

    return { success: true, journalEntryId: journalEntry.id };
  } catch (error: any) {
    console.error("Error generating invoice journal entry:", error);
    return { error: "Error interno del servidor al generar asiento contable" };
  }
}

/**
 * Genera asiento contable para un gasto (República Dominicana)
 * Asiento típico:
 *   Débito: Gasto (cuenta de gasto según categoría)
 *   Débito: ITBIS Compras (crédito fiscal 18%)
 *   Crédito: Cuentas por Pagar / Banco
 */
export async function generateExpenseJournalEntry(expenseId: string) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { category: true },
    });

    if (!expense) {
      return { error: "Gasto no encontrado" };
    }

    if (expense.journalEntryId) {
      return { error: "El gasto ya tiene un asiento contable generado" };
    }

    const organizationId = session.user.organizationId;

    // Cuenta de gasto (según categoría del gasto)
    // Buscamos una cuenta de gasto relacionada o usamos una genérica
    let expenseAccount = await prisma.accountingAccount.findFirst({
      where: {
        organizationId,
        type: "EXPENSE",
        id: expense.categoryId,
      },
    });

    // Si no hay cuenta específica, buscar una genérica de gastos de operación
    if (!expenseAccount) {
      expenseAccount = await prisma.accountingAccount.findFirst({
        where: { 
          organizationId, 
          type: "EXPENSE", 
          code: { contains: "5-1-99" } // Otros gastos de operación
        },
      });
    }

    // Cuenta de proveedor (Pasivo - Cuentas por pagar)
    const accountsPayable = await prisma.accountingAccount.findFirst({
      where: { 
        organizationId, 
        type: "LIABILITY", 
        code: { contains: "2-1-01" } // Cuentas por pagar
      },
    });

    // Cuenta de ITBIS Compras (Activo - Crédito fiscal)
    const itbisComprasAccount = await prisma.accountingAccount.findFirst({
      where: { 
        organizationId, 
        type: "ASSET", 
        code: { contains: "1-1-05" } // ITBIS Compras
      },
    });

    if (!expenseAccount || !accountsPayable) {
      return {
        error:
          "No se encontraron las cuentas contables requeridas. Configura el plan de cuentas.",
      };
    }

    // Calcular el ITBIS (asumimos 18% si el total incluye ITBIS)
    // Si el total es 1180, el subtotal es 1000 y el ITBIS es 180
    const totalAmount = Number(expense.total);
    const subtotal = totalAmount / 1.18;
    const itbis = totalAmount - subtotal;

    // Crear el asiento
    const journalEntry = await prisma.journalEntry.create({
      data: {
        organizationId,
        date: expense.date,
        description: `Compra #${expense.number} - ${expense.provider}`,
        reference: expense.number,
        status: "POSTED",
        sourceType: "EXPENSE",
        sourceId: expense.id,
        lines: {
          create: [
            {
              // Débito: Gasto (subtotal)
              accountId: expenseAccount.id,
              debit: new Decimal(subtotal),
              credit: new Decimal(0),
              description: `Proveedor: ${expense.provider}`,
            },
            ...(itbisComprasAccount && itbis > 0
              ? [
                  {
                    // Débito: ITBIS Compras (crédito fiscal)
                    accountId: itbisComprasAccount.id,
                    debit: new Decimal(itbis),
                    credit: new Decimal(0),
                    description: `ITBIS Compras 18% - Compra #${expense.number}`,
                  },
                ]
              : []),
            {
              // Crédito: Cuentas por pagar (total)
              accountId: accountsPayable.id,
              debit: new Decimal(0),
              credit: new Decimal(totalAmount),
              description: `Compra - Factura #${expense.number}`,
            },
          ],
        },
      },
    });

    // Actualizar el gasto con la referencia al asiento
    await prisma.expense.update({
      where: { id: expenseId },
      data: { journalEntryId: journalEntry.id },
    });

    revalidatePath("/contabilidad/asientos");
    revalidatePath("/gastos");
    revalidatePath("/compras");

    return { success: true, journalEntryId: journalEntry.id };
  } catch (error: any) {
    console.error("Error generating expense journal entry:", error);
    return { error: "Error interno del servidor al generar asiento contable" };
  }
}

/**
 * Genera asiento contable para un ingreso (República Dominicana)
 * Asiento típico:
 *   Débito: Caja / Banco (según método de pago)
 *   Crédito: Ingresos (subtotal)
 *   Crédito: ITBIS Ventas (18%)
 */
export async function generateIncomeJournalEntry(incomeId: string) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const income = await prisma.income.findUnique({
      where: { id: incomeId },
      include: { client: true },
    });

    if (!income) {
      return { error: "Ingreso no encontrado" };
    }

    const organizationId = session.user.organizationId;

    // Determinar cuenta de débito según método de pago
    let debitAccount;
    let debitDescription;

    if (income.bankAccountId) {
      // Si hay cuenta bancaria, usar esa cuenta
      debitAccount = await prisma.accountingAccount.findFirst({
        where: { 
          organizationId, 
          type: "ASSET",
          id: income.bankAccountId,
        },
      });
      debitDescription = `Depósito bancario - ${income.reference || income.number}`;
    } else if (income.paymentMethod === "BANK_TRANSFER") {
      // Transferencia bancaria
      debitAccount = await prisma.accountingAccount.findFirst({
        where: { 
          organizationId, 
          type: "ASSET", 
          code: { contains: "1-1-02" } // Banco
        },
      });
      debitDescription = `Transferencia - ${income.reference || income.number}`;
    } else {
      // Efectivo - usar Caja General
      debitAccount = await prisma.accountingAccount.findFirst({
        where: { 
          organizationId, 
          type: "ASSET", 
          code: { contains: "1-1-01" } // Caja General
        },
      });
      debitDescription = `Ingreso en efectivo - ${income.number}`;
    }

    // Cuenta de ingresos
    const revenueAccount = await prisma.accountingAccount.findFirst({
      where: { 
        organizationId, 
        type: "REVENUE", 
        code: { startsWith: "4" } // Ingresos
      },
    });

    // Cuenta de ITBIS Ventas (pasivo)
    const itbisAccount = await prisma.accountingAccount.findFirst({
      where: { 
        organizationId, 
        type: "LIABILITY", 
        code: { contains: "2-1-02" } // ITBIS Ventas
      },
    });

    if (!debitAccount || !revenueAccount) {
      return {
        error:
          "No se encontraron las cuentas contables requeridas. Configura el plan de cuentas (Caja o Banco).",
      };
    }

    // Calcular ITBIS (asumimos que el monto incluye ITBIS del 18%)
    const totalAmount = Number(income.amount);
    const subtotal = totalAmount / 1.18;
    const itbis = totalAmount - subtotal;

    // Crear el asiento
    const journalEntry = await prisma.journalEntry.create({
      data: {
        organizationId,
        date: income.date,
        description: `Ingreso #${income.number} - ${(income.description || "").substring(0, 50)}`,
        reference: income.number,
        status: "POSTED",
        sourceType: "INCOME",
        sourceId: income.id,
        lines: {
          create: [
            {
              // Débito: Caja o Banco
              accountId: debitAccount.id,
              debit: new Decimal(totalAmount),
              credit: new Decimal(0),
              description: debitDescription,
            },
            {
              // Crédito: Ingresos (subtotal)
              accountId: revenueAccount.id,
              debit: new Decimal(0),
              credit: new Decimal(subtotal),
              description: `Ingreso - ${income.number}`,
            },
            ...(itbisAccount && itbis > 0
              ? [
                  {
                    // Crédito: ITBIS Ventas (18%)
                    accountId: itbisAccount.id,
                    debit: new Decimal(0),
                    credit: new Decimal(itbis),
                    description: `ITBIS 18% - Ingreso #${income.number}`,
                  },
                ]
              : []),
          ],
        },
      },
    });

    revalidatePath("/contabilidad/asientos");
    revalidatePath("/ingresos");

    return { success: true, journalEntryId: journalEntry.id };
  } catch (error: any) {
    console.error("Error generating income journal entry:", error);
    return { error: "Error interno del servidor al generar asiento contable" };
  }
}

// ============================================
// REPORTES CONTABLES
// ============================================

export async function getTrialBalance(organizationId: string, startDate?: Date, endDate?: Date) {
  try {
    // Obtener todas las cuentas con sus movimientos
    const accounts = await prisma.accountingAccount.findMany({
      where: { organizationId, isActive: true },
      include: {
        journalLines: {
          where: {
            entry: {
              status: "POSTED",
              date: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            },
          },
        },
      },
      orderBy: { code: "asc" },
    });

    const trialBalance = accounts.map((account) => {
      const totalDebit = account.journalLines.reduce(
        (sum, line) => sum + Number(line.debit),
        0
      );
      const totalCredit = account.journalLines.reduce(
        (sum, line) => sum + Number(line.credit),
        0
      );
      const balance = totalDebit - totalCredit;

      return {
        code: account.code,
        name: account.name,
        type: account.type,
        debit: totalDebit,
        credit: totalCredit,
        balance: balance > 0 ? balance : 0,
        balanceCredit: balance < 0 ? Math.abs(balance) : 0,
      };
    });

    const totalDebit = trialBalance.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredit = trialBalance.reduce((sum, acc) => sum + acc.credit, 0);

    return {
      accounts: trialBalance,
      totalDebit,
      totalCredit,
      balanced: Math.abs(totalDebit - totalCredit) < 0.01,
    };
  } catch (error: any) {
    console.error("Error getting trial balance:", error);
    return null;
  }
}

export async function getGeneralLedger(
  organizationId: string,
  accountId: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const account = await prisma.accountingAccount.findUnique({
      where: { id: accountId },
      include: {
        journalLines: {
          where: {
            entry: {
              status: "POSTED",
              date: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            },
          },
          include: {
            entry: true,
          },
          orderBy: {
            entry: {
              date: "asc",
            },
          },
        },
      },
    });

    if (!account) {
      return null;
    }

    let runningBalance = 0;
    const lines = account.journalLines.map((line) => {
      const debit = Number(line.debit);
      const credit = Number(line.credit);
      
      // El balance corrido depende del tipo de cuenta
      if (account.type === "ASSET" || account.type === "EXPENSE") {
        runningBalance += debit - credit;
      } else {
        runningBalance += credit - debit;
      }

      return {
        ...line,
        runningBalance,
      };
    });

    return {
      account,
      lines,
      finalBalance: runningBalance,
    };
  } catch (error: any) {
    console.error("Error getting general ledger:", error);
    return null;
  }
}
