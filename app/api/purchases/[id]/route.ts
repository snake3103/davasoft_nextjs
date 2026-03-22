import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

/**
 * GET /api/purchases/[id] - Obtener una compra
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const purchase = await db.expense.findFirst({
      where: { id, organizationId },
      include: { items: true, category: true },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Fetch purchase error:", error);
    return errorResponse("Error al obtener compra");
  }
}

/**
 * PATCH /api/purchases/[id] - Actualizar una compra
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();

    // Verificar que existe
    const existing = await db.expense.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
    }

    const purchase = await db.expense.update({
      where: { id },
      data: body,
      include: { items: true, category: true },
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Update purchase error:", error);
    return errorResponse("Error al actualizar compra");
  }
}

/**
 * DELETE /api/purchases/[id] - Eliminar una compra
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    // Verificar que existe
    const existing = await db.expense.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
    }

    // Eliminar (los items se eliminan en cascada)
    await db.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete purchase error:", error);
    return errorResponse("Error al eliminar compra");
  }
}
