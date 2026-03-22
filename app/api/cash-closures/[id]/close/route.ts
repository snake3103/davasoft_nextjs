import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse } from "@/lib/api-helpers";
import { closeCashClosure } from "@/lib/cash-closure-actions";

// POST - Cerrar cuadre de caja
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session } = await getAuthContext();
  if (!session) return unauthorizedResponse();

  try {
    const { id } = await params;
    const { countedCash, notes } = await request.json();

    if (countedCash === undefined) {
      return NextResponse.json({ error: "Monto contado requerido" }, { status: 400 });
    }

    const closure = await closeCashClosure(
      id,
      Number(countedCash),
      notes
    );

    return NextResponse.json(closure);
  } catch (error: any) {
    console.error("Error closing closure:", error);
    return NextResponse.json({ error: error.message || "Error al cerrar cuadre" }, { status: 400 });
  }
}
