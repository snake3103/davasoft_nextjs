import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

/**
 * Schema para validación de conciliación bancaria
 */
const reconciliationSchema = z.object({
  bankAccountId: z.string().min(1, "La cuenta bancaria es requerida"),
  date: z.string().or(z.date()).transform(val => new Date(val)),
  initialBalance: z.coerce.number(),
  finalBalance: z.coerce.number(),
  statementTotal: z.coerce.number(),
  notes: z.string().optional().nullable(),
});

/**
 * Schema para crear items de conciliación
 */
const reconciliationItemSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  reference: z.string().optional().nullable(),
  statementDate: z.string().or(z.date()).transform(val => new Date(val)),
  statementAmount: z.coerce.number(),
});

/**
 * GET /api/bank-reconciliations
 * Lista todas las conciliaciones bancarias de la organización
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
    const status = searchParams.get("status");

    const where: any = { organizationId };
    if (bankAccountId) where.bankAccountId = bankAccountId;
    if (status) where.status = status;

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
        _count: {
          select: { items: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(reconciliations);
  } catch (error) {
    console.error("Fetch bank reconciliations error:", error);
    return errorResponse("Error fetching bank reconciliations");
  }
}

/**
 * POST /api/bank-reconciliations
 * Crea una nueva conciliación bancaria con sus items
 */
export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const userId = session?.user?.id;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    
    // Validar datos principales
    const mainData = reconciliationSchema.safeParse(body);
    if (!mainData.success) {
      return NextResponse.json({ error: mainData.error.flatten() }, { status: 400 });
    }

    const { bankAccountId, date, initialBalance, finalBalance, statementTotal, notes } = mainData.data;

    // Validar que la cuenta bancaria exista y pertenezca a la organización
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, organizationId },
    });

    if (!bankAccount) {
      return NextResponse.json({ error: "Cuenta bancaria no encontrada" }, { status: 404 });
    }

    // Calcular totales del sistema basados en transacciones
    // Buscar todas las transacciones (incomes) entre la fecha inicial y final
    const incomes = await prisma.income.findMany({
      where: {
        organizationId,
        bankAccountId,
        date: {
          gte: date,
          lte: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000), // Mes siguiente
        },
        status: "RECEIVED",
      },
    });

    const systemTotal = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
    const difference = statementTotal - systemTotal;

    // Crear la conciliación
    const reconciliation = await prisma.bankReconciliation.create({
      data: {
        organizationId,
        bankAccountId,
        date,
        initialBalance,
        finalBalance,
        statementTotal,
        systemTotal,
        difference,
        notes,
        status: "DRAFT",
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

    // Crear items de conciliación si se proporcionan
    if (body.items && Array.isArray(body.items)) {
      const itemsData = body.items.map((item: z.infer<typeof reconciliationItemSchema>) => {
        const parsed = reconciliationItemSchema.safeParse(item);
        if (parsed.success) {
          return {
            ...parsed.data,
            reconciliationId: reconciliation.id,
          };
        }
        return null;
      }).filter(Boolean);

      if (itemsData.length > 0) {
        await prisma.reconciliationItem.createMany({
          data: itemsData as any[],
        });
      }
    }

    // Actualizar la conciliación con los items
    const reconciliationWithItems = await prisma.bankReconciliation.findUnique({
      where: { id: reconciliation.id },
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
    });

    return NextResponse.json(reconciliationWithItems, { status: 201 });
  } catch (error: any) {
    console.error("Create bank reconciliation error:", error);
    return errorResponse("Error creating bank reconciliation");
  }
}
