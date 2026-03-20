import { NextResponse } from "next/server";
import { getWorkOrders, createWorkOrder } from "@/lib/work-order-actions";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const workOrders = await getWorkOrders(session.user.organizationId);
    return NextResponse.json(workOrders);
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const workOrder = await createWorkOrder(data);
    return NextResponse.json(workOrder);
  } catch (error: any) {
    console.error("Error creating work order:", error);
    return new NextResponse(error.message || "Error creating work order", { status: 400 });
  }
}