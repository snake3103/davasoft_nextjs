"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logCreate, logUpdate, logDelete } from "@/lib/activity-log";

// Crear un nuevo rol
export async function createRole(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado." };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const permissionsRaw = formData.get("permissions") as string;

    if (!name || name.trim().length < 2) {
      return { error: "El nombre del rol es obligatorio (mínimo 2 caracteres)." };
    }

    const permissions = permissionsRaw ? permissionsRaw.split(",").filter(Boolean) : [];

    // @ts-ignore
    const createdRole = await (prisma as any).role.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        permissions,
        organizationId: session.user.organizationId,
      },
    });

    await logCreate({
      action: "role.create",
      description: `Creó rol "${createdRole.name}"`,
      module: "users",
      entityType: "Role",
      entityId: createdRole.id,
    });

    revalidatePath("/configuracion/roles");
    return { success: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { error: "Ya existe un rol con ese nombre en tu organización." };
    }
    console.error("Error creando rol:", error);
    return { error: "Error al crear el rol. Intenta de nuevo." };
  }
}

// Actualizar un rol existente
export async function updateRole(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado." };
    }

    const roleId = formData.get("roleId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const permissionsRaw = formData.get("permissions") as string;

    if (!roleId) return { error: "ID de rol no proporcionado." };
    if (!name || name.trim().length < 2) {
      return { error: "El nombre del rol es obligatorio (mínimo 2 caracteres)." };
    }

    const permissions = permissionsRaw ? permissionsRaw.split(",").filter(Boolean) : [];

    // @ts-ignore
    await (prisma as any).role.update({
      where: { id: roleId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        permissions,
      },
    });

    revalidatePath("/configuracion/roles");
    return { success: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { error: "Ya existe un rol con ese nombre en tu organización." };
    }
    console.error("Error actualizando rol:", error);
    return { error: "Error al actualizar el rol." };
  }
}

// Eliminar un rol
export async function deleteRole(roleId: string) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado." };
    }

    // @ts-ignore
    await (prisma as any).role.delete({
      where: { id: roleId },
    });

    revalidatePath("/configuracion/roles");
    return { success: true };
  } catch (error: any) {
    console.error("Error eliminando rol:", error);
    return { error: "Error al eliminar el rol." };
  }
}

// Asignar (o quitar) un rol personalizado a un miembro de la organización
export async function assignRoleToMember(membershipId: string, roleId: string | null) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado." };
    }

    await prisma.membership.update({
      where: { id: membershipId },
      data: { roleId: roleId || null },
    });

    revalidatePath("/configuracion/usuarios");
    return { success: true };
  } catch (error: any) {
    console.error("Error asignando rol:", error);
    return { error: "Error al asignar el rol." };
  }
}
