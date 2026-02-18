import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching invoices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: body.clientId }
    });
    
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 400 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        number: body.number,
        date: new Date(body.date),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        clientId: body.clientId,
        subtotal: body.subtotal,
        tax: body.tax,
        total: body.total,
        status: body.status || "DRAFT",
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
      include: {
        items: true,
      },
    });
    
    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Invoice creation error:", error);
    return NextResponse.json({ error: "Error creating invoice" }, { status: 500 });
  }
}
