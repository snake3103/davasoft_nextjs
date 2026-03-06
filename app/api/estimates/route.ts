import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { estimateSchema } from "@/lib/schemas/estimate";

export async function GET() {
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  try {
    const estimates = await db.estimate.findMany({
      include: { client: true, items: { include: { product: true } } },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(estimates);
  } catch (error) {
    console.error("Fetch estimates error:", error);
    return errorResponse("Error fetching estimates");
  }
}

export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = estimateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { number, date, dueDate, clientId, subtotal = 0, tax = 0, total = 0, status, items, notes } = result.data;

    const client = await db.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 400 });
    }

    const estimate = await db.estimate.create({
      data: {
        number,
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null,
        clientId,
        subtotal: subtotal as number,
        tax: tax as number,
        total: total as number,
        status: status || "DRAFT",
        notes,
        organizationId,
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
      include: { items: true },
    });
    return NextResponse.json(estimate);
  } catch (error) {
    console.error("Estimate creation error:", error);
    return errorResponse("Error creating estimate");
  }
}
