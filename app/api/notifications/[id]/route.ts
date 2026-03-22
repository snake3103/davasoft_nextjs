import { NextResponse } from "next/server";
import { markNotificationAsRead, deleteNotification } from "@/lib/notification-actions";
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
    const notification = await markNotificationAsRead(id);
    return NextResponse.json(notification);
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return new NextResponse(error.message || "Error", { status: 400 });
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
    await deleteNotification(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return new NextResponse(error.message || "Error", { status: 400 });
  }
}
