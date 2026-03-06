import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id: estimateId } = await props.params;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    // 1. Fetch estimate with items
    const estimate = await db.estimate.findFirst({
      where: { id: estimateId, organizationId },
      include: { items: true },
    });

    if (!estimate) {
      return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
    }

    // 2. Create invoice from estimate data
    const invoice = await db.$transaction(async (tx: any) => {
      // 1. Create the invoice
      const newInvoice = await tx.invoice.create({
        data: {
          organizationId,
          clientId: estimate.clientId,
          number: `INV-${estimate.number.replace("COT-", "")}`, // Generate a related number
          date: new Date(),
          subtotal: estimate.subtotal,
          tax: estimate.tax,
          total: estimate.total,
          status: "DRAFT",
          items: {
            create: estimate.items.map((item: any) => ({
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            })),
          },
        },
      });

      // 2. Adjust stock for each item that has a productId
      for (const item of estimate.items) {
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

      // 3. Update estimate status
      await tx.estimate.update({
        where: { id: estimateId, organizationId },
        data: { status: "ACCEPTED" },
      });

      return newInvoice;
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Convert estimate to invoice error:", error);
    return errorResponse("Error converting estimate to invoice");
  }
}
