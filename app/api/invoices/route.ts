import { NextResponse } from "next/server";
import { getScopedPrisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function getOrgScoped() {
  const session = await auth();
  if (!session?.user) return { db: null, organizationId: null };
  const organizationId = (session.user as any).organizationId as string | null;
  if (!organizationId) return { db: null, organizationId: null };
  return { db: getScopedPrisma(organizationId), organizationId };
}

export async function GET() {
  const { db } = await getOrgScoped();
  if (!db) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const invoices = await db.invoice.findMany({
      include: { client: true, items: { include: { product: true } } },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(invoices);
  } catch {
    return NextResponse.json({ error: "Error fetching invoices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { db, organizationId } = await getOrgScoped();
  if (!db || !organizationId) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const body = await request.json();

    const client = await db.client.findUnique({ where: { id: body.clientId } });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 400 });

    const invoice = await db.invoice.create({
      data: {
        number: body.number,
        date: new Date(body.date),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        clientId: body.clientId,
        subtotal: body.subtotal,
        tax: body.tax,
        total: body.total,
        status: body.status || "DRAFT",
        organizationId,
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });
    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Invoice creation error:", error);
    return NextResponse.json({ error: "Error creating invoice" }, { status: 500 });
  }
}
