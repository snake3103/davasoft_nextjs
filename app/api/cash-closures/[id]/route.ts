import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse } from "@/lib/api-helpers";
import { getClosureById } from "@/lib/cash-closure-actions";

// GET - Obtener cuadre específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session } = await getAuthContext();
  if (!session) return unauthorizedResponse();

  try {
    const { id } = await params;
    const closure = await getClosureById(id);

    if (!closure) {
      return NextResponse.json({ error: "Cuadre no encontrado" }, { status: 404 });
    }

    return NextResponse.json(closure);
  } catch (error) {
    console.error("Error fetching closure:", error);
    return NextResponse.json({ error: "Error al obtener cuadre" }, { status: 500 });
  }
}
