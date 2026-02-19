import { NextResponse } from "next/server";
import { getScopedPrisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function getOrgScoped() {
  const session = await auth();
  if (!session?.user) return null;
  const organizationId = (session.user as any).organizationId;
  if (!organizationId) return null;
  return getScopedPrisma(organizationId);
}

export async function GET() {
  const db = await getOrgScoped();
  if (!db) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const clients = await db.client.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(clients);
  } catch {
    return NextResponse.json({ error: "Error fetching clients" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const db = await getOrgScoped();
  if (!db) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const body = await request.json();
    const session = await auth();
    const organizationId = (session!.user as any).organizationId;
    const client = await db.client.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        idNumber: body.idNumber,
        organizationId,
      },
    });
    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: "Error creating client" }, { status: 500 });
  }
}
