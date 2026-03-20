import { NextResponse } from "next/server";
import { getVehicleById, updateVehicle, deleteVehicle } from "@/lib/work-order-actions";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await getVehicleById(id);
    if (!vehicle) {
      return new NextResponse("Vehicle not found", { status: 404 });
    }
    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
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
    const vehicle = await updateVehicle(id, data);
    return NextResponse.json(vehicle);
  } catch (error: any) {
    console.error("Error updating vehicle:", error);
    return new NextResponse(error.message || "Error updating vehicle", { status: 400 });
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
    await deleteVehicle(id);
    return new NextResponse("Vehicle deleted", { status: 200 });
  } catch (error: any) {
    console.error("Error deleting vehicle:", error);
    return new NextResponse(error.message || "Error deleting vehicle", { status: 400 });
  }
}