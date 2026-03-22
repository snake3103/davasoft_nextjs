"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logCreate } from "@/lib/activity-log";

const fiscalDataSchema = z.object({
  clientId: z.string().min(1),
  taxId: z.string().optional(),
  fiscalRegime: z.string().optional(),
  contributorType: z.string().optional(),
  addressFiscal: z.string().optional(),
  phoneFiscal: z.string().optional(),
  emailBilling: z.string().optional(),
  dgiiStatus: z.string().optional(),
  agentRetention: z.boolean().optional(),
  agentPerception: z.boolean().optional(),
});

export async function saveClientFiscalData(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawData = {
      clientId: formData.get("clientId") as string,
      taxId: formData.get("taxId") as string || undefined,
      fiscalRegime: formData.get("fiscalRegime") as string || undefined,
      contributorType: formData.get("contributorType") as string || undefined,
      addressFiscal: formData.get("addressFiscal") as string || undefined,
      phoneFiscal: formData.get("phoneFiscal") as string || undefined,
      emailBilling: formData.get("emailBilling") as string || undefined,
      dgiiStatus: formData.get("dgiiStatus") as string || undefined,
      agentRetention: formData.get("agentRetention") === "true",
      agentPerception: formData.get("agentPerception") === "true",
    };

    const result = fiscalDataSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: { 
        id: result.data.clientId, 
        organizationId: session.user.organizationId 
      }
    });

    if (!client) {
      return { error: "Cliente no encontrado" };
    }

    // Upsert fiscal data
    await prisma.clientFiscalData.upsert({
      where: { clientId: result.data.clientId },
      create: result.data,
      update: result.data,
    });

    await logCreate({
      action: "client.fiscalData.update",
      description: `Actualizó datos fiscales de "${client.name}"`,
      module: "contacts",
      entityType: "ClientFiscalData",
    });

    revalidatePath("/contactos");
    revalidatePath(`/contactos/${result.data.clientId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error saving fiscal data:", error);
    return { error: "Error interno al guardar datos fiscales" };
  }
}

export async function deleteClientFiscalData(clientId: string) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: { 
        id: clientId, 
        organizationId: session.user.organizationId,
        fiscalData: { isNot: null }
      }
    });

    if (!client) {
      return { error: "Cliente o datos fiscales no encontrados" };
    }

    await prisma.clientFiscalData.delete({
      where: { clientId }
    });

    revalidatePath("/contactos");
    revalidatePath(`/contactos/${clientId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting fiscal data:", error);
    return { error: "Error interno al eliminar datos fiscales" };
  }
}

// Get fiscal data for a client
export async function getClientFiscalData(clientId: string) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return null;
    }

    const client = await prisma.client.findFirst({
      where: { 
        id: clientId, 
        organizationId: session.user.organizationId 
      },
      include: { fiscalData: true }
    });

    return client?.fiscalData || null;
  } catch (error) {
    console.error("Error getting fiscal data:", error);
    return null;
  }
}
