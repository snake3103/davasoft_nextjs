"use server";

import prisma, { getScopedPrisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type NotificationType = 
  | "WORK_ORDER_CREATED"
  | "WORK_ORDER_STATUS_CHANGED"
  | "WORK_ORDER_ASSIGNED"
  | "INVOICE_CREATED"
  | "INVOICE_PAID"
  | "PAYMENT_RECEIVED"
  | "LOW_STOCK_ALERT"
  | "DUE_DATE_REMINDER"
  | "SYSTEM_MESSAGE"
  | "USER_ASSIGNED";

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  entityType?: string;
  entityId?: string;
  priority?: NotificationPriority;
  userId?: string;
}

export async function createNotification(data: NotificationData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const organizationId = session.user.organizationId;
  if (!organizationId) throw new Error("Organización no encontrada");

  const prismaOrg = getScopedPrisma(organizationId);

  const notification = await prismaOrg.notification.create({
    data: {
      organizationId,
      userId: data.userId || null,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      entityType: data.entityType,
      entityId: data.entityId,
      priority: data.priority || "NORMAL",
    },
  });

  // Notificar via socket si es en tiempo real
  // Esto se maneja desde el cliente con socket.io

  return notification;
}

export async function getNotifications(limit = 20, unreadOnly = false) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const organizationId = session.user.organizationId;
  if (!organizationId) throw new Error("Organización no encontrada");

  const prismaOrg = getScopedPrisma(organizationId);

  const where: any = {
    organizationId,
    OR: [
      { userId: session.user.id },
      { userId: null }, // Notificaciones globales
    ],
  };

  if (unreadOnly) {
    where.isRead = false;
  }

  const notifications = await prismaOrg.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const unreadCount = await prismaOrg.notification.count({
    where: {
      organizationId,
      isRead: false,
      OR: [
        { userId: session.user.id },
        { userId: null },
      ],
    },
  });

  return { notifications, unreadCount };
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const prismaOrg = getScopedPrisma(session.user.organizationId!);

  const notification = await prismaOrg.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return notification;
}

export async function markAllNotificationsAsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const organizationId = session.user.organizationId!;

  const prismaOrg = getScopedPrisma(organizationId);

  await prismaOrg.notification.updateMany({
    where: {
      organizationId,
      isRead: false,
      OR: [
        { userId: session.user.id },
        { userId: null },
      ],
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  revalidatePath("/");
}

export async function deleteNotification(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const prismaOrg = getScopedPrisma(session.user.organizationId!);

  await prismaOrg.notification.delete({
    where: { id: notificationId },
  });
}
