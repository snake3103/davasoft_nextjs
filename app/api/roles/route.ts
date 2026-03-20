import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const roleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = session.user.organizationId;

    const roles = await prisma.role.findMany({
      where: { organizationId: orgId },
      include: {
        memberships: {
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json({ error: "Error fetching roles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, permissions } = roleSchema.parse(body);

    const orgId = session.user.organizationId;

    // Check if role name already exists
    const existingRole = await prisma.role.findFirst({
      where: {
        organizationId: orgId,
        name,
      },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "Ya existe un rol con este nombre" },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        organizationId: orgId,
        name,
        description,
        permissions,
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error creating role:", error);
    return NextResponse.json({ error: "Error creating role" }, { status: 500 });
  }
}
