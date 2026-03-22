import { NextResponse } from "next/server";
import { assignMechanic } from "@/lib/work-order-actions";
import { auth } from "@/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const { mechanicId } = await request.json();

    const workOrder = await assignMechanic(id, mechanicId);
    return NextResponse.json(workOrder);
  } catch (error: any) {
    console.error("Error assigning mechanic:", error);
    return new NextResponse(error.message || "Error assigning mechanic", { status: 400 });
  }
}
