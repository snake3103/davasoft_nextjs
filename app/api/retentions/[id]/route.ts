import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/api-helpers";
import { retentionUpdateSchema } from "@/lib/schemas/retention";

/**
 * GET /api/retentions/[id] - Obtiene una retención por ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) return unauthorizedResponse();

  try {
    const retention = await prisma.retention.findFirst({
      where: { id, organizationId },
    });

    if (!retention) {
      return NextResponse.json({ error: "Retención no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      ...retention,
      percentage: Number(retention.percentage),
    });
  } catch (error) {
    console.error("Fetch retention error:", error);
    return errorResponse("Error al obtener retención");
  }
}

/**
 * PATCH /api/retentions/[id] - Actualiza una retención
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = retentionUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.retention.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Retención no encontrada" }, { status: 404 });
    }

    const retention = await prisma.retention.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({
      ...retention,
      percentage: Number(retention.percentage),
    });
  } catch (error) {
    console.error("Update retention error:", error);
    return errorResponse("Error al actualizar retención");
  }
}

/**
 * DELETE /api/retentions/[id] - Elimina una retención (soft delete)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) return unauthorizedResponse();

  try {
    const existing = await prisma.retention.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Retención no encontrada" }, { status: 404 });
    }

    // Soft delete - marcar como inactiva
    await prisma.retention.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete retention error:", error);
    return errorResponse("Error al eliminar retención");
  }
}
