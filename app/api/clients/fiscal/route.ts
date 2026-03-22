import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";
import { logCreate, logUpdate } from "@/lib/activity-log";

const fiscalDataSchema = z.object({
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

// GET /api/clients/fiscal?clientId=xxx - Get fiscal data for a client
export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId es requerido" }, { status: 400 });
  }

  try {
    // Verify client belongs to organization
    const client = await db.client.findFirst({
      where: { id: clientId, organizationId },
      include: { fiscalData: true }
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json(client.fiscalData || null);
  } catch (error) {
    console.error("Get fiscal data error:", error);
    return errorResponse("Error al obtener datos fiscales");
  }
}

// POST /api/clients/fiscal - Create or update fiscal data
export async function POST(request: Request) {
  const { db, organizationId, session } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = fiscalDataSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { taxId, fiscalRegime, contributorType, addressFiscal, phoneFiscal, emailBilling, dgiiStatus, agentRetention, agentPerception } = result.data;

    // If clientId provided, verify client
    const clientId = body.clientId;
    if (clientId) {
      const client = await db.client.findFirst({
        where: { id: clientId, organizationId }
      });

      if (!client) {
        return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
      }
    }

    // Upsert fiscal data
    const fiscalData = await db.clientFiscalData.upsert({
      where: { clientId },
      create: {
        clientId,
        taxId,
        fiscalRegime,
        contributorType,
        addressFiscal,
        phoneFiscal,
        emailBilling,
        dgiiStatus,
        agentRetention: agentRetention ?? false,
        agentPerception: agentPerception ?? false,
      },
      update: {
        taxId,
        fiscalRegime,
        contributorType,
        addressFiscal,
        phoneFiscal,
        emailBilling,
        dgiiStatus,
        agentRetention,
        agentPerception,
      },
      include: {
        client: { select: { name: true } }
      }
    });

    // Log activity
    await logCreate({
      action: "client.fiscalData.update",
      description: `Actualizó datos fiscales de "${fiscalData.client.name}"`,
      module: "contacts",
      entityType: "ClientFiscalData",
      entityId: fiscalData.id
    });

    return NextResponse.json(fiscalData);
  } catch (error) {
    console.error("Save fiscal data error:", error);
    return errorResponse("Error al guardar datos fiscales");
  }
}

// DELETE /api/clients/fiscal?clientId=xxx - Delete fiscal data
export async function DELETE(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId es requerido" }, { status: 400 });
  }

  try {
    // Verify client belongs to organization
    const client = await db.client.findFirst({
      where: { id: clientId, organizationId },
      include: { fiscalData: true }
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    if (!client.fiscalData) {
      return NextResponse.json({ error: "No existen datos fiscales para eliminar" }, { status: 404 });
    }

    await db.clientFiscalData.delete({
      where: { clientId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete fiscal data error:", error);
    return errorResponse("Error al eliminar datos fiscales");
  }
}
