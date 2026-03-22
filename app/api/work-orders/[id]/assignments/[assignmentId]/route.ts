import { NextResponse } from "next/server";
import { updateAssignment, deleteAssignment } from "@/lib/work-order-actions";
import { auth } from "@/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { assignmentId } = await params;
    const data = await request.json();

    const assignment = await updateAssignment(assignmentId, {
      status: data.status,
      actualHours: data.actualHours,
    });

    return NextResponse.json(assignment);
  } catch (error: any) {
    console.error("Error updating assignment:", error);
    return new NextResponse(error.message || "Error updating assignment", { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { assignmentId } = await params;

    await deleteAssignment(assignmentId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting assignment:", error);
    return new NextResponse(error.message || "Error deleting assignment", { status: 400 });
  }
}
