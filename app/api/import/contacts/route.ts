import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { parseExcelFile, validateClientRow, ClientImportRow } from "@/lib/excel-utils";
import { logCreate } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/import/contacts - Import contacts/clients from Excel
export async function POST(request: Request) {
  const { db, organizationId, session } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Archivo no proporcionado" }, { status: 400 });
    }

    // Check file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel"
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json({ error: "Formato de archivo inválido. Use .xlsx o .xls" }, { status: 400 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Parse Excel (now async)
    const rows = await parseExcelFile<ClientImportRow>(buffer);

    if (rows.length === 0) {
      return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 });
    }

    // Process rows
    const results = {
      created: 0,
      updated: 0,
      errors: [] as { row: number; name: string; error: string }[]
    };

    await db.$transaction(async (tx) => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // Excel rows start at 1, +1 for header

        // Validate row
        const validation = validateClientRow(row);
        if (!validation.valid) {
          results.errors.push({ row: rowNumber, name: row.name || "Sin nombre", error: validation.error! });
          continue;
        }

        const clientData = {
          name: row.name.trim(),
          email: row.email?.trim() || null,
          phone: row.phone?.trim() || null,
          address: row.address?.trim() || null,
          idNumber: row.idNumber?.trim() || null,
          type: (row.type as "CLIENT" | "PROVIDER" | "BOTH") || "CLIENT",
        };

        // Check if client exists by idNumber
        if (clientData.idNumber) {
          const existing = await tx.client.findFirst({
            where: { organizationId, idNumber: clientData.idNumber }
          });

          if (existing) {
            // Update existing client
            await tx.client.update({
              where: { id: existing.id },
              data: {
                name: clientData.name,
                email: clientData.email,
                phone: clientData.phone,
                address: clientData.address,
                type: clientData.type,
              }
            });
            results.updated++;
            continue;
          }
        }

        // Also check by email if provided
        if (clientData.email) {
          const existingByEmail = await tx.client.findFirst({
            where: { organizationId, email: clientData.email }
          });

          if (existingByEmail) {
            // Update existing client
            await tx.client.update({
              where: { id: existingByEmail.id },
              data: {
                name: clientData.name,
                phone: clientData.phone,
                address: clientData.address,
                idNumber: clientData.idNumber,
                type: clientData.type,
              }
            });
            results.updated++;
            continue;
          }
        }

        // Create new client
        await tx.client.create({
          data: {
            ...clientData,
            organizationId,
          }
        });
        results.created++;
      }
    });

    // Log activity
    await logCreate({
      action: "contacts.import",
      description: `Importó ${results.created} contactos (${results.updated} actualizados)`,
      module: "contacts",
      entityType: "Client",
    });

    return NextResponse.json({
      success: true,
      message: `Importación completada`,
      results: {
        created: results.created,
        updated: results.updated,
        totalProcessed: rows.length,
        errors: results.errors
      }
    });
  } catch (error) {
    console.error("Import contacts error:", error);
    return errorResponse("Error al importar contactos");
  }
}
