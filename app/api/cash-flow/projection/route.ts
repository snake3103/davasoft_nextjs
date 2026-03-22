import { NextResponse } from "next/server";
import { unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { auth } from "@/auth";
import { getProjectedCashFlow } from "@/app/actions/cash-flow";

/**
 * GET /api/cash-flow/projection
 * Obtiene la proyección de flujo de caja para una cuenta bancaria
 */
export async function GET(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    if (!accountId) {
      return NextResponse.json({ error: "Se requiere accountId" }, { status: 400 });
    }

    // Fechas por defecto: hoy hasta 30 días
    const now = new Date();
    const startDate = startDateStr ? new Date(startDateStr) : now;
    const endDate = endDateStr 
      ? new Date(endDateStr) 
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const projection = await getProjectedCashFlow(accountId, startDate, endDate);

    return NextResponse.json(projection);
  } catch (error: any) {
    console.error("Cash flow projection error:", error);
    
    if (error.message === "Cuenta bancaria no encontrada") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return errorResponse("Error al obtener proyección de flujo de caja");
  }
}
