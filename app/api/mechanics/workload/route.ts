import { NextResponse } from "next/server";
import { getMechanicsWorkload } from "@/lib/work-order-actions";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const workloads = await getMechanicsWorkload(session.user.organizationId);
    return NextResponse.json(workloads);
  } catch (error) {
    console.error("Error fetching mechanics workload:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
