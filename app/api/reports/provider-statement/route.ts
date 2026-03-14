import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");

    if (!providerId) {
      return NextResponse.json({ error: "Proveedor requerido" }, { status: 400 });
    }

    // Obtener proveedor (cliente con tipo PROVIDER o BOTH)
    const provider = await db.client.findFirst({
      where: { 
        id: providerId, 
        organizationId,
        type: { in: ["PROVIDER", "BOTH"] },
      },
    });

    if (!provider) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }

    // Buscar gastos por el nombre del proveedor
    const expenses = await db.expense.findMany({
      where: {
        organizationId,
        provider: provider.name,
        status: { in: ["PENDING", "PAID"] },
      },
      include: {
        payments: true,
        category: true,
      },
      orderBy: { date: "asc" },
    });

    // Calcular saldo por gasto
    const expensesWithBalance = expenses.map((expense) => {
      const totalPaid = expense.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      
      // Si el gasto está PAID pero no tiene pagos, significa que fue pago único al crear
      const effectivePaid = expense.status === "PAID" && totalPaid === 0 
        ? Number(expense.total) 
        : totalPaid;
      
      const balance = Number(expense.total) - effectivePaid;
      
      return {
        id: expense.id,
        number: expense.number,
        date: expense.date,
        total: Number(expense.total),
        paid: effectivePaid,
        balance: balance,
        status: expense.status,
        category: expense.category?.name || "Sin categoría",
      };
    });

    // Calcular totales
    const totalExpenses = expensesWithBalance.reduce((sum, exp) => sum + exp.total, 0);
    const totalPaid = expensesWithBalance.reduce((sum, exp) => sum + exp.paid, 0);
    const totalBalance = expensesWithBalance.reduce((sum, exp) => sum + exp.balance, 0);

    return NextResponse.json({
      provider: {
        id: provider.id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        idNumber: provider.idNumber,
        address: provider.address,
      },
      expenses: expensesWithBalance,
      totals: {
        totalExpenses,
        totalPaid,
        totalBalance,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fetch provider statement error:", error);
    return errorResponse("Error fetching provider statement");
  }
}
