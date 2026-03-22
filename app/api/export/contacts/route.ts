import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { createClientsExcel, exportToExcelBuffer } from "@/lib/excel-utils";
import { logCreate } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/export/contacts - Export contacts/clients to Excel
export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // CLIENT, PROVIDER, or BOTH

    // Build where clause
    const whereClause: any = { organizationId };
    if (type && ["CLIENT", "PROVIDER", "BOTH"].includes(type)) {
      whereClause.type = type;
    }

    // Fetch clients
    const clients = await db.client.findMany({
      where: whereClause,
      orderBy: { name: "asc" }
    });

    if (clients.length === 0) {
      return NextResponse.json({ error: "No hay contactos para exportar" }, { status: 404 });
    }

    // Create Excel (now async)
    const buffer = await createClientsExcel(clients);

    // Log activity
    await logCreate({
      action: "contacts.export",
      description: `Exportó ${clients.length} contactos a Excel`,
      module: "contacts",
      entityType: "Client",
    });

    // Return file
    const timestamp = new Date().toISOString().split("T")[0];
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="contactos_${timestamp}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export contacts error:", error);
    return errorResponse("Error al exportar contactos");
  }
}
