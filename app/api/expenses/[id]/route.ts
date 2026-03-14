import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const expenseUpdateSchema = z.object({
  number: z.string().optional(),
  date: z.string().optional(),
  provider: z.string().optional(),
  categoryId: z.string().optional(),
  total: z.number().optional(),
  status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const expense = await prisma.expense.findFirst({
      where: { id, organizationId },
      include: { category: true, items: { include: { product: true } } },
    });

    if (!expense) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Fetch expense error:", error);
    return errorResponse("Error fetching expense");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const result = expenseUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.expense.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    const expense = await prisma.expense.update({
      where: { id, organizationId },
      data: result.data,
      include: { category: true, items: true },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Update expense error:", error);
    return errorResponse("Error updating expense");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const existing = await prisma.expense.findFirst({
      where: { id, organizationId },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    // Reverse inventory movements and stock changes
    for (const item of existing.items) {
      if (item.productId) {
        await prisma.$transaction([
          prisma.inventoryMovement.deleteMany({
            where: { sourceId: id, sourceType: "EXPENSE" },
          }),
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          }),
        ]);
      }
    }

    await prisma.expense.delete({
      where: { id, organizationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete expense error:", error);
    return errorResponse("Error deleting expense");
  }
}
