import { NextResponse } from "next/server";
import { getWorkOrdersKanban } from "@/lib/work-order-actions";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const board = await getWorkOrdersKanban(session.user.organizationId);
    return NextResponse.json(board);
  } catch (error) {
    console.error("Error fetching kanban board:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
