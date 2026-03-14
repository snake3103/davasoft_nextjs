import { NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "Cliente requerido" }, { status: 400 });
    }

    // Obtener cliente
    const client = await db.client.findUnique({
      where: { id: clientId, organizationId },
      include: {
        invoices: {
          where: {
            status: { in: ["SENT", "PARTIAL", "PAID"] },
          },
          include: {
            payments: true,
          },
          orderBy: { date: "asc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    // Calcular saldo por factura
    const invoicesWithBalance = client.invoices.map((invoice) => {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      
      // Si la factura está PAID pero no tiene pagos, significa que fue pago único al crear
      const effectivePaid = invoice.status === "PAID" && totalPaid === 0 
        ? Number(invoice.total) 
        : totalPaid;
      
      const balance = Number(invoice.total) - effectivePaid;
      
      // Calcular días de vencimiento
      // Si no hay dueDate, usar fecha de factura + 30 días por defecto
      const dueDate = invoice.dueDate 
        ? new Date(invoice.dueDate) 
        : new Date(new Date(invoice.date).setDate(new Date(invoice.date).getDate() + 30));
      
      const now = new Date();
      const diffTime = now.getTime() - dueDate.getTime();
      const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Clasificar por antigüedad (solo si hay saldo pendiente)
      let agingCategory = "current";
      let agingLabel = "Al corriente";
      if (balance > 0) {
        if (daysOverdue > 90) { 
          agingCategory = "over_90"; 
          agingLabel = "+90 días";
        }
        else if (daysOverdue > 60) { 
          agingCategory = "over_60"; 
          agingLabel = "61-90 días";
        }
        else if (daysOverdue > 30) { 
          agingCategory = "over_30"; 
          agingLabel = "31-60 días";
        }
        else if (daysOverdue > 0) { 
          agingCategory = "over_0"; 
          agingLabel = "1-30 días";
        }
      }
      
      return {
        id: invoice.id,
        number: invoice.number,
        date: invoice.date,
        dueDate: invoice.dueDate,
        total: Number(invoice.total),
        paid: effectivePaid,
        balance: balance,
        status: invoice.status,
        daysOverdue: Math.max(0, daysOverdue),
        agingCategory,
        agingLabel,
      };
    });

    // Calcular totales por categoría de antigüedad
    const agingTotals = {
      current: invoicesWithBalance.filter(inv => inv.agingCategory === "current" && inv.balance > 0).reduce((sum, inv) => sum + inv.balance, 0),
      over_0: invoicesWithBalance.filter(inv => inv.agingCategory === "over_0" && inv.balance > 0).reduce((sum, inv) => sum + inv.balance, 0),
      over_30: invoicesWithBalance.filter(inv => inv.agingCategory === "over_30" && inv.balance > 0).reduce((sum, inv) => sum + inv.balance, 0),
      over_60: invoicesWithBalance.filter(inv => inv.agingCategory === "over_60" && inv.balance > 0).reduce((sum, inv) => sum + inv.balance, 0),
      over_90: invoicesWithBalance.filter(inv => inv.agingCategory === "over_90" && inv.balance > 0).reduce((sum, inv) => sum + inv.balance, 0),
    };

    // Calcular totales
    const totalInvoices = invoicesWithBalance.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoicesWithBalance.reduce((sum, inv) => sum + inv.paid, 0);
    const totalBalance = invoicesWithBalance.reduce((sum, inv) => sum + inv.balance, 0);

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        idNumber: client.idNumber,
        address: client.address,
      },
      invoices: invoicesWithBalance,
      totals: {
        totalInvoices,
        totalPaid,
        totalBalance,
      },
      agingTotals,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fetch client statement error:", error);
    return errorResponse("Error fetching client statement");
  }
}
