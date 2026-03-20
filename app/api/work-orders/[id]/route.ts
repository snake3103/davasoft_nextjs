import { NextResponse } from "next/server";
import { getWorkOrderById, updateWorkOrder, deleteWorkOrder, updateWorkOrderStatus } from "@/lib/work-order-actions";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workOrder = await getWorkOrderById(id);
    if (!workOrder) {
      return new NextResponse("Work order not found", { status: 404 });
    }
    return NextResponse.json(workOrder);
  } catch (error) {
    console.error("Error fetching work order:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

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
    const data = await request.json();
    const workOrder = await updateWorkOrder(id, data);
    return NextResponse.json(workOrder);
  } catch (error: any) {
    console.error("Error updating work order:", error);
    return new NextResponse(error.message || "Error updating work order", { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    await deleteWorkOrder(id);
    return new NextResponse("Work order deleted", { status: 200 });
  } catch (error: any) {
    console.error("Error deleting work order:", error);
    return new NextResponse(error.message || "Error deleting work order", { status: 400 });
  }
}