import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/api-helpers";
import { assetDisposeSchema } from "@/lib/schemas/fixed-asset";
import { Decimal } from "decimal.js";

/**
 * POST /api/fixed-assets/[id]/dispose
 * Da de baja un activo fijo
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
    const result = assetDisposeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { reason, date, notes } = result.data;

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
    const currentValue = new Decimal(asset.currentValue);
    
    // Valor en libros = costo - depreciación acumulada
    // Si hay pérdida, es un gasto; si hay ganancia, es un ingreso
    const bookValue = acquisitionCost.minus(accumulatedDepreciation);

    // Generar asiento contable de baja
    // Débito: Depreciación Acumulada (por el valor de la depreciación)
    // Débito: Pérdida por Baja (si el valor en libros > 0) o Crédito: Ganancia por Baja (si < 0)
    // Crédito: Activo Fijo (por el costo de adquisición)
    
    const journalEntry = await prisma.journalEntry.create({
      data: {
        organizationId,
        date: new Date(date),
        description: `Baja de activo fijo: ${asset.code} - ${asset.name}. Razón: ${reason}`,
        sourceType: "FIXED_ASSET_DISPOSE",
        sourceId: id,
        reference: `BAJA-${asset.code}`,
        status: "POSTED",
        lines: {
          create: [
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
            // Pérdida o ganancia por diferencia
            ...(bookValue.greaterThan(0)
              ? [{
                  accountId: "", // Cuenta de pérdidas (configurable)
                  debit: Number(bookValue.toFixed(2)),
                  credit: 0,
                  description: "Pérdida por baja de activo",
                }]
              : [{
                  accountId: "", // Cuenta de ganancias (configurable)
                  debit: 0,
                  credit: Number(bookValue.abs().toFixed(2)),
                  description: "Ganancia por baja de activo",
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
        status: "DISPOSED",
        notes: notes ? `${asset.notes || ""}\n${notes}`.trim() : asset.notes,
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
      disposalDetails: {
        acquisitionCost: Number(acquisitionCost.toFixed(2)),
        accumulatedDepreciation: Number(accumulatedDepreciation.toFixed(2)),
        bookValue: Number(bookValue.toFixed(2)),
        gainLoss: bookValue.greaterThan(0)
          ? { type: "LOSS", amount: Number(bookValue.toFixed(2)) }
          : { type: "GAIN", amount: Number(bookValue.abs().toFixed(2)) },
        reason,
      },
    });
  } catch (error) {
    console.error("Dispose asset error:", error);
    return errorResponse("Error al dar de baja activo");
  }
}
