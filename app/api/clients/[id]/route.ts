import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { clientSchema } from "@/lib/schemas/client";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await props.params;
  const id = resolvedParams.id;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const client = await db.client.findFirst({
      where: { id, organizationId },
    });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    return NextResponse.json(client);
  } catch (error) {
    console.error("Fetch client error:", error);
    return errorResponse("Error fetching client");
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await props.params;
  const id = resolvedParams.id;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = clientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { name, email, phone, address, idNumber, type } = result.data;

    const client = await db.client.update({
      where: { id, organizationId },
      data: {
        name,
        email,
        phone,
        address,
        idNumber,
        type: type || "CLIENT",
      },
    });
    return NextResponse.json(client);
  } catch (error) {
    console.error("Update client error:", error);
    return errorResponse("Error updating client");
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await props.params;
  const id = resolvedParams.id;
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    await db.client.delete({
      where: { id, organizationId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete client error:", error);
    return errorResponse("Error deleting client");
  }
}
