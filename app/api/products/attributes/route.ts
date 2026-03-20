import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const where: any = { organizationId: session.user.organizationId };
    if (productId) {
      where.OR = [
        { isGlobal: true },
        { id: productId } // This won't work as expected, need different query
      ];
    }

    const attributes = await prisma.productAttribute.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(attributes);
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return NextResponse.json({ error: "Error fetching attributes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, code, type, unit, defaultValue, options, isRequired, isGlobal } = body;

    if (!name || !code || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const attribute = await prisma.productAttribute.create({
      data: {
        organizationId: session.user.organizationId,
        name,
        code: code.toLowerCase(),
        type,
        unit,
        defaultValue,
        options: options ? JSON.stringify(options) : null,
        isRequired: isRequired ?? false,
        isGlobal: isGlobal ?? true,
      },
    });

    return NextResponse.json(attribute);
  } catch (error) {
    console.error("Error creating attribute:", error);
    return NextResponse.json({ error: "Error creating attribute" }, { status: 500 });
  }
}
