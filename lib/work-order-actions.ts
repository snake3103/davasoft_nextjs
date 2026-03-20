"use server";

import prisma, { getScopedPrisma } from "@/lib/prisma";
import { vehicleSchema, workOrderSchema, workOrderItemSchema, type VehicleFormData, type WorkOrderFormData } from "@/lib/schemas/vehicle";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-log";

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
  });

  await logActivity({
    type: "CREATE",
    action: "workOrder.create",
    description: `Creó orden de servicio ${number}`,
    module: "workOrders",
    entityType: "WorkOrder",
    entityId: workOrder.id,
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

  const updateData: any = { status: status as any };
  if (status === "DELIVERED") {
    updateData.exitDate = new Date();
  }

  const workOrder = await prismaOrg.workOrder.update({
    where: { id: workOrderId },
    data: updateData,
  });

  await logActivity({
    type: "UPDATE",
    action: "workOrder.status",
    description: `Cambió estado de orden ${workOrder.number} a ${status}`,
    module: "workOrders",
    entityType: "WorkOrder",
    entityId: workOrder.id,
  });

  revalidatePath("/ordenes-servicio");
  return workOrder;
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