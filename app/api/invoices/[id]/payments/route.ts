import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const paymentSchema = z.object({
  payments: z.array(z.object({
    type: z.string(),
    amount: z.number(),
  })),
});

async function getCurrentShiftId(organizationId: string, userId: string): Promise<string | null> {
  const shift = await prisma.cashDrawerShift.findFirst({
    where: {
      organizationId,
      userId,
      status: "OPEN",
    },
    select: { id: true },
  });
  return shift?.id || null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const userId = session?.user?.id;
  const { id: invoiceId } = await params;

  if (!organizationId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = paymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { payments } = result.data;

    // Get the invoice
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, organizationId },
      include: {
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    // Calculate total paid so far
    const totalPaid = invoice.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const totalPayment = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const newTotalPaid = totalPaid + totalPayment;
    const invoiceTotal = Number(invoice.total);

    // Determine new status
    let newStatus: "SENT" | "PARTIAL" | "PAID" = invoice.status as "SENT" | "PARTIAL" | "PAID";
    if (newTotalPaid >= invoiceTotal) {
      newStatus = "PAID";
    } else if (newTotalPaid > 0) {
      newStatus = "PARTIAL";
    }

    // Get current open shift if any
    const shiftId = userId ? await getCurrentShiftId(organizationId, userId) : null;

    // Create payments and update invoice in a transaction
    await prisma.$transaction([
      ...payments.map((payment) =>
        prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: payment.amount,
            method: payment.type as any,
            date: new Date(),
            reference: `PAGO-POS-${Date.now()}`,
            shiftId,
          },
        })
      ),
      prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: newStatus },
      }),
    ]);

    return NextResponse.json({ success: true, status: newStatus, shiftId });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json({ error: "Error al procesar pago" }, { status: 500 });
  }
}
