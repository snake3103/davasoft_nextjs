import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { clientSchema } from "@/lib/schemas/client";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const { db } = await getAuthContext();
  if (!db) return unauthorizedResponse();

  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    
    if (!organizationId) {
      return unauthorizedResponse();
    }

    const clients = await prisma.client.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      include: {
        invoices: {
          select: { total: true, status: true }
        },
        incomes: {
          select: { amount: true, status: true }
        }
      }
    });

    const clientsWithBalance = clients.map(client => {
      const totalInvoices = client.invoices
        .filter((inv: any) => inv.status !== "CANCELLED" && inv.status !== "VOID")
        .reduce((sum: any, inv: any) => sum + Number(inv.total), 0);
      
      const totalPaid = client.invoices
        .filter((inv: any) => inv.status === "PAID")
        .reduce((sum: any, inv: any) => sum + Number(inv.total), 0);
      
      const pendingInvoices = totalInvoices - totalPaid;

      const totalIncomes = client.incomes
        .filter((inc: any) => inc.status !== "CANCELLED")
        .reduce((sum: any, inc: any) => sum + Number(inc.amount), 0);
      
      const totalIncomesReceived = client.incomes
        .filter((inc: any) => inc.status === "RECEIVED")
        .reduce((sum: any, inc: any) => sum + Number(inc.amount), 0);
      
      const pendingIncomes = totalIncomes - totalIncomesReceived;

      let balance = 0;
      if (client.type === "CLIENT" || client.type === "BOTH") {
        balance += pendingInvoices;
      }
      if (client.type === "PROVIDER" || client.type === "BOTH") {
        balance -= pendingIncomes;
      }

      return {
        ...client,
        invoices: undefined,
        incomes: undefined,
        totalInvoices,
        totalIncomes,
        balance
      };
    });

    return NextResponse.json(clientsWithBalance);
  } catch (error) {
    console.error("Fetch clients error:", error);
    return errorResponse("Error fetching clients");
  }
}

export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = clientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { name, email, phone, address, idNumber, type } = result.data;

    const client = await db.client.create({
      data: {
        name,
        email,
        phone,
        address,
        idNumber,
        type: type || "CLIENT",
        organizationId,
      },
    });
    return NextResponse.json(client);
  } catch (error) {
    console.error("Create client error:", error);
    return errorResponse("Error creating client");
  }
}
