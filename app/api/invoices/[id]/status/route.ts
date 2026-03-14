import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await props.params;
  const invoiceId = resolvedParams.id;
  
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status es requerido" }, { status: 400 });
    }

    const existingInvoice = await db.invoice.findFirst({
      where: { id: invoiceId, organizationId }
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    const updatedInvoice = await db.invoice.update({
      where: { id: invoiceId },
      data: { status },
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("Invoice status update error:", error);
    return errorResponse("Error al actualizar estado de factura");
  }
}