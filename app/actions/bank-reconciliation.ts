"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Type para Decimal de Prisma
type DecimalField = string | number | bigint | { toNumber?: () => number; toString?: () => string } | null | undefined;

// ============================================
// Types / Interfaces
// ============================================

export interface BankReconciliationWithStats {
  id: string;
  organizationId: string;
  bankAccountId: string;
  date: Date;
  initialBalance: number;
  finalBalance: number;
  statementTotal: number;
  systemTotal: number;
  difference: number;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  bankAccount: {
    id: string;
    name: string;
    bankName: string;
    accountNumber: string;
    currency?: string;
  };
  items: ReconciliationItem[];
  stats?: {
    totalItems: number;
    matchedItems: number;
    unmatchedItems: number;
    matchedAmount: number;
    unmatchedAmount: number;
  };
}

export interface ReconciliationItem {
  id: string;
  reconciliationId: string;
  transactionId: string | null;
  transactionType: "INCOME" | "EXPENSE" | "TRANSFER" | null;
  description: string;
  reference: string | null;
  statementDate: Date;
  statementAmount: number;
  systemAmount: number | null;
  matched: boolean;
  matchDate: Date | null;
}

/**
 * Convierte tipos Decimal de Prisma a number
 */
function toNumber(value: DecimalField): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  // Es un Decimal de Prisma
  if (typeof value === "object" && value !== null) {
    const decimal = value as { toNumber?: () => number; toString?: () => string };
    if (decimal.toNumber) {
      return decimal.toNumber();
    }
    if (decimal.toString) {
      return parseFloat(decimal.toString());
    }
  }
  return Number(value);
}

/**
 * Transforma un item de Prisma a ReconciliationItem
 */
function transformItem(item: {
  id: string;
  reconciliationId: string;
  transactionId: string | null;
  transactionType: string | null;
  description: string;
  reference: string | null;
  statementDate: Date;
  statementAmount: DecimalField;
  systemAmount: DecimalField;
  matched: boolean;
  matchDate: Date | null;
}): ReconciliationItem {
  return {
    id: item.id,
    reconciliationId: item.reconciliationId,
    transactionId: item.transactionId,
    transactionType: item.transactionType as ReconciliationItem["transactionType"],
    description: item.description,
    reference: item.reference,
    statementDate: item.statementDate,
    statementAmount: toNumber(item.statementAmount),
    systemAmount: item.systemAmount !== null ? toNumber(item.systemAmount) : null,
    matched: item.matched,
    matchDate: item.matchDate,
  };
}

type ReconciliationRawItem = {
  id: string;
  reconciliationId: string;
  transactionId: string | null;
  transactionType: string | null;
  description: string;
  reference: string | null;
  statementDate: Date;
  statementAmount: DecimalField;
  systemAmount: DecimalField;
  matched: boolean;
  matchDate: Date | null;
};

/**
 * Transforma una conciliación de Prisma a BankReconciliationWithStats
 */
function transformReconciliation(reconciliation: {
  id: string;
  organizationId: string;
  bankAccountId: string;
  date: Date;
  initialBalance: DecimalField;
  finalBalance: DecimalField;
  statementTotal: DecimalField;
  systemTotal: DecimalField;
  difference: DecimalField;
  status: BankReconciliationWithStats["status"];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  bankAccount: { id: string; name: string; bankName: string; accountNumber: string; currency?: string };
  items: ReconciliationRawItem[];
}): BankReconciliationWithStats {
  const items = (reconciliation.items || []).map(transformItem);
  
  const totalItems = items.length;
  const matchedItems = items.filter((item: ReconciliationItem) => item.matched).length;
  const unmatchedItems = totalItems - matchedItems;
  
  const matchedAmount = items
    .filter((item: ReconciliationItem) => item.matched)
    .reduce((sum: number, item: ReconciliationItem) => sum + item.statementAmount, 0);
  
  const unmatchedAmount = items
    .filter((item: ReconciliationItem) => !item.matched)
    .reduce((sum: number, item: ReconciliationItem) => sum + item.statementAmount, 0);

  return {
    id: reconciliation.id,
    organizationId: reconciliation.organizationId,
    bankAccountId: reconciliation.bankAccountId,
    date: reconciliation.date,
    initialBalance: toNumber(reconciliation.initialBalance),
    finalBalance: toNumber(reconciliation.finalBalance),
    statementTotal: toNumber(reconciliation.statementTotal),
    systemTotal: toNumber(reconciliation.systemTotal),
    difference: toNumber(reconciliation.difference),
    status: reconciliation.status,
    notes: reconciliation.notes,
    createdAt: reconciliation.createdAt,
    updatedAt: reconciliation.updatedAt,
    bankAccount: reconciliation.bankAccount,
    items,
    stats: {
      totalItems,
      matchedItems,
      unmatchedItems,
      matchedAmount,
      unmatchedAmount,
    },
  };
}

