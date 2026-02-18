import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const expenses = await prisma.expense.findMany({
      include: { category: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const expense = await prisma.expense.create({
      data: {
        number: body.number,
        date: new Date(body.date),
        provider: body.provider,
        categoryId: body.categoryId,
        total: body.total,
        status: body.status || "PENDING",
      },
      include: { category: true },
    });
    return NextResponse.json(expense);
  } catch (error) {
    console.error("Expense creation error:", error);
    return NextResponse.json({ error: "Error creating expense" }, { status: 500 });
  }
}
