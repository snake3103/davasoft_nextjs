import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse } from "@/lib/api-helpers";
import { openCashClosure, getClosuresReport } from "@/lib/cash-closure-actions";

// GET - Listar cuadres
export async function GET(request: Request) {
  const { db, session, organizationId } = await getAuthContext();
  if (!db || !session) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (startDate && endDate) {
      const closures = await getClosuresReport(
        organizationId,
        new Date(startDate),
        new Date(endDate)
      );
      return NextResponse.json(closures);
    }

    // Default: last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    const closures = await getClosuresReport(organizationId, start, end);
    return NextResponse.json(closures);
  } catch (error) {
    console.error("Error fetching closures:", error);
    return NextResponse.json({ error: "Error al obtener cuadres" }, { status: 500 });
  }
}

// POST - Abrir cuadre de caja
export async function POST(request: Request) {
  const { db, session, organizationId } = await getAuthContext();
  if (!db || !session) return unauthorizedResponse();

  try {
    const { openingAmount, notes } = await request.json();

    if (openingAmount === undefined) {
      return NextResponse.json({ error: "Monto de apertura requerido" }, { status: 400 });
    }

    const closure = await openCashClosure(
      organizationId,
      session.user.id,
      Number(openingAmount),
      notes
    );

    return NextResponse.json(closure);
  } catch (error: any) {
    console.error("Error opening closure:", error);
    return NextResponse.json({ error: error.message || "Error al abrir cuadre" }, { status: 400 });
  }
}
