import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

export type ActivityType = "LOGIN" | "LOGOUT" | "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "EXPORT" | "PRINT" | "OTHER";

export interface LogActivityParams {
  type?: ActivityType;
  action: string;
  description: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export async function logActivity(params: LogActivityParams) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId || !session?.user?.id) {
      console.warn("Cannot log activity: no session");
      return;
    }

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || 
                      headersList.get("x-real-ip") || 
                      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await prisma.activityLog.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        type: params.type || "OTHER",
        action: params.action,
        description: params.description,
        module: params.module,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
        newValues: params.newValues ? JSON.stringify(params.newValues) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

// Helper functions for common activities
export async function logLogin(description: string) {
  return logActivity({
    type: "LOGIN",
    action: "auth.login",
    description,
    module: "auth",
  });
}

export async function logLogout(description: string) {
  return logActivity({
    type: "LOGOUT",
    action: "auth.logout",
    description,
    module: "auth",
  });
}

export async function logCreate(params: LogActivityParams) {
  return logActivity({
    ...params,
    type: "CREATE",
  });
}

export async function logUpdate(params: LogActivityParams) {
  return logActivity({
    ...params,
    type: "UPDATE",
  });
}

export async function logDelete(params: LogActivityParams) {
  return logActivity({
    ...params,
    type: "DELETE",
  });
}

export async function logView(params: LogActivityParams) {
  return logActivity({
    ...params,
    type: "VIEW",
  });
}
