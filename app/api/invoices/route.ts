import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { invoiceSchema } from "@/lib/schemas/invoice";
import { generateInvoiceJournalEntry } from "@/app/actions/accounting";
import { Decimal } from "decimal.js";

export async function GET() {
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  try {
    const invoices = await db.invoice.findMany({
      include: { 
        client: true, 
        items: { include: { product: true } },
        payments: true
      },
      orderBy: { date: "desc" },
    });

    const invoicesWithBalance = invoices.map(invoice => {
      const totalPaid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const balance = Number(invoice.total) - totalPaid;
      
      return {
        ...invoice,
        payments: undefined,
        totalPaid,
        balance: balance < 0.01 ? 0 : balance
      };
    });

    return NextResponse.json(invoicesWithBalance);
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

    const { number, date, dueDate, clientId, subtotal = 0, tax = 0, total = 0, status, items, isPOS = false } = result.data;

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

      // 2. Adjust stock for each item that has a productId and create inventory movement
      for (const item of items) {
        if (item.productId) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          
          if (product) {
            const unitCost = Number(product.cost) || 0;
            const totalCost = new Decimal(item.quantity).mul(unitCost);
            
            await tx.inventoryMovement.create({
              data: {
                organizationId,
                productId: item.productId,
                type: "SALE",
                quantity: item.quantity,
                unitCost,
                totalCost,
                reference: number,
                sourceType: "INVOICE",
                sourceId: newInvoice.id,
              },
            });

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
      }

      return newInvoice;
    });

    // 3. Generate journal entry automatically if invoice is paid or sent
    if (invoice.status === "PAID" || invoice.status === "SENT") {
      try {
        await generateInvoiceJournalEntry(invoice.id, isPOS);
      } catch (journalError) {
        console.error("Error generating journal entry for invoice:", journalError);
        // No fallar la creación de la factura, solo loguear el error contable
      }
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Invoice creation error:", error);
    return errorResponse("Error creating invoice");
  }
}
