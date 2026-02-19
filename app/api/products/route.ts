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
    const products = await db.product.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { db, organizationId } = await getOrgScoped();
  if (!db || !organizationId) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const body = await request.json();
    const product = await db.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock,
        sku: body.sku,
        organizationId,
      },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Error creating product" }, { status: 500 });
  }
}
