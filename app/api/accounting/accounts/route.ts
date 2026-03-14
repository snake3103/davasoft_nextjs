import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const accounts = await db.accountingAccount.findMany({
      where: { organizationId },
      orderBy: { code: "asc" },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Fetch accounting accounts error:", error);
    return errorResponse("Error fetching accounting accounts");
  }
}
