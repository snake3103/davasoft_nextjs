import { NextResponse } from "next/server";
import { getScopedPrisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const organizationId = session.user.organizationId;
  if (!organizationId) {
    return new NextResponse("Forbidden: No organization found", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Use scoped client — all queries are automatically filtered by organizationId
  const db = getScopedPrisma(organizationId);

  try {
    const [clients, invoices, products] = await Promise.all([
      db.client.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { idNumber: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      db.invoice.findMany({
        where: {
          number: { contains: query, mode: "insensitive" },
        },
        include: { client: true },
        take: 5,
      }),
      db.product.findMany({
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
        href: `/ventas`, 
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
