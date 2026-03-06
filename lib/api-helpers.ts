import { auth } from "@/auth";
import { getScopedPrisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Centalizes session, database and organization verification for API routes.
 */
export async function getAuthContext() {
  const session = await auth();
  
  if (!session?.user) {
    return { db: null, organizationId: null, session: null };
  }

  const organizationId = session.user.organizationId;
  if (!organizationId) {
    return { db: null, organizationId: null, session: null };
  }

  return { 
    db: getScopedPrisma(organizationId), 
    organizationId, 
    session 
  };
}

export function unauthorizedResponse() {
  return new NextResponse("Unauthorized", { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return new NextResponse(message, { status: 403 });
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}
