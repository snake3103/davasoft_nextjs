import { NextResponse } from "next/server";
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, getVehicleById } from "@/lib/work-order-actions";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const vehicles = await getVehicles(session.user.organizationId);
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
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
    const vehicle = await createVehicle(data);
    return NextResponse.json(vehicle);
  } catch (error: any) {
    console.error("Error creating vehicle:", error);
    return new NextResponse(error.message || "Error creating vehicle", { status: 400 });
  }
}