import { NextResponse } from "next/server";
import { unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

/**
 * Schema para validación de cheques
 */
const checkSchema = z.object({
  bankAccountId: z.string().min(1, "La cuenta bancaria es requerida"),
  number: z.string().min(1, "El número de cheque es requerido"),
  type: z.enum(["ISSUED", "RECEIVED"]),
  date: z.string().or(z.date()).transform(val => new Date(val)),
  dueDate: z.string().or(z.date()).transform(val => new Date(val)).optional().nullable(),
  amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
  beneficiary: z.string().min(1, "El beneficiario es requerido"),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/checks
 * Lista todos los cheques de la organización
 */
export async function GET(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const bankAccountId = searchParams.get("bankAccountId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const where: any = { organizationId };
    if (bankAccountId) where.bankAccountId = bankAccountId;
    if (type) where.type = type;
    if (status) where.status = status;

    const checks = await prisma.check.findMany({
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
      },
      orderBy: { date: "desc" },
    });

    // Convertir Decimal a number
    const checksFormatted = checks.map(check => ({
      ...check,
      amount: Number(check.amount),
    }));

    return NextResponse.json(checksFormatted);
  } catch (error) {
    console.error("Fetch checks error:", error);
    return errorResponse("Error fetching checks");
  }
}

/**
 * POST /api/checks
 * Crea un nuevo cheque
 */
export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const result = checkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { bankAccountId, number, type, date, dueDate, amount, beneficiary, notes } = result.data;

    // Verificar que la cuenta bancaria existe
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, organizationId },
    });

    if (!bankAccount) {
      return NextResponse.json({ error: "Cuenta bancaria no encontrada" }, { status: 404 });
    }

    // Verificar que no existe un cheque con el mismo número en la misma cuenta
    const existingCheck = await prisma.check.findFirst({
      where: { bankAccountId, number, type },
    });

    if (existingCheck) {
      return NextResponse.json({ 
        error: `Ya existe un cheque ${type === "ISSUED" ? "emitido" : "recibido"} con el número ${number}` 
      }, { status: 400 });
    }

    const check = await prisma.check.create({
      data: {
        organizationId,
        bankAccountId,
        number,
        type,
        date,
        dueDate,
        amount,
        beneficiary,
        notes,
        status: "PENDING",
      },
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
    }, { status: 201 });
  } catch (error: any) {
    console.error("Create check error:", error);
    return errorResponse("Error creating check");
  }
}
