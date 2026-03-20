"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { estimateSchema } from "@/lib/schemas/estimate";
import { logCreate, logUpdate, logDelete } from "@/lib/activity-log";

export async function createEstimate(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawItems = formData.get("items") as string;
    const items = JSON.parse(rawItems);

    const rawData = {
      clientId: formData.get("clientId") as string,
      number: formData.get("number") as string,
      date: formData.get("date") as string,
      dueDate: formData.get("dueDate") as string || null,
      notes: formData.get("notes") as string || "",
      status: formData.get("status") as any || "DRAFT",
      items,
    };

    const result = estimateSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const { items: estimateItems, ...estimateData } = result.data;

    // Calcular totales en el servidor por seguridad
    const subtotal = estimateItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const tax = 0; // Por ahora 0, expandible
    const total = subtotal + tax;

    const createdEstimate = await prisma.$transaction(async (tx) => {
      return await tx.estimate.create({
        data: {
          ...estimateData,
          organizationId: session.user.organizationId!,
          subtotal,
          tax,
          total,
          items: {
            create: estimateItems.map((item) => ({
              productId: item.productId || null,
              description: item.description,
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price,
            })),
          },
        },
      });
    });

    await logCreate({
      action: "estimate.create",
      description: `Creó cotización ${createdEstimate.number}`,
      module: "estimates",
      entityType: "Estimate",
      entityId: createdEstimate.id,
    });

    revalidatePath("/ventas/cotizaciones");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating estimate:", error);
    return { error: "Error interno al crear cotización" };
  }
}

export async function updateEstimate(id: string, prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawItems = formData.get("items") as string;
    const items = JSON.parse(rawItems);

    const rawData = {
      clientId: formData.get("clientId") as string,
      number: formData.get("number") as string,
      date: formData.get("date") as string,
      dueDate: formData.get("dueDate") as string || null,
      notes: formData.get("notes") as string || "",
      status: formData.get("status") as any || "DRAFT",
      items,
    };

    const result = estimateSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const { items: estimateItems, ...estimateData } = result.data;
    const subtotal = estimateItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const tax = 0;
    const total = subtotal + tax;

    await prisma.$transaction(async (tx) => {
      // 1. Eliminar ítems anteriores
      await tx.estimateItem.deleteMany({
        where: { estimateId: id },
      });

      // 2. Actualizar cotización y crear nuevos ítems
      await tx.estimate.update({
        where: { 
          id,
          organizationId: session.user.organizationId!
        },
        data: {
          ...estimateData,
          subtotal,
          tax,
          total,
          items: {
            create: estimateItems.map((item) => ({
              productId: item.productId || null,
              description: item.description,
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price,
            })),
          },
        },
      });
    });

    revalidatePath("/ventas/cotizaciones");
    revalidatePath(`/ventas/cotizaciones/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating estimate:", error);
    return { error: "Error interno al actualizar cotización" };
  }
}

export async function deleteEstimate(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      throw new Error("No autorizado");
    }

    await prisma.estimate.delete({
      where: { 
        id,
        organizationId: session.user.organizationId!
      },
    });

    revalidatePath("/ventas/cotizaciones");
    return { success: true };
  } catch (error: any) {
    throw new Error("Error al eliminar cotización");
  }
}
