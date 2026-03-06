import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Fetch categories error:", error);
    return errorResponse("Error fetching categories");
  }
}

export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { name, description, type } = body;

    const category = await db.category.create({
      data: {
        name,
        description,
        type: type || "PRODUCT",
        organizationId,
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error("Create category error:", error);
    return errorResponse("Error creating category");
  }
}
