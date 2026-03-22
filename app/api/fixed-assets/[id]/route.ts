import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/api-helpers";
import { fixedAssetUpdateSchema } from "@/lib/schemas/fixed-asset";

/**
 * GET /api/fixed-assets/[id] - Obtiene un activo fijo por ID
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
    const asset = await prisma.fixedAsset.findFirst({
      where: { id, organizationId },
      include: {
        category: true,
        depreciations: {
          orderBy: { period: "desc" },
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Activo no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      ...asset,
      currentValue: Number(asset.currentValue),
      accumulatedDepreciation: Number(asset.accumulatedDepreciation),
      acquisitionCost: Number(asset.acquisitionCost),
      salvageValue: Number(asset.salvageValue),
    });
  } catch (error) {
    console.error("Fetch fixed asset error:", error);
    return errorResponse("Error al obtener activo fijo");
  }
}

/**
 * PATCH /api/fixed-assets/[id] - Actualiza un activo fijo
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
    const result = fixedAssetUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.fixedAsset.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Activo no encontrado" }, { status: 404 });
    }

    // No permitir cambios si estáDisposed o Sold
    if (["DISPOSED", "SOLD"].includes(existing.status)) {
      return NextResponse.json(
        { error: "No se puede modificar un activo que ha sido dado de baja o vendido" },
        { status: 400 }
      );
    }

    // Preparar datos para actualizar
    const updateData: any = { ...result.data };
    
    if (updateData.acquisitionDate) {
      updateData.acquisitionDate = new Date(updateData.acquisitionDate);
    }
    if (updateData.depreciationStartDate) {
      updateData.depreciationStartDate = new Date(updateData.depreciationStartDate);
    }
    if (updateData.status === "DISPOSED" || updateData.status === "SOLD") {
      return NextResponse.json(
        { error: "Use los endpoints específicos para dispose o sell" },
        { status: 400 }
      );
    }

    const asset = await prisma.fixedAsset.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Update fixed asset error:", error);
    return errorResponse("Error al actualizar activo fijo");
  }
}

/**
 * DELETE /api/fixed-assets/[id] - Elimina un activo fijo
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
    const existing = await prisma.fixedAsset.findFirst({
      where: { id, organizationId },
      include: { depreciations: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Activo no encontrado" }, { status: 404 });
    }

    // No eliminar si tiene depreciaciones registradas o si está activo
    if (existing.depreciations.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un activo con depreciaciones registradas" },
        { status: 400 }
      );
    }

    if (existing.status === "ACTIVE") {
      return NextResponse.json(
        { error: "No se puede eliminar un activo activo. Primero dalo de baja." },
        { status: 400 }
      );
    }

    await prisma.fixedAsset.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete fixed asset error:", error);
    return errorResponse("Error al eliminar activo fijo");
  }
}
