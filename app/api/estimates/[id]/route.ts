import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { estimateSchema } from "@/lib/schemas/estimate";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const estimate = await db.estimate.findFirst({
      where: { id, organizationId },
      include: { client: true, items: { include: { product: true } } },
    });

    if (!estimate) {
      return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
    }

    return NextResponse.json(estimate);
  } catch (error) {
    console.error("Fetch estimate error:", error);
    return errorResponse("Error fetching estimate");
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id: estimateId } = await props.params;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = estimateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { number, date, dueDate, clientId, subtotal = 0, tax = 0, total = 0, status, items, notes } = result.data;

    // Check if estimate exists and belongs to the organization
    const existingEstimate = await db.estimate.findFirst({
      where: { id: estimateId, organizationId }
    });

    if (!existingEstimate) {
      return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
    }

    // Update the estimate and its items
    const updatedEstimate = await db.$transaction(async (tx) => {
      // 1. Delete existing items
      await tx.estimateItem.deleteMany({
        where: { estimateId }
      });

      // 2. Update main estimate
      return await tx.estimate.update({
        where: { id: estimateId },
        data: {
          number,
          date: new Date(date),
          dueDate: dueDate ? new Date(dueDate) : null,
          clientId,
          subtotal: subtotal as number,
          tax: tax as number,
          total: total as number,
          status,
          notes,
          items: {
            create: items.map((item) => ({
              quantity: item.quantity,
              price: item.price,
              total: item.total,
              description: item.description,
              ...(item.productId ? { product: { connect: { id: item.productId } } } : {}),
            })) as any,
          },
        },
        include: { items: true }
      });
    });

    return NextResponse.json(updatedEstimate);
  } catch (error) {
    console.error("Estimate update error:", error);
    return errorResponse("Error updating estimate");
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id: estimateId } = await props.params;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const existingEstimate = await db.estimate.findFirst({
      where: { id: estimateId, organizationId }
    });

    if (!existingEstimate) {
      return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
    }

    await db.estimate.delete({
      where: { id: estimateId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Estimate deletion error:", error);
    return errorResponse("Error deleting estimate");
  }
}