export interface CreateReconciliationInput {
  bankAccountId: string;
  date: Date | string;
  initialBalance: number;
  finalBalance: number;
  statementTotal: number;
  notes?: string;
  items?: CreateReconciliationItemInput[];
}

export interface CreateReconciliationItemInput {
  description: string;
  reference?: string;
  statementDate: Date | string;
  statementAmount: number;
}

export interface UpdateReconciliationInput {
  date?: Date | string;
  initialBalance?: number;
  finalBalance?: number;
  statementTotal?: number;
  notes?: string;
}

export interface MatchItemInput {
  itemId: string;
  transactionId: string;
  transactionType: "INCOME" | "EXPENSE" | "TRANSFER";
  systemAmount: number;
}

// ============================================
// Schemas de Validación
// ============================================

const createReconciliationSchema = z.object({
  bankAccountId: z.string().min(1, "La cuenta bancaria es requerida"),
  date: z.string().or(z.date()).transform(val => new Date(val)),
  initialBalance: z.coerce.number(),
  finalBalance: z.coerce.number(),
  statementTotal: z.coerce.number(),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    reference: z.string().optional(),
    statementDate: z.string().or(z.date()).transform(val => new Date(val)),
    statementAmount: z.coerce.number(),
  })).optional(),
});

const updateReconciliationSchema = z.object({
  date: z.string().or(z.date()).transform(val => new Date(val)).optional(),
  initialBalance: z.coerce.number().optional(),
  finalBalance: z.coerce.number().optional(),
  statementTotal: z.coerce.number().optional(),
  notes: z.string().optional().nullable(),
});

const matchItemSchema = z.object({
  itemId: z.string().min(1),
  transactionId: z.string().min(1),
  transactionType: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  systemAmount: z.coerce.number(),
});

// ============================================
// Server Actions
// ============================================

/**
 * Obtiene todas las conciliaciones bancarias de la organización
 */
export async function getBankReconciliations(
  filters?: {
    bankAccountId?: string;
    status?: string;
  }
): Promise<BankReconciliationWithStats[]> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  const where: any = { organizationId };
  if (filters?.bankAccountId) where.bankAccountId = filters.bankAccountId;
  if (filters?.status) where.status = filters.status;

  const reconciliations = await prisma.bankReconciliation.findMany({
    where,
    include: {
      bankAccount: {
        select: {
          id: true,
          name: true,
          bankName: true,
          accountNumber: true,
        },
      },
      items: {
        orderBy: { statementDate: "asc" },
      },
    },
    orderBy: { date: "desc" },
  });

  // Transformar y calcular estadísticas
  return reconciliations.map(transformReconciliation);
}

/**
 * Obtiene una conciliación específica con sus estadísticas
 */
export async function getBankReconciliation(id: string): Promise<BankReconciliationWithStats | null> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  const reconciliation = await prisma.bankReconciliation.findFirst({
    where: { id, organizationId },
    include: {
      bankAccount: {
        select: {
          id: true,
          name: true,
          bankName: true,
          accountNumber: true,
          currency: true,
        },
      },
      items: {
        orderBy: { statementDate: "asc" },
      },
    },
  });

  if (!reconciliation) {
    return null;
  }

  return transformReconciliation(reconciliation);
}

