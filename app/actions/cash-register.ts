"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logCreate, logUpdate } from "@/lib/activity-log";
import { Decimal } from "decimal.js";

export async function getCurrentShift() {
  const session = await auth();
  if (!session?.user?.organizationId || !session?.user?.id) {
    return null;
  }

  const shift = await prisma.cashDrawerShift.findFirst({
    where: {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      status: "OPEN",
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { payments: true },
      },
    },
    orderBy: { openingDate: "desc" },
  });

  return shift;
}

export async function getShiftById(shiftId: string) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return null;
  }

  const shift = await prisma.cashDrawerShift.findFirst({
    where: {
      id: shiftId,
      organizationId: session.user.organizationId,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      payments: {
        include: {
          invoice: {
            select: { id: true, number: true, client: { select: { name: true } } },
          },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  return shift;
}

export async function openShift(openingAmount: number, notes?: string) {
  const session = await auth();
  if (!session?.user?.organizationId || !session?.user?.id) {
    return { error: "No autorizado" };
  }

  const existingOpenShift = await prisma.cashDrawerShift.findFirst({
    where: {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      status: "OPEN",
    },
  });

  if (existingOpenShift) {
    return { error: "Ya tienes un turno de caja abierto" };
  }

  const shift = await prisma.cashDrawerShift.create({
    data: {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      openingAmount: new Decimal(openingAmount),
      openingNotes: notes || null,
      status: "OPEN",
    },
  });

  await logCreate({
    action: "shift.open",
    description: `Turno de caja abierto con $${Number(openingAmount).toFixed(2)}`,
    entityType: "CashDrawerShift",
    entityId: shift.id,
    module: "caja",
  });

  revalidatePath("/caja");
  revalidatePath("/pos");
  
  return { success: true, shift };
}

export async function closeShift(
  shiftId: string,
  actualAmount: number,
  notes?: string
) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { error: "No autorizado" };
  }

  const shift = await prisma.cashDrawerShift.findFirst({
    where: {
      id: shiftId,
      organizationId: session.user.organizationId,
      status: "OPEN",
    },
    include: {
      payments: true,
    },
  });

  if (!shift) {
    return { error: "Turno no encontrado o ya cerrado" };
  }

  const totalCashSales = shift.payments
    .filter((p) => p.method === "CASH")
    .reduce((sum, p) => sum.plus(p.amount), new Decimal(0));

  const totalCardSales = shift.payments
    .filter((p) => p.method === "CREDIT_CARD")
    .reduce((sum, p) => sum.plus(p.amount), new Decimal(0));

  const totalTransferSales = shift.payments
    .filter((p) => p.method === "BANK_TRANSFER")
    .reduce((sum, p) => sum.plus(p.amount), new Decimal(0));

  const totalSales = totalCashSales.plus(totalCardSales).plus(totalTransferSales);
  const totalPayments = shift.payments.reduce((sum, p) => sum.plus(p.amount), new Decimal(0));
  
  const expectedAmount = new Decimal(shift.openingAmount).plus(totalCashSales);
  const difference = new Decimal(actualAmount).minus(expectedAmount);

  const closedShift = await prisma.cashDrawerShift.update({
    where: { id: shiftId },
    data: {
      status: "CLOSED",
      closingDate: new Date(),
      actualAmount: new Decimal(actualAmount),
      expectedAmount: expectedAmount,
      closingNotes: notes || null,
      totalCashSales,
      totalCardSales,
      totalTransferSales,
      totalSales,
      totalPayments,
      transactionCount: shift.payments.length,
    },
  });

  await logUpdate({
    action: "shift.close",
    description: `Turno de caja cerrado. Diferencia: $${difference.toFixed(2)}`,
    entityType: "CashDrawerShift",
    entityId: shiftId,
    module: "caja",
    oldValues: { status: "OPEN" },
    newValues: { 
      status: "CLOSED", 
      actualAmount: actualAmount,
      difference: difference.toFixed(2),
    },
  });

  revalidatePath("/caja");
  revalidatePath("/pos");
  
  return { 
    success: true, 
    shift: closedShift,
    summary: {
      expectedAmount: expectedAmount.toFixed(2),
      actualAmount: actualAmount.toFixed(2),
      difference: difference.toFixed(2),
      isPositive: difference.gte(0),
    }
  };
}

export async function getShiftHistory(limit = 10) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return [];
  }

  const shifts = await prisma.cashDrawerShift.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { payments: true },
      },
    },
    orderBy: { openingDate: "desc" },
    take: limit,
  });

  return shifts;
}

export async function getShiftSummary(shiftId: string) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return null;
  }

  const shift = await prisma.cashDrawerShift.findFirst({
    where: {
      id: shiftId,
      organizationId: session.user.organizationId,
    },
    include: {
      payments: {
        include: {
          invoice: {
            select: { id: true, number: true, client: { select: { name: true } } },
          },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!shift) return null;

  const summary = {
    shift,
    sales: {
      cash: shift.totalCashSales?.toFixed(2) || "0.00",
      card: shift.totalCardSales?.toFixed(2) || "0.00",
      transfer: shift.totalTransferSales?.toFixed(2) || "0.00",
      total: shift.totalSales?.toFixed(2) || "0.00",
    },
    totals: {
      payments: shift.totalPayments?.toFixed(2) || "0.00",
      opening: shift.openingAmount?.toFixed(2) || "0.00",
      expected: shift.expectedAmount?.toFixed(2) || "0.00",
      actual: shift.actualAmount?.toFixed(2) || "0.00",
    },
    difference: shift.actualAmount && shift.expectedAmount
      ? (Number(shift.actualAmount) - Number(shift.expectedAmount)).toFixed(2)
      : "0.00",
  };

  return summary;
}
