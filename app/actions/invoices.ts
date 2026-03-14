"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { invoiceSchema } from "@/lib/schemas/invoice";
import { generateInvoiceJournalEntry } from "./accounting";

export async function createInvoice(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawItems = formData.get("items") as string;
    const items = JSON.parse(rawItems);

    const dueDateValue = formData.get("dueDate") as string;
    
    const rawData = {
      clientId: formData.get("clientId") as string,
      number: formData.get("number") as string,
      date: formData.get("date") as string,
      dueDate: dueDateValue && dueDateValue.trim() !== "" ? dueDateValue : null,
      notes: formData.get("notes") as string || "",
      status: formData.get("status") as any || "DRAFT",
      items,
    };

    const result = invoiceSchema.safeParse(rawData);
    if (!result.success) {
      console.error("Validation error:", result.error.flatten());
      return { error: result.error.issues[0]?.message || "Error de validación" };
    }

    // Calcular totales en el servidor para mayor seguridad
    const subtotal = result.data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const invoice = await prisma.invoice.create({
      data: {
        clientId: result.data.clientId,
        number: result.data.number,
        date: result.data.date,
        dueDate: result.data.dueDate ? new Date(result.data.dueDate) : null,
        organizationId: session.user.organizationId,
        subtotal,
        tax,
        total,
        status: result.data.status,
        items: {
          create: result.data.items.map(item => ({
            product: item.productId ? { connect: { id: item.productId } } : undefined,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            tax: item.quantity * item.price * 0.18,
            total: item.quantity * item.price * 1.18,
          }))
        }
      },
    });

    // Generar asiento contable automáticamente si la factura está enviada o pagada
    if (invoice.status === "SENT" || invoice.status === "PAID") {
      await generateInvoiceJournalEntry(invoice.id);
    }

    revalidatePath("/ventas");
    revalidatePath("/contabilidad/asientos");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return { error: "Error interno del servidor al crear factura" };
  }
}

export async function updateInvoice(id: string, prevState: any, formData: FormData) {
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

    const result = invoiceSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const subtotal = result.data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    await prisma.$transaction([
      // Eliminar items anteriores
      prisma.invoiceItem.deleteMany({
        where: { invoiceId: id }
      }),
      // Actualizar factura y crear nuevos items
      prisma.invoice.update({
        where: { id, organizationId: session.user.organizationId },
        data: {
          ...result.data,
          subtotal,
          tax,
          total,
          items: {
            create: result.data.items.map(item => ({
              ...item,
              tax: item.quantity * item.price * 0.19,
              total: item.quantity * item.price * 1.19,
              organizationId: session.user.organizationId!
            }))
          }
        }
      })
    ]);

    revalidatePath("/ventas");
    revalidatePath(`/ventas/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating invoice:", error);
    return { error: "Error interno del servidor al actualizar factura" };
  }
}
