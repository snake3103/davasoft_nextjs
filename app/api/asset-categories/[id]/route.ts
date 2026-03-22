import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/api-helpers";
import { assetCategorySchema } from "@/lib/schemas/fixed-asset";

/**
 * GET /api/asset-categories/[id] - Obtiene una categoría por ID
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
    const category = await prisma.assetCategory.findFirst({
      where: { id, organizationId },
      include: { fixedAssets: true },
    });

    if (!category) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Fetch asset category error:", error);
    return errorResponse("Error al obtener categoría");
  }
}

/**
 * PUT /api/asset-categories/[id] - Actualiza una categoría
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = assetCategorySchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.assetCategory.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    const category = await prisma.assetCategory.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Update asset category error:", error);
    return errorResponse("Error al actualizar categoría");
  }
}

/**
 * DELETE /api/asset-categories/[id] - Elimina una categoría
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
    const existing = await prisma.assetCategory.findFirst({
      where: { id, organizationId },
      include: { fixedAssets: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    // Verificar que no tenga activos asociados
    if (existing.fixedAssets.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una categoría con activos asociados" },
        { status: 400 }
      );
    }

    // Soft delete - marcar como inactiva
    await prisma.assetCategory.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete asset category error:", error);
    return errorResponse("Error al eliminar categoría");
  }
}
