"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ============================================
// Types
// ============================================

export interface BankAccountWithBalance {
  id: string;
  organizationId: string;
  name: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  status: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Schemas de Validación
// ============================================

const createBankAccountSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  bankName: z.string().min(1, "El nombre del banco es requerido"),
  accountNumber: z.string().min(1, "El número de cuenta es requerido"),
  accountType: z.enum(["CHECKING", "SAVINGS", "CASH", "CREDIT"]).default("CHECKING"),
  currency: z.string().default("DOP"),
  initialBalance: z.number().default(0),
  description: z.string().optional(),
});

const updateBankAccountSchema = z.object({
  name: z.string().min(1).optional(),
  bankName: z.string().min(1).optional(),
  accountType: z.enum(["CHECKING", "SAVINGS", "CASH", "CREDIT"]).optional(),
  currency: z.string().optional(),
  initialBalance: z.number().optional(),
  currentBalance: z.number().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "CLOSED"]).optional(),
  description: z.string().optional(),
});

// ============================================
// Funciones Helper
// ============================================

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "object" && value !== null && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
}

// ============================================
// Server Actions
// ============================================

/**
 * Obtiene todas las cuentas bancarias de la organización
 */
export async function getBankAccounts(): Promise<BankAccountWithBalance[]> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  const accounts = await prisma.bankAccount.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });

  return accounts.map((account) => ({
    ...account,
    initialBalance: toNumber(account.initialBalance),
    currentBalance: toNumber(account.currentBalance),
  }));
}

/**
 * Obtiene una cuenta bancaria específica
 */
export async function getBankAccount(id: string): Promise<BankAccountWithBalance | null> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  const account = await prisma.bankAccount.findFirst({
    where: { id, organizationId },
  });

  if (!account) {
    return null;
  }

  return {
    ...account,
    initialBalance: toNumber(account.initialBalance),
    currentBalance: toNumber(account.currentBalance),
  };
}

/**
 * Crea una nueva cuenta bancaria
 */
export async function createBankAccount(
  input: z.infer<typeof createBankAccountSchema>
): Promise<BankAccountWithBalance> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  const validated = createBankAccountSchema.parse(input);

  // Verificar que el número de cuenta no exista
  const existing = await prisma.bankAccount.findFirst({
    where: {
      organizationId,
      accountNumber: validated.accountNumber,
    },
  });

  if (existing) {
    throw new Error("Ya existe una cuenta bancaria con este número");
  }

  const account = await prisma.bankAccount.create({
    data: {
      organizationId,
      name: validated.name,
      bankName: validated.bankName,
      accountNumber: validated.accountNumber,
      accountType: validated.accountType,
      currency: validated.currency,
      initialBalance: validated.initialBalance,
      currentBalance: validated.initialBalance,
      status: "ACTIVE",
      description: validated.description,
    },
  });

  revalidatePath("/bancos");

  return {
    ...account,
    initialBalance: toNumber(account.initialBalance),
    currentBalance: toNumber(account.currentBalance),
  };
}

/**
 * Actualiza una cuenta bancaria
 */
export async function updateBankAccount(
  id: string,
  input: Partial<z.infer<typeof updateBankAccountSchema>>
): Promise<BankAccountWithBalance> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  const validated = updateBankAccountSchema.parse(input);

  const existing = await prisma.bankAccount.findFirst({
    where: { id, organizationId },
  });

  if (!existing) {
    throw new Error("Cuenta bancaria no encontrada");
  }

  // Si se cambia el balance inicial, actualizar el actual
  let currentBalance = validated.currentBalance;
  if (validated.initialBalance !== undefined && currentBalance === undefined) {
    const diff = validated.initialBalance - toNumber(existing.initialBalance);
    currentBalance = toNumber(existing.currentBalance) + diff;
  }

  const account = await prisma.bankAccount.update({
    where: { id },
    data: {
      ...validated,
      ...(currentBalance !== undefined && { currentBalance }),
    },
  });

  revalidatePath("/bancos");

  return {
    ...account,
    initialBalance: toNumber(account.initialBalance),
    currentBalance: toNumber(account.currentBalance),
  };
}

/**
 * Elimina una cuenta bancaria
 */
export async function deleteBankAccount(id: string): Promise<void> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  const existing = await prisma.bankAccount.findFirst({
    where: { id, organizationId },
  });

  if (!existing) {
    throw new Error("Cuenta bancaria no encontrada");
  }

  // Verificar que no tenga conciliaciones asociadas
  const reconciliations = await prisma.bankReconciliation.count({
    where: { bankAccountId: id },
  });

  if (reconciliations > 0) {
    throw new Error("No se puede eliminar una cuenta con conciliaciones asociadas");
  }

  await prisma.bankAccount.delete({
    where: { id },
  });

  revalidatePath("/bancos");
}

/**
 * Actualiza el saldo de una cuenta bancaria
 */
export async function updateBankAccountBalance(
  id: string,
  amount: number,
  operation: "ADD" | "SUBTRACT"
): Promise<BankAccountWithBalance> {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new Error("No autorizado");
  }

  const account = await prisma.bankAccount.findFirst({
    where: { id, organizationId },
  });

  if (!account) {
    throw new Error("Cuenta bancaria no encontrada");
  }

  const currentBalance = toNumber(account.currentBalance);
  const newBalance = operation === "ADD" 
    ? currentBalance + amount 
    : currentBalance - amount;

  const updated = await prisma.bankAccount.update({
    where: { id },
    data: { currentBalance: newBalance },
  });

  revalidatePath("/bancos");

  return {
    ...updated,
    initialBalance: toNumber(updated.initialBalance),
    currentBalance: toNumber(updated.currentBalance),
  };
}