/**
 * Obtiene una conciliación sin transformar (datos crudos de Prisma)
 */
async function getRawReconciliation(id: string, organizationId: string) {
  return prisma.bankReconciliation.findFirst({
    where: { id, organizationId },
    include: { items: true },
  });
}

/**
 * Crea una nueva conciliación bancaria
 */
export async function createBankReconciliation(
  input: CreateReconciliationInput
): Promise<BankReconciliationWithStats> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  // Validar input
  const validated = createReconciliationSchema.parse(input);

  // Verificar que la cuenta bancaria existe
  const bankAccount = await prisma.bankAccount.findFirst({
    where: { id: validated.bankAccountId, organizationId },
  });

  if (!bankAccount) {
    throw new Error("Cuenta bancaria no encontrada");
  }

  // Calcular totales
  const systemTotal = 0; // Se calculará con las transacciones existentes
  const difference = validated.statementTotal - systemTotal;

  // Crear la conciliación
  const reconciliation = await prisma.bankReconciliation.create({
    data: {
      organizationId,
      bankAccountId: validated.bankAccountId,
      date: validated.date,
      initialBalance: validated.initialBalance,
      finalBalance: validated.finalBalance,
      statementTotal: validated.statementTotal,
      systemTotal,
      difference,
      notes: validated.notes,
      status: "DRAFT",
    },
  });

  // Crear items si se proporcionan
  if (validated.items && validated.items.length > 0) {
    await prisma.reconciliationItem.createMany({
      data: validated.items.map(item => ({
        reconciliationId: reconciliation.id,
        description: item.description,
        reference: item.reference,
        statementDate: item.statementDate,
        statementAmount: item.statementAmount,
      })),
    });
  }

  // Revalidar la página de conciliaciones
  revalidatePath("/treasury/reconciliations");

  // Retornar la conciliación creada con sus items
  const result = await getBankReconciliation(reconciliation.id);
  if (!result) {
    throw new Error("Error al crear la conciliación");
  }

  return result;
}

/**
 * Actualiza una conciliación bancaria
 */
export async function updateBankReconciliation(
  id: string,
  input: UpdateReconciliationInput
): Promise<BankReconciliationWithStats> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  // Validar input
  const validated = updateReconciliationSchema.parse(input);

  // Verificar que existe
  const existing = await prisma.bankReconciliation.findFirst({
    where: { id, organizationId },
  });

  if (!existing) {
    throw new Error("Conciliación no encontrada");
  }

  if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
    throw new Error("No se puede modificar una conciliación completada o cancelada");
  }

  // Actualizar
  const updated = await prisma.bankReconciliation.update({
    where: { id },
    data: validated,
  });

  // Revalidar
  revalidatePath("/treasury/reconciliations");
  revalidatePath(`/treasury/reconciliations/${id}`);

  const result = await getBankReconciliation(id);
  if (!result) {
    throw new Error("Error al actualizar la conciliación");
  }

  return result;
}

/**
 * Vincula un item de conciliación con una transacción del sistema
 */
