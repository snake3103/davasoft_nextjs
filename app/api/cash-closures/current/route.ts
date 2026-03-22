import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse } from "@/lib/api-helpers";
import { getCurrentClosure } from "@/lib/cash-closure-actions";

// GET - Obtener cierre actual del usuario
export async function GET() {
  const { db, session, organizationId } = await getAuthContext();
  if (!db || !session) return unauthorizedResponse();

  try {
    const closure = await getCurrentClosure(organizationId, session.user.id);
    return NextResponse.json(closure);
  } catch (error) {
    console.error("Error fetching current closure:", error);
    return NextResponse.json({ error: "Error al obtener cuadre de caja" }, { status: 500 });
  }
}
