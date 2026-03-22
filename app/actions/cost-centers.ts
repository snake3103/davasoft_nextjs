"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logCreate, logUpdate, logDelete } from "@/lib/activity-log";

const costCenterSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// --- CRUD Operations ---

export async function createCostCenter(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawData = {
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      isActive: formData.get("isActive") !== "false",
    };

    const result = costCenterSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    // Check for duplicate code
    const existing = await prisma.costCenter.findUnique({
      where: { 
        organizationId_code: { 
          organizationId: session.user.organizationId, 
          code: result.data.code 
        } 
      }
    });

    if (existing) {
      return { error: "Ya existe un centro de costo con ese código" };
    }

    const costCenter = await prisma.costCenter.create({
      data: {
        ...result.data,
        organizationId: session.user.organizationId!,
      },
    });

    await logCreate({
      action: "costCenter.create",
      description: `Creó centro de costo "${costCenter.name}" (${costCenter.code})`,
      module: "accounting",
      entityType: "CostCenter",
    });

    revalidatePath("/contabilidad/centros-costo");
    return { success: true, costCenter };
  } catch (error: any) {
    console.error("Error creating cost center:", error);
    return { error: "Error interno al crear centro de costo" };
  }
}

export async function updateCostCenter(id: string, prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawData = {
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      isActive: formData.get("isActive") === "true",
    };

    const result = costCenterSchema.partial().safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    // Check cost center exists
    const existing = await prisma.costCenter.findFirst({
      where: { id, organizationId: session.user.organizationId }
    });

    if (!existing) {
      return { error: "Centro de costo no encontrado" };
    }

    // Check for duplicate code if changing
    if (result.data.code && result.data.code !== existing.code) {
      const duplicate = await prisma.costCenter.findUnique({
        where: { 
          organizationId_code: { 
            organizationId: session.user.organizationId, 
            code: result.data.code 
          } 
        }
      });

      if (duplicate) {
        return { error: "Ya existe un centro de costo con ese código" };
      }
    }

    await prisma.costCenter.update({
      where: { id },
      data: result.data,
    });

    revalidatePath("/contabilidad/centros-costo");
    revalidatePath(`/contabilidad/centros-costo/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating cost center:", error);
    return { error: "Error interno al actualizar centro de costo" };
  }
}

export async function deleteCostCenter(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const costCenter = await prisma.costCenter.findFirst({
      where: { id, organizationId: session.user.organizationId },
      include: {
        _count: { select: { invoices: true, expenses: true, incomes: true } }
      }
    });

    if (!costCenter) {
      return { error: "Centro de costo no encontrado" };
    }

    const totalDocs = costCenter._count.invoices + costCenter._count.expenses + costCenter._count.incomes;

    if (totalDocs > 0) {
      return { error: `No se puede eliminar. Tiene ${totalDocs} documentos asociados.` };
    }

    await prisma.costCenter.delete({ where: { id } });

    await logDelete({
      action: "costCenter.delete",
      description: `Eliminó centro de costo "${costCenter.name}" (${costCenter.code})`,
      module: "accounting",
      entityType: "CostCenter",
    });

    revalidatePath("/contabilidad/centros-costo");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting cost center:", error);
    return { error: "Error interno al eliminar centro de costo" };
  }
}

// --- Get Operations ---

export async function getCostCenters() {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return [];
    }

    const costCenters = await prisma.costCenter.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { code: "asc" },
      include: {
        _count: { select: { invoices: true, expenses: true, incomes: true } }
      }
    });

    return costCenters;
  } catch (error) {
    console.error("Error getting cost centers:", error);
    return [];
  }
}

export async function getCostCenter(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return null;
    }

    const costCenter = await prisma.costCenter.findFirst({
      where: { id, organizationId: session.user.organizationId },
      include: {
        _count: { select: { invoices: true, expenses: true, incomes: true } }
      }
    });

    return costCenter;
  } catch (error) {
    console.error("Error getting cost center:", error);
    return null;
  }
}

// --- Reports ---

export async function getCostCenterSummary(startDate?: string, endDate?: string) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const whereClause: any = { organizationId: session.user.organizationId };
    if (Object.keys(dateFilter).length > 0) {
      whereClause.date = dateFilter;
    }

    // Get invoices by cost center
    const invoicesByCostCenter = await prisma.invoice.groupBy({
      by: ["costCenterId"],
      where: { 
        ...whereClause,
        status: { in: ["PAID", "SENT"] }
      },
      _sum: { total: true },
      _count: true
    });

    // Get expenses by cost center
    const expensesByCostCenter = await prisma.expense.groupBy({
      by: ["costCenterId"],
      where: { 
        ...whereClause,
        status: "PAID"
      },
      _sum: { total: true },
      _count: true
    });

    // Get incomes by cost center
    const incomesByCostCenter = await prisma.income.groupBy({
      by: ["costCenterId"],
      where: { 
        ...whereClause,
        status: "RECEIVED"
      },
      _sum: { amount: true },
      _count: true
    });

    // Get all cost centers
    const costCenters = await prisma.costCenter.findMany({
      where: { organizationId: session.user.organizationId },
      select: { id: true, code: true, name: true }
    });

    // Build summary
    const summary = costCenters.map(cc => {
      const invoice = invoicesByCostCenter.find(i => i.costCenterId === cc.id);
      const expense = expensesByCostCenter.find(e => e.costCenterId === cc.id);
      const income = incomesByCostCenter.find(i => i.costCenterId === cc.id);

      const invoiceTotal = invoice?._sum?.total ? Number(invoice._sum.total) : 0;
      const expenseTotal = expense?._sum?.total ? Number(expense._sum.total) : 0;
      const incomeTotal = income?._sum?.amount ? Number(income._sum.amount) : 0;

      return {
        costCenter: cc,
        invoices: {
          count: invoice?._count || 0,
          total: invoiceTotal
        },
        expenses: {
          count: expense?._count || 0,
          total: expenseTotal
        },
        incomes: {
          count: income?._count || 0,
          total: incomeTotal
        },
        netResult: incomeTotal - expenseTotal
      };
    });

    // Add summary for records without cost center
    const noCostCenter = {
      costCenter: { id: null, code: "N/A", name: "Sin asignar" },
      invoices: {
        count: invoicesByCostCenter.filter(i => !i.costCenterId).reduce((sum, i) => sum + i._count, 0),
        total: invoicesByCostCenter.filter(i => !i.costCenterId).reduce((sum, i) => sum + Number(i._sum?.total || 0), 0)
      },
      expenses: {
        count: expensesByCostCenter.filter(e => !e.costCenterId).reduce((sum, e) => sum + e._count, 0),
        total: expensesByCostCenter.filter(e => !e.costCenterId).reduce((sum, e) => sum + Number(e._sum?.total || 0), 0)
      },
      incomes: {
        count: incomesByCostCenter.filter(i => !i.costCenterId).reduce((sum, i) => sum + i._count, 0),
        total: incomesByCostCenter.filter(i => !i.costCenterId).reduce((sum, i) => sum + Number(i._sum?.amount || 0), 0)
      },
      netResult: 0
    };

    return [noCostCenter, ...summary];
  } catch (error) {
    console.error("Error getting cost center summary:", error);
    return { error: "Error al obtener resumen" };
  }
}
