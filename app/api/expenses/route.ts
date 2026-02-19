import { NextResponse } from "next/server";
import { getScopedPrisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function getOrgScoped() {
  const session = await auth();
  if (!session?.user) return { db: null, organizationId: null };
  const organizationId = (session.user as any).organizationId as string | null;
  if (!organizationId) return { db: null, organizationId: null };
  return { db: getScopedPrisma(organizationId), organizationId };
}

export async function GET() {
  const { db } = await getOrgScoped();
  if (!db) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const expenses = await db.expense.findMany({
      include: { category: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(expenses);
  } catch {
    return NextResponse.json({ error: "Error fetching expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { db, organizationId } = await getOrgScoped();
  if (!db || !organizationId) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const body = await request.json();
    const expense = await db.expense.create({
      data: {
        number: body.number,
        date: new Date(body.date),
        provider: body.provider,
        categoryId: body.categoryId,
        total: body.total,
        status: body.status || "PENDING",
        organizationId,
      },
      include: { category: true },
    });
    return NextResponse.json(expense);
  } catch (error) {
    console.error("Expense creation error:", error);
    return NextResponse.json({ error: "Error creating expense" }, { status: 500 });
  }
}
