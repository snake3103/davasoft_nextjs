import { NextResponse } from "next/server";
import { updateWorkOrderStatus } from "@/lib/work-order-actions";
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
    const { status } = await request.json();
    const workOrder = await updateWorkOrderStatus(id, status);
    return NextResponse.json(workOrder);
  } catch (error: any) {
    console.error("Error updating work order status:", error);
    return new NextResponse(error.message || "Error updating status", { status: 400 });
  }
}