import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { invoiceSchema } from "@/lib/schemas/invoice";

export async function GET() {
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  try {
    const invoices = await db.invoice.findMany({
      include: { client: true, items: { include: { product: true } } },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Fetch invoices error:", error);
    return errorResponse("Error fetching invoices");
  }
}

export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = invoiceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { number, date, dueDate, clientId, subtotal = 0, tax = 0, total = 0, status, items } = result.data;

    const client = await db.client.findFirst({ where: { id: clientId, organizationId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 400 });
    }

    const invoice = await db.$transaction(async (tx: any) => {
      // 1. Create the invoice
      const newInvoice = await tx.invoice.create({
        data: {
          number,
          date: new Date(date),
          dueDate: dueDate ? new Date(dueDate) : null,
          clientId,
          subtotal: Number(subtotal),
          tax: Number(tax),
          total: Number(total),
          status: status || "DRAFT",
          organizationId,
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
        include: { items: true },
      });

      // 2. Adjust stock for each item that has a productId
      for (const item of items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId, organizationId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return newInvoice;
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Invoice creation error:", error);
    return errorResponse("Error creating invoice");
  }
}
