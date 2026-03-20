"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logCreate } from "@/lib/activity-log";

const clientSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  idNumber: z.string().min(1, "La identificación es obligatoria"),
  type: z.enum(["CLIENT", "PROVIDER", "BOTH"]),
});

export async function createClient(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      idNumber: formData.get("idNumber") as string,
      type: formData.get("type") as any,
    };

    const result = clientSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    await prisma.client.create({
      data: {
        ...result.data,
        organizationId: session.user.organizationId,
      },
    });

    await logCreate({
      action: "client.create",
      description: `Creó cliente ${result.data.name}`,
      module: "clients",
      entityType: "Client",
    });

    revalidatePath("/contactos");
    return { success: true };
  } catch (error: any) {
    return { error: "Error interno del servidor al crear cliente" };
  }
}

export async function updateClient(id: string, prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      idNumber: formData.get("idNumber") as string,
      type: formData.get("type") as any,
    };

    const result = clientSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    await prisma.client.update({
      where: { 
          id,
          organizationId: session.user.organizationId 
      },
      data: result.data,
    });

    revalidatePath("/contactos");
    revalidatePath(`/contactos/${id}`);
    return { success: true };
  } catch (error: any) {
    return { error: "Error interno del servidor al actualizar cliente" };
  }
}

export async function deleteClient(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("No autorizado");
  }

  await prisma.client.delete({
    where: { 
        id,
        organizationId: session.user.organizationId 
    },
  });

  revalidatePath("/contactos");
  return { success: true };
}
