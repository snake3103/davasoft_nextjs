import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse } from "@/lib/api-helpers";
import { openShift, closeShift, getCurrentShift, getShiftHistory } from "@/app/actions/cash-register";

export async function GET() {
  const { db, session } = await getAuthContext();
  if (!db || !session) return unauthorizedResponse();

  try {
    const shifts = await getShiftHistory(20);
    return NextResponse.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json({ error: "Error al obtener turnos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { db, session } = await getAuthContext();
  if (!db || !session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { action, openingAmount, shiftId, actualAmount, notes } = body;

    if (action === "open") {
      const result = await openShift(openingAmount, notes);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    }

    if (action === "close") {
      if (!shiftId || actualAmount === undefined) {
        return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
      }
      const result = await closeShift(shiftId, actualAmount, notes);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    console.error("Error processing shift:", error);
    return NextResponse.json({ error: "Error al procesar turno" }, { status: 500 });
  }
}
