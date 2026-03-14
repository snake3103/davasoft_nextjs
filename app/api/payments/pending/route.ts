import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { getPendingDocuments } from "@/app/actions/payments";

export async function GET() {
  const { organizationId } = await getAuthContext();
  if (!organizationId) return unauthorizedResponse();

  try {
    const result = await getPendingDocuments(organizationId);
    
    if (!result) {
      return errorResponse("Error fetching pending documents");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fetch pending documents error:", error);
    return errorResponse("Error fetching pending documents");
  }
}
