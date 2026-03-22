import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/api-helpers";
import { Decimal } from "decimal.js";
import type { ApplyTo } from "@prisma/client";

/**
 * POST /api/retentions/calculate
 * Calcula las retenciones aplicables a una factura
 * 
 * Body: {
 *   type: "SALES" | "PURCHASES",
 *   subtotal: number,
 *   tax: number,
 *   clientId?: string,  // Para facturas de venta
 *   providerId?: string // Para facturas de compra
 * }
 */
export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { type, subtotal, tax, clientId, providerId } = body;

    if (!type || !["SALES", "PURCHASES"].includes(type)) {
      return NextResponse.json(
        { error: "Tipo inválido. Use SALES o PURCHASES" },
        { status: 400 }
      );
    }

    if (typeof subtotal !== "number" || subtotal < 0) {
      return NextResponse.json(
        { error: "Subtotal inválido" },
        { status: 400 }
      );
    }

    // Obtener retenciones aplicables
    const appliesToFilter: { in: ApplyTo[] } = type === "SALES" 
      ? { in: ["SALES", "BOTH"] as ApplyTo[] } 
      : { in: ["PURCHASES", "BOTH"] as ApplyTo[] };
    
    const retentions = await prisma.retention.findMany({
      where: {
        organizationId,
        isActive: true,
        appliesTo: appliesToFilter,
      },
    });

    // Si hay cliente/proveedor, verificar si es agente de retención
    let clientIsAgent = false;
    if (clientId && type === "SALES") {
      const clientData = await prisma.client.findFirst({
        where: { id: clientId, organizationId },
        include: { fiscalData: true },
      });
      clientIsAgent = clientData?.fiscalData?.agentRetention ?? false;
    } else if (providerId && type === "PURCHASES") {
      // Para proveedores, buscar en la tabla de clientes también (muchos sistemas usan Client para ambos)
      const providerData = await prisma.client.findFirst({
        where: { id: providerId, organizationId },
        include: { fiscalData: true },
      });
      clientIsAgent = providerData?.fiscalData?.agentRetention ?? false;
    }

    // Filtrar solo retenciones aplicables para agentes de retención
    // (Normalmente un agente retiene ISR y/o IVA)
    const applicableRetentions = clientIsAgent 
      ? retentions.filter(r => 
          ["ISR_RETENTION", "IVA_RETENTION"].includes(r.type)
        )
      : [];

    // Calcular cada retención
    const calculatedRetentions = applicableRetentions.map(retention => {
      const percentage = new Decimal(retention.percentage);
      
      // Determinar la base de cálculo (subtotal o total con impuesto)
      // La mayoría de retenciones se calculan sobre el subtotal
      const baseAmount = new Decimal(subtotal);
      
      const retentionAmount = baseAmount.times(percentage).div(100);
      
      return {
        id: retention.id,
        name: retention.name,
        type: retention.type,
        percentage: Number(percentage.toFixed(2)),
        baseAmount: Number(baseAmount.toFixed(2)),
        amount: Number(retentionAmount.toDecimalPlaces(2).toFixed(2)),
        description: retention.description,
      };
    });

    const totalRetentions = calculatedRetentions.reduce(
      (sum, r) => sum + r.amount, 
      0
    );

    return NextResponse.json({
      type,
      subtotal,
      tax: tax || 0,
      total: subtotal + (tax || 0),
      clientIsAgent,
      retentionCount: calculatedRetentions.length,
      totalRetentions: Number(totalRetentions.toFixed(2)),
      retentions: calculatedRetentions,
      amountAfterRetentions: Number(
        new Decimal(subtotal)
          .plus(tax || 0)
          .minus(totalRetentions)
          .toFixed(2)
      ),
    });
  } catch (error) {
    console.error("Calculate retentions error:", error);
    return errorResponse("Error al calcular retenciones");
  }
}

/**
 * GET /api/retentions/calculate - Vista previa de tipos de retención disponibles
 */
export async function GET(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // SALES o PURCHASES

    if (!type || !["SALES", "PURCHASES"].includes(type)) {
      return NextResponse.json(
        { error: "Tipo inválido. Use SALES o PURCHASES" },
        { status: 400 }
      );
    }

    const appliesToFilter: { in: ApplyTo[] } = type === "SALES" 
      ? { in: ["SALES", "BOTH"] as ApplyTo[] } 
      : { in: ["PURCHASES", "BOTH"] as ApplyTo[] };

    const retentions = await prisma.retention.findMany({
      where: {
        organizationId,
        isActive: true,
        appliesTo: appliesToFilter,
      },
    });

    // Agrupar por tipo
    const byType = retentions.reduce((acc, r) => {
      if (!acc[r.type]) {
        acc[r.type] = [];
      }
      acc[r.type].push({
        id: r.id,
        name: r.name,
        percentage: Number(r.percentage),
        appliesTo: r.appliesTo,
      });
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      type,
      availableTypes: Object.keys(byType),
      retentionsByType: byType,
    });
  } catch (error) {
    console.error("List available retentions error:", error);
    return errorResponse("Error al listar retenciones disponibles");
  }
}
