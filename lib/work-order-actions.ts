"use server";

import prisma, { getScopedPrisma } from "@/lib/prisma";
import { vehicleSchema, workOrderSchema, workOrderItemSchema, type VehicleFormData, type WorkOrderFormData } from "@/lib/schemas/vehicle";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-log";
import type { NotificationType, NotificationPriority } from "@/lib/notification-actions";

export async function getVehicles(organizationId: string) {
  const prismaOrg = getScopedPrisma(organizationId);
  return await prismaOrg.vehicle.findMany({
    include: {
      client: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVehicleById(vehicleId: string) {
  return await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      client: true,
      workOrders: {
        orderBy: { createdAt: "desc" },
        include: {
          client: true,
          invoice: true,
        },
      },
    },
  });
}

export async function getVehiclesByClient(organizationId: string, clientId: string) {
  const prismaOrg = getScopedPrisma(organizationId);
  return await prismaOrg.vehicle.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createVehicle(data: VehicleFormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const validated = vehicleSchema.parse(data);
  const organizationId = session.user.organizationId;
  if (!organizationId) throw new Error("Organización no encontrada");

  const prismaOrg = getScopedPrisma(organizationId);
  
  const vehicle = await prismaOrg.vehicle.create({
    data: validated as any,
  });

  await logActivity({
    type: "CREATE",
    action: "vehicle.create",
    description: `Creó vehículo ${validated.brand} ${validated.model}`,
    module: "vehicles",
    entityType: "Vehicle",
    entityId: vehicle.id,
  });

  revalidatePath("/vehiculos");
  return vehicle;
}

export async function updateVehicle(vehicleId: string, data: Partial<VehicleFormData>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  const organizationId = session.user.organizationId;
  if (!organizationId) throw new Error("Organización no encontrada");

  const prismaOrg = getScopedPrisma(organizationId);
  
  const vehicle = await prismaOrg.vehicle.update({
    where: { id: vehicleId },
    data,
  });

  await logActivity({
    type: "UPDATE",
    action: "vehicle.update",
    description: `Actualizó vehículo ${vehicle.brand} ${vehicle.model}`,
    module: "vehicles",
    entityType: "Vehicle",
    entityId: vehicle.id,
  });

  revalidatePath("/vehiculos");
  return vehicle;
}

export async function deleteVehicle(vehicleId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  const organizationId = session.user.organizationId;
  if (!organizationId) throw new Error("Organización no encontrada");

  const prismaOrg = getScopedPrisma(organizationId);
  
  await prismaOrg.vehicle.delete({
    where: { id: vehicleId },
  });

  await logActivity({
    type: "DELETE",
    action: "vehicle.delete",
    description: `Eliminó vehículo`,
    module: "vehicles",
    entityType: "Vehicle",
    entityId: vehicleId,
  });

  revalidatePath("/vehiculos");
}

export async function getWorkOrders(organizationId: string) {
  const prismaOrg = getScopedPrisma(organizationId);
  return await prismaOrg.workOrder.findMany({
    include: {
      vehicle: true,
      client: true,
      invoice: true,
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWorkOrderById(workOrderId: string) {
  return await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: {
      vehicle: {
        include: {
          client: true,
        },
      },
      client: true,
      invoice: true,
      createdBy: true,
    },
  });
}

export async function getWorkOrdersByVehicle(organizationId: string, vehicleId: string) {
  const prismaOrg = getScopedPrisma(organizationId);
  return await prismaOrg.workOrder.findMany({
    where: { vehicleId },
    include: {
      client: true,
      invoice: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWorkOrdersByStatus(organizationId: string, status: string) {
  const prismaOrg = getScopedPrisma(organizationId);
  return await prismaOrg.workOrder.findMany({
    where: { status: status as any },
    include: {
      vehicle: true,
      client: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getNextWorkOrderNumber(organizationId: string): Promise<string> {
  const prismaOrg = getScopedPrisma(organizationId);
  const lastOrder = await prismaOrg.workOrder.findFirst({
    orderBy: { number: "desc" },
    select: { number: true },
  });

  if (!lastOrder) {
    return "OS-0001";
  }

  const lastNumber = parseInt(lastOrder.number.replace("OS-", ""));
  return `OS-${String(lastNumber + 1).padStart(4, "0")}`;
}

export async function createWorkOrder(data: WorkOrderFormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const organizationId = session.user.organizationId;
  if (!organizationId) throw new Error("Organización no encontrada");

  const validated = workOrderSchema.parse(data);
  const number = await getNextWorkOrderNumber(organizationId);
  const prismaOrg = getScopedPrisma(organizationId);

  const workOrder = await prismaOrg.workOrder.create({
    data: {
      ...validated,
      number,
      createdById: session.user.id,
      workItems: validated.workItems ? JSON.stringify(validated.workItems) : null,
      inventory: validated.inventory ? JSON.stringify(validated.inventory) : null,
      preExistingDamage: validated.preExistingDamage ? JSON.stringify(validated.preExistingDamage) : null,
    } as any,
    include: { vehicle: true, client: true },
  });

  await logActivity({
    type: "CREATE",
    action: "workOrder.create",
    description: `Creó orden de servicio ${number}`,
    module: "workOrders",
    entityType: "WorkOrder",
    entityId: workOrder.id,
  });

  // Crear notificación de nueva orden
  await prismaOrg.notification.create({
    data: {
      organizationId,
      type: "WORK_ORDER_CREATED",
      title: `Nueva Orden ${number}`,
      message: `Se creó orden de servicio para ${workOrder.vehicle?.brand} ${workOrder.vehicle?.model}`,
      link: `/ordenes-servicio/${workOrder.id}`,
      entityType: "workOrder",
      entityId: workOrder.id,
      priority: "NORMAL",
    },
  });

  revalidatePath("/ordenes-servicio");
  return workOrder;
}

export async function updateWorkOrder(workOrderId: string, data: Partial<WorkOrderFormData>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  const organizationId = session.user.organizationId;
  if (!organizationId) throw new Error("Organización no encontrada");

  const prismaOrg = getScopedPrisma(organizationId);

  const updateData: any = { ...data };
  
  if (data.workItems) {
    updateData.workItems = JSON.stringify(data.workItems);
  }
  if (data.inventory) {
    updateData.inventory = JSON.stringify(data.inventory);
  }
  if (data.preExistingDamage) {
    updateData.preExistingDamage = JSON.stringify(data.preExistingDamage);
  }

  const workOrder = await prismaOrg.workOrder.update({
    where: { id: workOrderId },
    data: updateData,
  });

  await logActivity({
    type: "UPDATE",
    action: "workOrder.update",
    description: `Actualizó orden de servicio ${workOrder.number}`,
    module: "workOrders",
    entityType: "WorkOrder",
    entityId: workOrder.id,
  });

  revalidatePath("/ordenes-servicio");
  return workOrder;
}

export async function updateWorkOrderStatus(workOrderId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  const organizationId = session.user.organizationId;
  if (!organizationId) throw new Error("Organización no encontrada");

  const prismaOrg = getScopedPrisma(organizationId);

  // Obtener la orden antes de actualizar para comparar
  const oldWorkOrder = await prismaOrg.workOrder.findUnique({
    where: { id: workOrderId },
    include: { vehicle: true, client: true, mechanic: true },
  });

  const updateData: any = { status: status as any };
  
  // Set timestamps based on status
  const now = new Date();
  switch (status) {
    case "IN_PROGRESS":
      updateData.startedAt = now;
      break;
    case "FINISHED":
      updateData.completedAt = now;
      break;
    case "DELIVERED":
      updateData.deliveredAt = now;
      updateData.exitDate = now;
      break;
  }

  const workOrder = await prismaOrg.workOrder.update({
    where: { id: workOrderId },
    data: updateData,
    include: { vehicle: true, client: true, mechanic: true },
  });

  await logActivity({
    type: "UPDATE",
    action: "workOrder.status",
    description: `Cambió estado de orden ${workOrder.number} a ${status}`,
    module: "workOrders",
    entityType: "WorkOrder",
    entityId: workOrder.id,
  });

  // Crear notificación de cambio de estado
  const statusLabels: Record<string, string> = {
    RECEIVED: "Recibido",
    DIAGNOSIS: "Diagnóstico",
    APPROVED: "Aprobado",
    IN_PROGRESS: "En Proceso",
    FINISHED: "Terminado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelada",
  };

  await prismaOrg.notification.create({
    data: {
      organizationId,
      type: "WORK_ORDER_STATUS_CHANGED" as NotificationType,
      title: `Orden ${workOrder.number} - ${statusLabels[status] || status}`,
      message: `El vehículo ${workOrder.vehicle?.brand} ${workOrder.vehicle?.model} cambió a estado: ${statusLabels[status] || status}`,
      link: `/ordenes-servicio/${workOrder.id}`,
      entityType: "workOrder",
      entityId: workOrder.id,
      priority: status === "FINISHED" || status === "DELIVERED" ? "HIGH" as NotificationPriority : "NORMAL" as NotificationPriority,
    },
  });

  revalidatePath("/ordenes-servicio");
  revalidatePath("/ordenes-servicio/kanban");
  return workOrder;
}

// ============================================
// KANBAN - Vista de órdenes por estado
// ============================================

export type WorkOrderStatusType = "RECEIVED" | "DIAGNOSIS" | "APPROVED" | "IN_PROGRESS" | "FINISHED" | "DELIVERED" | "CANCELLED";

export type KanbanWorkOrder = {
  id: string;
  number: string;
  status: WorkOrderStatusType;
  entryDate: Date;
  exitDate: Date | null;
  fuelLevel: number;
  description: string | null;
  workItems: string | null;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    plates: string | null;
    client: { name: string };
  };
  client: { name: string };
  mechanic: { id: string; name: string | null; image: string | null } | null;
  createdBy: { id: string; name: string | null };
  assignments: Array<{
    id: string;
    task: string;
    status: string;
    user: { id: string; name: string | null };
  }>;
}

export type KanbanBoard = Record<WorkOrderStatusType, KanbanWorkOrder[]>

export async function getWorkOrdersKanban(organizationId: string) {
  const prismaOrg = getScopedPrisma(organizationId);
  
  const workOrders = await prismaOrg.workOrder.findMany({
    where: {
      status: { not: "CANCELLED" }
    },
    include: {
      vehicle: {
        include: { client: true }
      },
      client: true,
      mechanic: {
        select: { id: true, name: true, image: true }
      },
      assignments: {
        include: { user: true }
      },
      createdBy: {
        select: { id: true, name: true }
      },
    },
    orderBy: { entryDate: "desc" },
  });

  // Group by status
  const board: KanbanBoard = {
    RECEIVED: [],
    DIAGNOSIS: [],
    APPROVED: [],
    IN_PROGRESS: [],
    FINISHED: [],
    DELIVERED: [],
    CANCELLED: [],
  };

  for (const order of workOrders) {
    if (board[order.status as WorkOrderStatusType]) {
      board[order.status as WorkOrderStatusType].push(order as KanbanWorkOrder);
    }
  }

  return board;
}

// ============================================
// ASIGNACIÓN DE MECÁNICOS
// ============================================

export async function assignMechanic(workOrderId: string, mechanicId: string | null) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  const organizationId = session.user.organizationId;
  if (!organizationId) throw new Error("Organización no encontrada");

  const prismaOrg = getScopedPrisma(organizationId);

  const updateData: any = { mechanicId };
  if (mechanicId) {
    updateData.assignedAt = new Date();
  }

  const workOrder = await prismaOrg.workOrder.update({
    where: { id: workOrderId },
    data: updateData,
    include: {
      vehicle: true,
      client: true,
      mechanic: true,
    },
  });

  await logActivity({
    type: "UPDATE",
    action: "workOrder.assignMechanic",
    description: mechanicId 
      ? `Asignó mecánico ${workOrder.mechanic?.name || ""} a orden ${workOrder.number}`
      : `Desasignó mecánico de orden ${workOrder.number}`,
    module: "workOrders",
    entityType: "WorkOrder",
    entityId: workOrder.id,
  });

  revalidatePath("/ordenes-servicio");
  return workOrder;
}

// ============================================
// ASIGNACIONES DE TRABAJO
// ============================================

export async function createAssignment(
  workOrderId: string,
  data: { userId: string; task: string; estimatedHours?: number }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  const organizationId = session.user.organizationId;
  if (!organizationId) throw new Error("Organización no encontrada");

  const prismaOrg = getScopedPrisma(organizationId);

  const assignment = await prismaOrg.workOrderAssignment.create({
    data: {
      workOrderId,
      userId: data.userId,
      task: data.task,
      estimatedHours: data.estimatedHours,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      workOrder: { select: { number: true } },
    },
  });

  await logActivity({
    type: "CREATE",
    action: "workOrder.assignment.create",
    description: `Creó asignación en orden ${assignment.workOrder.number}`,
    module: "workOrders",
    entityType: "WorkOrderAssignment",
    entityId: assignment.id,
  });

  revalidatePath("/ordenes-servicio");
  return assignment;
}

export async function updateAssignment(
  assignmentId: string,
  data: { status?: "PENDING" | "IN_PROGRESS" | "COMPLETED"; actualHours?: number }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  const organizationId = session.user.organizationId;
  if (!organizationId) throw new Error("Organización no encontrada");

  const prismaOrg = getScopedPrisma(organizationId);

  const assignment = await prismaOrg.workOrderAssignment.update({
    where: { id: assignmentId },
    data: {
      ...(data.status && { status: data.status as any }),
      ...(data.actualHours !== undefined && { actualHours: data.actualHours }),
    },
    include: {
      user: { select: { id: true, name: true } },
      workOrder: { select: { number: true } },
    },
  });

  await logActivity({
    type: "UPDATE",
    action: "workOrder.assignment.update",
    description: `Actualizó asignación en orden ${assignment.workOrder.number}`,
    module: "workOrders",
    entityType: "WorkOrderAssignment",
    entityId: assignment.id,
  });

  revalidatePath("/ordenes-servicio");
  return assignment;
}

export async function deleteAssignment(assignmentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  const organizationId = session.user.organizationId;
  if (!organizationId) throw new Error("Organización no encontrada");

  const prismaOrg = getScopedPrisma(organizationId);

  await prismaOrg.workOrderAssignment.delete({
    where: { id: assignmentId },
  });

  revalidatePath("/ordenes-servicio");
}

// ============================================
// CARGA DE TRABAJO DE MECÁNICOS
// ============================================

export type MechanicWorkload = {
  id: string;
  name: string | null;
  image: string | null;
  activeOrders: number;
  completedThisWeek: number;
  estimatedHours: number;
  actualHours: number;
  assignments: {
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export async function getMechanicsWorkload(organizationId: string) {
  const prismaOrg = getScopedPrisma(organizationId);

  // Get all users with work orders or assignments
  const users = await prismaOrg.user.findMany({
    where: {
      OR: [
        { mechanicWorkOrders: { some: { status: { not: "DELIVERED" } } } },
        { workOrderAssignments: { some: {} } },
      ],
    },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const workloads: MechanicWorkload[] = [];

  for (const user of users) {
    // Active orders assigned
    const activeOrders = await prismaOrg.workOrder.count({
      where: {
        mechanicId: user.id,
        status: { in: ["RECEIVED", "DIAGNOSIS", "APPROVED", "IN_PROGRESS"] },
      },
    });

    // Completed this week
    const completedThisWeek = await prismaOrg.workOrder.count({
      where: {
        mechanicId: user.id,
        status: "FINISHED",
        completedAt: { gte: weekAgo },
      },
    });

    // Get assignments for this user
    const assignments = await prismaOrg.workOrderAssignment.findMany({
      where: { userId: user.id },
      include: {
        workOrder: true,
      },
    });

    // Calculate hours
    const estimatedHours = assignments.reduce(
      (sum, a) => sum + (a.estimatedHours ? Number(a.estimatedHours) : 0),
      0
    );
    const actualHours = assignments.reduce(
      (sum, a) => sum + (a.actualHours ? Number(a.actualHours) : 0),
      0
    );

    // Count by status
    const pending = assignments.filter(a => a.status === "PENDING").length;
    const inProgress = assignments.filter(a => a.status === "IN_PROGRESS").length;
    const completed = assignments.filter(a => a.status === "COMPLETED").length;

    workloads.push({
      id: user.id,
      name: user.name,
      image: user.image,
      activeOrders,
      completedThisWeek,
      estimatedHours,
      actualHours,
      assignments: { pending, inProgress, completed },
    });
  }

  return workloads;
}

export async function deleteWorkOrder(workOrderId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  const organizationId = session.user.organizationId;
  if (!organizationId) throw new Error("Organización no encontrada");

  const prismaOrg = getScopedPrisma(organizationId);
  
  const workOrder = await prismaOrg.workOrder.delete({
    where: { id: workOrderId },
  });

  await logActivity({
    type: "DELETE",
    action: "workOrder.delete",
    description: `Eliminó orden de servicio ${workOrder.number}`,
    module: "workOrders",
    entityType: "WorkOrder",
    entityId: workOrderId,
  });

  revalidatePath("/ordenes-servicio");
}