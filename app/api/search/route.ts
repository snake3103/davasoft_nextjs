import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const [clients, invoices, products] = await Promise.all([
      prisma.client.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { idNumber: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.invoice.findMany({
        where: {
          number: { contains: query, mode: "insensitive" },
        },
        include: { client: true },
        take: 5,
      }),
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
    ]);

    const results = [
      ...clients.map((c: any) => ({
        id: c.id,
        title: c.name,
        subtitle: c.email || c.idNumber || "Cliente",
        type: "client",
        href: `/contactos/${c.id}`,
      })),
      ...invoices.map((i: any) => ({
        id: i.id,
        title: `Factura #${i.number}`,
        subtitle: i.client.name,
        type: "invoice",
        href: `/ventas`, // We can refine this if we have absolute invoice view
      })),
      ...products.map((p: any) => ({
        id: p.id,
        title: p.name,
        subtitle: `SKU: ${p.sku || 'N/A'} - $${p.price}`,
        type: "product",
        href: `/inventario`,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
