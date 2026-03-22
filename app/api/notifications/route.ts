import { NextResponse } from "next/server";
import { getNotifications, markAllNotificationsAsRead } from "@/lib/notification-actions";
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const result = await getNotifications(limit, unreadOnly);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return new NextResponse(error.message || "Error", { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await markAllNotificationsAsRead();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error marking notifications as read:", error);
    return new NextResponse(error.message || "Error", { status: 400 });
  }
}
