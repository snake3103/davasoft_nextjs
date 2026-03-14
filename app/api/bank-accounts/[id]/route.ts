import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const bankAccountUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  bankName: z.string().min(1).optional(),
  accountNumber: z.string().min(1).optional(),
  accountType: z.enum(["CHECKING", "SAVINGS", "CASH", "CREDIT"]).optional(),
  currency: z.string().optional(),
  initialBalance: z.coerce.number().optional(),
  currentBalance: z.coerce.number().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "CLOSED"]).optional(),
  description: z.string().optional().nullable(),
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
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id, organizationId },
    });

    if (!bankAccount) {
      return NextResponse.json({ error: "Cuenta bancaria no encontrada" }, { status: 404 });
    }

    return NextResponse.json(bankAccount);
  } catch (error) {
    console.error("Fetch bank account error:", error);
    return errorResponse("Error fetching bank account");
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
    const result = bankAccountUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.bankAccount.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Cuenta bancaria no encontrada" }, { status: 404 });
    }

    const updateData = result.data;
    
    if (updateData.initialBalance !== undefined) {
      updateData.currentBalance = Number(updateData.initialBalance) - Number(existing.initialBalance) + Number(existing.currentBalance);
    }

    const bankAccount = await prisma.bankAccount.update({
      where: { id, organizationId },
      data: updateData,
    });

    return NextResponse.json(bankAccount);
  } catch (error: any) {
    console.error("Update bank account error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Ya existe una cuenta con este número" }, { status: 400 });
    }
    return errorResponse("Error updating bank account");
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
    const existing = await prisma.bankAccount.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Cuenta bancaria no encontrada" }, { status: 404 });
    }

    await prisma.bankAccount.delete({
      where: { id, organizationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete bank account error:", error);
    return errorResponse("Error deleting bank account");
  }
}
