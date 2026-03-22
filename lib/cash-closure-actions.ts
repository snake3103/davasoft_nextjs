"use server";

import prisma, { getScopedPrisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-log";

// ============================================
// CUADRE DE CAJA - POS
// ============================================

export type CashClosureData = {
  id: string;
  organizationId: string;
  userId: string;
  shiftId: string | null;
  openingAmount: number;
  closingAmount: number;
  totalCash: number;
  totalCard: number;
  totalTransfer: number;
  totalOther: number;
  countedCash: number | null;
  difference: number;
  totalSales: number;
  totalRefunds: number;
  totalAmount: number;
  notes: string | null;
  status: "OPEN" | "CLOSED";
  openedAt: Date;
  closedAt: Date | null;
  user?: { id: string; name: string | null };
}

export async function openCashClosure(
  organizationId: string,
  userId: string,
  openingAmount: number,
  notes?: string
): Promise<CashClosureData> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const prismaOrg = getScopedPrisma(organizationId);

  // Check if user has an open closure
  const existingOpen = await prismaOrg.cashClosure.findFirst({
    where: {
      userId,
      status: "OPEN",
    },
  });

  if (existingOpen) {
    throw new Error("Ya existe un cuadre de caja abierto para este usuario");
  }

  const closure = await prismaOrg.cashClosure.create({
    data: {
      organizationId,
      userId,
      openingAmount,
      notes,
      status: "OPEN",
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  await logActivity({
    type: "CREATE",
    action: "cashClosure.open",
    description: `Abrió cuadre de caja`,
    module: "cashClosure",
    entityType: "CashClosure",
    entityId: closure.id,
  });

  revalidatePath("/caja");
  return {
    ...closure,
    openingAmount: Number(closure.openingAmount),
    closingAmount: Number(closure.closingAmount),
    totalCash: Number(closure.totalCash),
    totalCard: Number(closure.totalCard),
    totalTransfer: Number(closure.totalTransfer),
    totalOther: Number(closure.totalOther),
    countedCash: closure.countedCash ? Number(closure.countedCash) : null,
    difference: Number(closure.difference),
    totalAmount: Number(closure.totalAmount),
    notes: closure.notes || null,
  };
}

export async function closeCashClosure(
  closureId: string,
  countedCash: number,
  notes?: string
): Promise<CashClosureData> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  if (!session.user.organizationId) throw new Error("Organización no encontrada");

  const prismaOrg = getScopedPrisma(session.user.organizationId);

  const closure = await prismaOrg.cashClosure.findUnique({
    where: { id: closureId },
  });

  if (!closure) {
    throw new Error("Cuadre de caja no encontrado");
  }

  if (closure.status === "CLOSED") {
    throw new Error("Este cuadre de caja ya está cerrado");
  }

  const difference = Number(countedCash) - Number(closure.openingAmount) - Number(closure.totalCash);

  const updatedClosure = await prismaOrg.cashClosure.update({
    where: { id: closureId },
    data: {
      status: "CLOSED",
      closingAmount: countedCash,
      countedCash,
      difference,
      closedAt: new Date(),
      notes: notes || closure.notes,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  await logActivity({
    type: "UPDATE",
    action: "cashClosure.close",
    description: `Cerró cuadre de caja - Diferencia: ${difference.toFixed(2)}`,
    module: "cashClosure",
    entityType: "CashClosure",
    entityId: closure.id,
  });

  revalidatePath("/caja");
  return {
    ...updatedClosure,
    openingAmount: Number(updatedClosure.openingAmount),
    closingAmount: Number(updatedClosure.closingAmount),
    totalCash: Number(updatedClosure.totalCash),
    totalCard: Number(updatedClosure.totalCard),
    totalTransfer: Number(updatedClosure.totalTransfer),
    totalOther: Number(updatedClosure.totalOther),
    countedCash: updatedClosure.countedCash ? Number(updatedClosure.countedCash) : null,
    difference: Number(updatedClosure.difference),
    totalAmount: Number(updatedClosure.totalAmount),
  };
}

export async function getCurrentClosure(organizationId: string, userId: string): Promise<CashClosureData | null> {
  const prismaOrg = getScopedPrisma(organizationId);

  const closure = await prismaOrg.cashClosure.findFirst({
    where: {
      userId,
      status: "OPEN",
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return closure as CashClosureData | null;
}

export async function getClosuresReport(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<CashClosureData[]> {
  const prismaOrg = getScopedPrisma(organizationId);

  const closures = await prismaOrg.cashClosure.findMany({
    where: {
      organizationId,
      openedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { openedAt: "desc" },
  });

  return closures.map(c => ({
    ...c,
    openingAmount: Number(c.openingAmount),
    closingAmount: Number(c.closingAmount),
    totalCash: Number(c.totalCash),
    totalCard: Number(c.totalCard),
    totalTransfer: Number(c.totalTransfer),
    totalOther: Number(c.totalOther),
    countedCash: c.countedCash ? Number(c.countedCash) : null,
    difference: Number(c.difference),
    totalAmount: Number(c.totalAmount),
  }));
}

export async function updateClosureTotals(
  closureId: string,
  totals: {
    totalCash?: number;
    totalCard?: number;
    totalTransfer?: number;
    totalOther?: number;
    totalSales?: number;
    totalRefunds?: number;
    totalAmount?: number;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  if (!session.user.organizationId) throw new Error("Organización no encontrada");

  const prismaOrg = getScopedPrisma(session.user.organizationId);

  const closure = await prismaOrg.cashClosure.update({
    where: { id: closureId },
    data: totals,
  });

  return closure;
}

export async function getClosureById(closureId: string): Promise<CashClosureData | null> {
  const closure = await prisma.cashClosure.findUnique({
    where: { id: closureId },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  if (!closure) return null;

  return {
    ...closure,
    openingAmount: Number(closure.openingAmount),
    closingAmount: Number(closure.closingAmount),
    totalCash: Number(closure.totalCash),
    totalCard: Number(closure.totalCard),
    totalTransfer: Number(closure.totalTransfer),
    totalOther: Number(closure.totalOther),
    countedCash: closure.countedCash ? Number(closure.countedCash) : null,
    difference: Number(closure.difference),
    totalAmount: Number(closure.totalAmount),
  };
}
