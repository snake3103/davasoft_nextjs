import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const { id } = await params;
    
    const entry = await db.journalEntry.findUnique({
      where: { 
        id: id,
        organizationId: organizationId,
      },
      include: {
        lines: {
          include: {
            account: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: "Asiento no encontrado" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Fetch journal entry error:", error);
    return errorResponse("Error fetching journal entry");
  }
}