export async function matchReconciliationItem(
  reconciliationId: string,
  input: MatchItemInput
): Promise<{
  item: ReconciliationItem;
  stats: BankReconciliationWithStats["stats"];
}> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  // Validar input
  const validated = matchItemSchema.parse(input);

  // Verificar que la conciliación existe
  const reconciliation = await prisma.bankReconciliation.findFirst({
    where: { id: reconciliationId, organizationId },
  });

  if (!reconciliation) {
    throw new Error("Conciliación no encontrada");
  }

  if (reconciliation.status === "COMPLETED" || reconciliation.status === "CANCELLED") {
    throw new Error("No se puede modificar una conciliación completada o cancelada");
  }

  // Verificar que el item existe
  const item = await prisma.reconciliationItem.findFirst({
    where: { id: validated.itemId, reconciliationId },
  });

  if (!item) {
    throw new Error("Item de conciliación no encontrado");
  }

  // Verificar que la transacción existe (para INCOME)
  if (validated.transactionType === "INCOME") {
    const income = await prisma.income.findFirst({
      where: { id: validated.transactionId, organizationId },
    });
    if (!income) {
      throw new Error("Transacción no encontrada");
    }
  }

  // Actualizar el item
  const updatedItem = await prisma.reconciliationItem.update({
    where: { id: validated.itemId },
    data: {
      transactionId: validated.transactionId,
      transactionType: validated.transactionType,
      systemAmount: validated.systemAmount,
      matched: true,
      matchDate: new Date(),
    },
  });

  // Actualizar estado a IN_PROGRESS si estaba en DRAFT
  if (reconciliation.status === "DRAFT") {
    await prisma.bankReconciliation.update({
      where: { id: reconciliationId },
      data: { status: "IN_PROGRESS" },
    });
  }

  // Recalcular estadísticas
  const allItems = await prisma.reconciliationItem.findMany({
    where: { reconciliationId },
  });

  const matchedAmount = allItems
    .filter((i: ReconciliationRawItem) => i.matched)
    .reduce((sum: number, i: ReconciliationRawItem) => sum + toNumber(i.statementAmount), 0);

  // Actualizar totales de la conciliación
  await prisma.bankReconciliation.update({
    where: { id: reconciliationId },
    data: {
      systemTotal: matchedAmount,
      difference: toNumber(reconciliation.statementTotal) - matchedAmount,
    },
  });

  // Revalidar
  revalidatePath(`/treasury/reconciliations/${reconciliationId}`);

  return {
    item: transformItem(updatedItem),
    stats: {
      totalItems: allItems.length,
      matchedItems: allItems.filter((i: ReconciliationRawItem) => i.matched).length,
      unmatchedItems: allItems.filter((i: ReconciliationRawItem) => !i.matched).length,
      matchedAmount,
      unmatchedAmount: allItems
        .filter((i: ReconciliationRawItem) => !i.matched)
        .reduce((sum: number, i: ReconciliationRawItem) => sum + toNumber(i.statementAmount), 0),
    },
  };
}

/**
 * Completa una conciliación bancaria
 */
export async function completeBankReconciliation(
  id: string,
  options?: { force?: boolean }
): Promise<{
  success: boolean;
  reconciliation: BankReconciliationWithStats;
  summary: {
    totalItems: number;
    matchedItems: number;
    unmatchedItems: number;
    statementTotal: number;
    systemTotal: number;
    difference: number;
  };
}> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  const reconciliation = await prisma.bankReconciliation.findFirst({
    where: { id, organizationId },
    include: { items: true },
  });

  if (!reconciliation) {
    throw new Error("Conciliación no encontrada");
  }

  if (reconciliation.status === "COMPLETED" || reconciliation.status === "CANCELLED") {
    throw new Error("La conciliación ya está completada o cancelada");
  }

  const unmatchedItems = reconciliation.items.filter(item => !item.matched);
  const difference = Number(reconciliation.difference);

  // Validaciones
  if (unmatchedItems.length > 0 && !options?.force) {
    throw new Error(`Hay ${unmatchedItems.length} transacciones sin conciliar`);
  }

  if (Math.abs(difference) > 0.01 && !options?.force) {
    throw new Error(`Existe una diferencia de ${difference.toFixed(2)}`);
  }

  // Completar
  await prisma.bankReconciliation.update({
    where: { id },
    data: { status: "COMPLETED" },
  });

  // Revalidar
  revalidatePath("/treasury/reconciliations");
  revalidatePath(`/treasury/reconciliations/${id}`);

  const result = await getBankReconciliation(id);
  if (!result) {
    throw new Error("Error al completar la conciliación");
  }

  return {
    success: true,
    reconciliation: result,
    summary: {
      totalItems: reconciliation.items.length,
      matchedItems: reconciliation.items.filter(i => i.matched).length,
      unmatchedItems: unmatchedItems.length,
      statementTotal: Number(reconciliation.statementTotal),
      systemTotal: Number(reconciliation.systemTotal),
      difference,
    },
  };
}

