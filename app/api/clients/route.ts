import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { clientSchema } from "@/lib/schemas/client";

export async function GET() {
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  try {
    const clients = await db.client.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Fetch clients error:", error);
    return errorResponse("Error fetching clients");
  }
}

export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = clientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { name, email, phone, address, idNumber, type } = result.data;

    const client = await db.client.create({
      data: {
        name,
        email,
        phone,
        address,
        idNumber,
        type: type || "CLIENT",
        organizationId,
      },
    });
    return NextResponse.json(client);
  } catch (error) {
    console.error("Create client error:", error);
    return errorResponse("Error creating client");
  }
}
