import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const incomeUpdateSchema = z.object({
  number: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
  clientId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  amount: z.number().optional(),
  paymentMethod: z.string().optional(),
  reference: z.string().nullable().optional(),
  status: z.enum(["PENDING", "RECEIVED", "CANCELLED"]).optional(),
  bankAccountId: z.string().nullable().optional(),
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
    const income = await prisma.income.findFirst({
      where: { id, organizationId },
      include: { client: true, category: true, bankAccount: true },
    });

    if (!income) {
      return NextResponse.json({ error: "Ingreso no encontrado" }, { status: 404 });
    }

    return NextResponse.json(income);
  } catch (error) {
    console.error("Fetch income error:", error);
    return errorResponse("Error fetching income");
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
    const result = incomeUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.income.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ingreso no encontrado" }, { status: 404 });
    }

    const income = await prisma.income.update({
      where: { id, organizationId },
      data: result.data,
      include: { client: true, category: true, bankAccount: true },
    });

    return NextResponse.json(income);
  } catch (error) {
    console.error("Update income error:", error);
    return errorResponse("Error updating income");
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
    const existing = await prisma.income.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ingreso no encontrado" }, { status: 404 });
    }

    await prisma.income.delete({
      where: { id, organizationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete income error:", error);
    return errorResponse("Error deleting income");
  }
}