import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/api-helpers";
import { assetSellSchema } from "@/lib/schemas/fixed-asset";
import { Decimal } from "decimal.js";

/**
 * POST /api/fixed-assets/[id]/sell
 * Vende un activo fijo
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const { id } = await params;

  if (!organizationId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = assetSellSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { salePrice, buyer, date, notes } = result.data;

    // Obtener el activo
    const asset = await prisma.fixedAsset.findFirst({
      where: { id, organizationId },
      include: { category: true },
    });

    if (!asset) {
      return NextResponse.json({ error: "Activo no encontrado" }, { status: 404 });
    }

    if (asset.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "El activo ya no está activo" },
        { status: 400 }
      );
    }

    const acquisitionCost = new Decimal(asset.acquisitionCost);
    const accumulatedDepreciation = new Decimal(asset.accumulatedDepreciation);
    const saleAmount = new Decimal(salePrice);
    
    // Valor en libros = costo - depreciación acumulada
    const bookValue = acquisitionCost.minus(accumulatedDepreciation);
    
    // Ganancia o pérdida = precio de venta - valor en libros
    const gainLoss = saleAmount.minus(bookValue);

    // Generar asiento contable de venta
    // Débito: Banco/Caja (por el precio de venta)
    // Débito: Depreciación Acumulada (por el valor de la depreciación)
    // Crédito: Activo Fijo (por el costo de adquisición)
    // Crédito o Débito: Ganancia o Pérdida por Venta de Activo
    
    const journalEntry = await prisma.journalEntry.create({
      data: {
        organizationId,
        date: new Date(date),
        description: `Venta de activo fijo: ${asset.code} - ${asset.name}${buyer ? ` a ${buyer}` : ""}`,
        sourceType: "FIXED_ASSET_SELL",
        sourceId: id,
        reference: `VENTA-${asset.code}`,
        status: "POSTED",
        lines: {
          create: [
            // Banco/Caja - dinero recibido (débito)
            {
              accountId: "", // Cuenta de banco (configurable)
              debit: Number(saleAmount.toFixed(2)),
              credit: 0,
              description: `Venta a ${buyer || "Cliente"}`,
            },
            // Depreciación acumulada (débitos para cerrar)
            {
              accountId: asset.category.accountDepreciationId || "",
              debit: Number(accumulatedDepreciation.toFixed(2)),
              credit: 0,
              description: "Cierre depreciación acumulada",
            },
            // Activo fijo (crédito para dar de baja el costo)
            {
              accountId: asset.category.accountAssetId || "",
              debit: 0,
              credit: Number(acquisitionCost.toFixed(2)),
              description: "Baja del activo",
            },
            // Ganancia o pérdida
            ...(gainLoss.greaterThanOrEqualTo(0)
              ? [{
                  accountId: "", // Cuenta de ganancias (configurable)
                  debit: 0,
                  credit: Number(gainLoss.toFixed(2)),
                  description: "Ganancia en venta de activo",
                }]
              : [{
                  accountId: "", // Cuenta de pérdidas (configurable)
                  debit: Number(gainLoss.abs().toFixed(2)),
                  credit: 0,
                  description: "Pérdida en venta de activo",
                }]),
          ],
        },
      },
      include: {
        lines: true,
      },
    });

    // Actualizar estado del activo
    const updatedAsset = await prisma.fixedAsset.update({
      where: { id },
      data: {
        status: "SOLD",
        notes: notes ? `${asset.notes || ""}\n${notes}`.trim() : asset.notes,
        currentValue: 0, // Ya no tiene valor en libros
      },
      include: { category: true },
    });

    return NextResponse.json({
      asset: {
        ...updatedAsset,
        currentValue: Number(updatedAsset.currentValue),
        accumulatedDepreciation: Number(updatedAsset.accumulatedDepreciation),
        acquisitionCost: Number(updatedAsset.acquisitionCost),
        salvageValue: Number(updatedAsset.salvageValue),
      },
      journalEntry: {
        id: journalEntry.id,
        date: journalEntry.date,
        reference: journalEntry.reference,
        description: journalEntry.description,
        lines: journalEntry.lines,
      },
      saleDetails: {
        salePrice: Number(saleAmount.toFixed(2)),
        buyer,
        acquisitionCost: Number(acquisitionCost.toFixed(2)),
        accumulatedDepreciation: Number(accumulatedDepreciation.toFixed(2)),
        bookValue: Number(bookValue.toFixed(2)),
        gainLoss: gainLoss.greaterThanOrEqualTo(0)
          ? { type: "GAIN", amount: Number(gainLoss.toFixed(2)) }
          : { type: "LOSS", amount: Number(gainLoss.abs().toFixed(2)) },
      },
    });
  } catch (error) {
    console.error("Sell asset error:", error);
    return errorResponse("Error al vender activo");
  }
}