/**
 * Cancela una conciliación bancaria
 */
export async function cancelBankReconciliation(id: string): Promise<BankReconciliationWithStats> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  const reconciliation = await prisma.bankReconciliation.findFirst({
    where: { id, organizationId },
  });

  if (!reconciliation) {
    throw new Error("Conciliación no encontrada");
  }

  if (reconciliation.status === "COMPLETED") {
    throw new Error("No se puede cancelar una conciliación completada");
  }

  await prisma.bankReconciliation.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/treasury/reconciliations");
  revalidatePath(`/treasury/reconciliations/${id}`);

  const result = await getBankReconciliation(id);
  if (!result) {
    throw new Error("Error al cancelar la conciliación");
  }

  return result;
}

/**
 * Agrega un item a una conciliación existente
 */
export async function addReconciliationItem(
  reconciliationId: string,
  input: CreateReconciliationItemInput
): Promise<ReconciliationItem> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  const reconciliation = await prisma.bankReconciliation.findFirst({
    where: { id: reconciliationId, organizationId },
  });

  if (!reconciliation) {
    throw new Error("Conciliación no encontrada");
  }

  if (reconciliation.status === "COMPLETED" || reconciliation.status === "CANCELLED") {
    throw new Error("No se puede modificar una conciliación completada o cancelada");
  }

  const item = await prisma.reconciliationItem.create({
    data: {
      reconciliationId,
      description: input.description,
      reference: input.reference,
      statementDate: new Date(input.statementDate),
      statementAmount: input.statementAmount,
    },
  });

  revalidatePath(`/treasury/reconciliations/${reconciliationId}`);

  return item as unknown as ReconciliationItem;
}

/**
 * Elimina un item de una conciliación
 */
export async function deleteReconciliationItem(
  reconciliationId: string,
  itemId: string
): Promise<void> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  const reconciliation = await prisma.bankReconciliation.findFirst({
    where: { id: reconciliationId, organizationId },
  });

  if (!reconciliation) {
    throw new Error("Conciliación no encontrada");
  }

  if (reconciliation.status === "COMPLETED" || reconciliation.status === "CANCELLED") {
    throw new Error("No se puede modificar una conciliación completada o cancelada");
  }

  await prisma.reconciliationItem.delete({
    where: { id: itemId },
  });

  // Recalcular totales
  const allItems = await prisma.reconciliationItem.findMany({
    where: { reconciliationId },
  });

  const matchedAmount = allItems
    .filter(i => i.matched)
    .reduce((sum, i) => sum + Number(i.statementAmount), 0);

  await prisma.bankReconciliation.update({
    where: { id: reconciliationId },
    data: {
      systemTotal: matchedAmount,
      difference: Number(reconciliation.statementTotal) - matchedAmount,
    },
  });

  revalidatePath(`/treasury/reconciliations/${reconciliationId}`);
}

/**
 * Busca transacciones que pueden coincidir con un item de conciliación
 */
export async function findMatchingTransactions(
  reconciliationId: string,
  itemAmount: number,
  dateRange?: { start: Date; end: Date }
): Promise<any[]> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  const reconciliation = await prisma.bankReconciliation.findFirst({
    where: { id: reconciliationId, organizationId },
  });

  if (!reconciliation) {
    throw new Error("Conciliación no encontrada");
  }

  // Buscar incomes que coincidan en monto (con cierta tolerancia)
  const tolerance = 0.01;
  
  const incomes = await prisma.income.findMany({
    where: {
      organizationId,
      bankAccountId: reconciliation.bankAccountId,
      amount: {
        gte: itemAmount - tolerance,
        lte: itemAmount + tolerance,
      },
      status: "RECEIVED",
      ...(dateRange && {
        date: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      }),
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { date: "desc" },
    take: 10,
  });

  return incomes;
}
