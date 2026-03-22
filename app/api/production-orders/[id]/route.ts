import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  try {
    const order = await db.productionOrder.findUnique({
      where: { id },
      include: {
        product: true,
        productionConsumptions: {
          include: { component: true },
        },
        reservations: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Fetch production order error:", error);
    return errorResponse("Error fetching production order");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { status, notes, plannedDate, startDate, endDate } = body;

    const order = await prisma.productionOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    // Manejar cambios de estado
    if (status && status !== order.status) {
      switch (status) {
        case "CONFIRMED":
          // Al confirmar, las reservaciones pasan a committed (se descuenta stock)
          await db.$transaction(async (tx) => {
            // Descontar stock de los materiales reservados
            const reservations = await tx.productionReservation.findMany({
              where: { productionOrderId: id, status: "RESERVED" },
            });

            for (const reservation of reservations) {
              await tx.product.update({
                where: { id: reservation.productId },
                data: {
                  stock: { decrement: Number(reservation.quantity) },
                },
              });
            }

            // Marcar reservaciones como committed
            await tx.productionReservation.updateMany({
              where: { productionOrderId: id, status: "RESIRMED" },
              data: { status: "COMMITTED" },
            });

            // Actualizar estado de la orden
            await tx.productionOrder.update({
              where: { id },
              data: {
                status: "CONFIRMED",
                notes,
                plannedDate: plannedDate ? new Date(plannedDate) : order.plannedDate,
              },
            });
          });
          break;

        case "IN_PROGRESS":
          await db.productionOrder.update({
            where: { id },
            data: {
              status: "IN_PROGRESS",
              startDate: new Date(),
              notes,
            },
          });
          break;

        case "DONE":
          // Al completar, descontar stock final (por si hay diferencias)
          await db.$transaction(async (tx) => {
            // Calcular consumo real y ajustar inventario
            const consumptions = await tx.productionConsumption.findMany({
              where: { productionOrderId: id },
            });

            for (const consumption of consumptions) {
              const diff = Number(consumption.quantityRequired) - Number(consumption.quantityConsumed);
              if (diff > 0) {
                // Sobró material, reintegrar al stock
                await tx.product.update({
                  where: { id: consumption.componentId },
                  data: {
                    stock: { increment: diff },
                  },
                });
              }
            }

            // Limpiar reservaciones restantes
            await tx.productionReservation.deleteMany({
              where: { productionOrderId: id },
            });

            await tx.productionOrder.update({
              where: { id },
              data: {
                status: "DONE",
                endDate: new Date(),
              },
            });
          });
          break;

        case "CANCELLED":
          // Al cancelar, liberar las reservaciones
          await db.$transaction(async (tx) => {
            // Las reservaciones simplemente se marcan como cancelled
            // No se descuenta stock porque nunca se confirmó
            await tx.productionReservation.updateMany({
              where: { productionOrderId: id, status: "RESERVED" },
              data: { status: "CANCELLED" },
            });

            await tx.productionOrder.update({
              where: { id },
              data: { status: "CANCELLED" },
            });
          });
          break;

        default:
          await db.productionOrder.update({
            where: { id },
            data: { status },
          });
      }
    } else {
      // Solo actualizar otros campos
      await db.productionOrder.update({
        where: { id },
        data: {
          ...(notes !== undefined && { notes }),
          ...(plannedDate !== undefined && { plannedDate: plannedDate ? new Date(plannedDate) : null }),
          ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
          ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        },
      });
    }

    // Obtener orden actualizada
    const updatedOrder = await db.productionOrder.findUnique({
      where: { id },
      include: {
        product: true,
        productionConsumptions: {
          include: { component: true },
        },
        reservations: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Update production order error:", error);
    return errorResponse("Error updating production order");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  try {
    const order = await db.productionOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    // Solo permitir eliminar órdenes en estado DRAFT
    if (order.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Solo se pueden eliminar órdenes en estado Borrador" },
        { status: 400 }
      );
    }

    // Eliminar en cascada (reservaciones y orden)
    await db.$transaction(async (tx) => {
      await tx.productionReservation.deleteMany({
        where: { productionOrderId: id },
      });
      await tx.productionOrder.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete production order error:", error);
    return errorResponse("Error deleting production order");
  }
}
