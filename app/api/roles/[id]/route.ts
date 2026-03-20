import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateRoleSchema.parse(body);

    const orgId = session.user.organizationId;

    // Verify role belongs to org
    const role = await prisma.role.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!role) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }

    // Check name uniqueness if changing
    if (data.name && data.name !== role.name) {
      const existingRole = await prisma.role.findFirst({
        where: {
          organizationId: orgId,
          name: data.name,
          NOT: { id },
        },
      });

      if (existingRole) {
        return NextResponse.json(
          { error: "Ya existe un rol con este nombre" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.role.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.permissions && { permissions: data.permissions }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Error updating role" }, { status: 500 });
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

    // Verify role belongs to org
    const role = await prisma.role.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!role) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }

    // Check if role is in use
    const membershipsWithRole = await prisma.membership.count({
      where: { roleId: id },
    });

    if (membershipsWithRole > 0) {
      return NextResponse.json(
        { error: "No puedes eliminar un rol que está asignado a usuarios" },
        { status: 400 }
      );
    }

    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json({ error: "Error deleting role" }, { status: 500 });
  }
}
