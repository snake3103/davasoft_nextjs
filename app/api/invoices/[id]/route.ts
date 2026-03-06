import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { invoiceSchema } from "@/lib/schemas/invoice";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  // Unwrapping params as recommended by Next.js 15 docs
  const resolvedParams = await props.params;
  const invoiceId = resolvedParams.id;
  
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = invoiceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { number, date, dueDate, clientId, subtotal = 0, tax = 0, total = 0, status, items } = result.data;

    // Check if invoice exists and belongs to the organization
    const existingInvoice = await db.invoice.findFirst({
      where: { id: invoiceId, organizationId }
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Update the invoice and its items
    const updatedInvoice = await db.$transaction(async (tx: any) => {
      // 1. Get current items to revert their stock
      const oldItems = await tx.invoiceItem.findMany({
        where: { invoiceId },
      });

      // 2. Revert stock from old items
      for (const item of oldItems) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId, organizationId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }

      // 3. Delete existing items
      await tx.invoiceItem.deleteMany({
        where: { invoiceId }
      });

      // 4. Update main invoice and create new items
      const invoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          number,
          date: new Date(date),
          dueDate: dueDate ? new Date(dueDate) : null,
          clientId,
          subtotal: Number(subtotal),
          tax: Number(tax),
          total: Number(total),
          status,
          items: {
            create: items.map((item: any) => ({
              quantity: item.quantity,
              price: item.price,
              total: item.total,
              description: item.description,
              productId: item.productId || null,
            })),
          },
        },
        include: { items: true }
      });

      // 5. Apply stock decrement for new items
      for (const item of items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId, organizationId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      return invoice;
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("Invoice update error:", error);
    return errorResponse("Error updating invoice");
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await props.params;
  const invoiceId = resolvedParams.id;
  
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const existingInvoice = await db.invoice.findFirst({
      where: { id: invoiceId, organizationId },
      include: { items: true }
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await db.$transaction(async (tx: any) => {
      // 1. Revert stock for all items
      for (const item of existingInvoice.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId, organizationId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }

      // 2. Delete the invoice (will cascade delete items if configured, or delete them manually)
      await tx.invoice.delete({
        where: { id: invoiceId }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Invoice deletion error:", error);
    return errorResponse("Error deleting invoice");
  }
}
