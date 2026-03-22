import { NextResponse } from "next/server";
import { unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

/**
 * Schema para actualizar cheques
 */
const updateCheckSchema = z.object({
  number: z.string().min(1).optional(),
  date: z.string().or(z.date()).transform(val => new Date(val)).optional(),
  dueDate: z.string().or(z.date()).transform(val => new Date(val)).optional().nullable(),
  amount: z.coerce.number().min(0.01).optional(),
  beneficiary: z.string().min(1).optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(["PENDING", "DEPOSITED", "CLEARED", "RETURNED", "CANCELLED"]).optional(),
});

/**
 * GET /api/checks/[id]
 * Obtiene un cheque específico
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;

    const check = await prisma.check.findFirst({
      where: { id, organizationId },
      include: {
        bankAccount: {
          select: {
            id: true,
            name: true,
            bankName: true,
            accountNumber: true,
          },
        },
      },
    });

    if (!check) {
      return NextResponse.json({ error: "Cheque no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      ...check,
      amount: Number(check.amount),
    });
  } catch (error) {
    console.error("Fetch check error:", error);
    return errorResponse("Error fetching check");
  }
}

/**
 * PATCH /api/checks/[id]
 * Actualiza un cheque
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    const result = updateCheckSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    // Verificar que el cheque existe
    const existing = await prisma.check.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Cheque no encontrado" }, { status: 404 });
    }

    // No permitir cambios si está CLEARED o CANCELLED
    if (existing.status === "CLEARED" || existing.status === "CANCELLED") {
      return NextResponse.json(
        { error: "No se puede modificar un cheque cobrado o cancelado" },
        { status: 400 }
      );
    }

    const check = await prisma.check.update({
      where: { id },
      data: result.data,
      include: {
        bankAccount: {
          select: {
            id: true,
            name: true,
            bankName: true,
            accountNumber: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...check,
      amount: Number(check.amount),
    });
  } catch (error) {
    console.error("Update check error:", error);
    return errorResponse("Error updating check");
  }
}

/**
 * DELETE /api/checks/[id]
 * Elimina un cheque (solo si está PENDING)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;

    const check = await prisma.check.findFirst({
      where: { id, organizationId },
    });

    if (!check) {
      return NextResponse.json({ error: "Cheque no encontrado" }, { status: 404 });
    }

    // Solo permitir eliminar si está PENDING
    if (check.status !== "PENDING") {
      return NextResponse.json(
        { error: "Solo se pueden eliminar cheques en estado pendiente" },
        { status: 400 }
      );
    }

    await prisma.check.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Cheque eliminado" });
  } catch (error) {
    console.error("Delete check error:", error);
    return errorResponse("Error deleting check");
  }
}
