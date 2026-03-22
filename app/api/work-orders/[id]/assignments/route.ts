import { NextResponse } from "next/server";
import { createAssignment } from "@/lib/work-order-actions";
import { auth } from "@/auth";

export async function POST(
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

    if (!data.userId || !data.task) {
      return new NextResponse("userId and task are required", { status: 400 });
    }

    const assignment = await createAssignment(id, {
      userId: data.userId,
      task: data.task,
      estimatedHours: data.estimatedHours,
    });

    return NextResponse.json(assignment);
  } catch (error: any) {
    console.error("Error creating assignment:", error);
    return new NextResponse(error.message || "Error creating assignment", { status: 400 });
  }
}
