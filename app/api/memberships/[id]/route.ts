import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateMemberSchema = z.object({
  systemRole: z.enum(["ADMIN", "CONTADOR", "VENDEDOR", "USER"]).optional(),
  roleId: z.string().optional().nullable(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateMemberSchema.parse(body);

    const orgId = session.user.organizationId;

    // Verify membership belongs to org
    const membership = await prisma.membership.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 });
    }

    // Prevent removing yourself
    if (membership.userId === session.user.id) {
      return NextResponse.json(
        { error: "No puedes modificar tu propio rol" },
        { status: 400 }
      );
    }

    const updated = await prisma.membership.update({
      where: { id },
      data: {
        ...(data.systemRole && { systemRole: data.systemRole as any }),
        ...(data.roleId !== undefined && { roleId: data.roleId }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        role: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error updating member:", error);
    return NextResponse.json({ error: "Error updating member" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const orgId = session.user.organizationId;

    // Verify membership belongs to org
    const membership = await prisma.membership.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 });
    }

    // Prevent removing yourself
    if (membership.userId === session.user.id) {
      return NextResponse.json(
        { error: "No puedes eliminarte a ti mismo" },
        { status: 400 }
      );
    }

    await prisma.membership.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json({ error: "Error deleting member" }, { status: 500 });
  }
}
