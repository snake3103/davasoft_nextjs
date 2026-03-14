import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ["SENT", "PARTIAL"] },
      },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const result = invoices.map((invoice: any) => ({
      id: invoice.id,
      number: invoice.number,
      date: invoice.date,
      clientId: invoice.clientId,
      clientName: invoice.client?.name || "Consumidor Final",
      clientIdNumber: invoice.client?.idNumber,
      total: invoice.total,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      status: invoice.status,
      items: invoice.items,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching pending invoices:", error);
    return NextResponse.json({ error: "Error al obtener facturas" }, { status: 500 });
  }
}
