import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { Decimal } from "decimal.js";

export async function GET() {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const entries = await db.journalEntry.findMany({
      where: { organizationId },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Transformar los datos para el frontend
    const transformedEntries = entries.map((entry) => {
      const totalDebit = entry.lines.reduce((sum, line) => sum + Number(line.debit), 0);
      const totalCredit = entry.lines.reduce((sum, line) => sum + Number(line.credit), 0);
      
      return {
        id: entry.id,
        date: entry.date.toISOString(),
        description: entry.description,
        reference: entry.reference,
        status: entry.status,
        sourceType: entry.sourceType,
        totalDebit,
        totalCredit,
        lineCount: entry.lines.length,
      };
    });

    return NextResponse.json(transformedEntries);
  } catch (error) {
    console.error("Fetch journal entries error:", error);
    return errorResponse("Error fetching journal entries");
  }
}
