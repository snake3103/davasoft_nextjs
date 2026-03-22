"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Decimal } from "decimal.js";

// Tipos
export type DepreciationMethod = "STRAIGHT_LINE" | "SUM_OF_YEARS_DIGITS" | "DECLINING_BALANCE";
export type AssetStatus = "ACTIVE" | "IN_REPAIR" | "IN_STORAGE" | "DISPOSED" | "SOLD";

export interface FixedAssetWithCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  location: string | null;
  acquisitionDate: Date;
  acquisitionCost: Decimal;
  salvageValue: Decimal;
  usefulLifeYears: number | null;
  depreciationMethod: DepreciationMethod;
  depreciationStartDate: Date | null;
  status: AssetStatus;
  notes: string | null;
  currentValue: Decimal;
  accumulatedDepreciation: Decimal;
  category: {
    id: string;
    name: string;
    code: string;
    depreciationMethod: DepreciationMethod;
    usefulLifeYears: number;
    depreciationRate: Decimal;
  };
  depreciations: {
    id: string;
    date: Date;
    period: string;
    amount: Decimal;
    accumulated: Decimal;
  }[];
}

export interface AssetStats {
  totalAssets: number;
  totalValue: number;
  accumulatedDepreciation: number;
  netValue: number;
}

// Obtener todos los activos fijos
export async function getFixedAssets(
  organizationId: string,
  filters?: {
    search?: string;
    status?: AssetStatus | "all";
    categoryId?: string;
  }
): Promise<FixedAssetWithCategory[]> {
  const where: any = { organizationId };

  if (filters?.search) {
    where.OR = [
      { code: { contains: filters.search, mode: "insensitive" } },
      { name: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }

  const assets = await prisma.fixedAsset.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          code: true,
          depreciationMethod: true,
          usefulLifeYears: true,
          depreciationRate: true,
        },
      },
      depreciations: {
        orderBy: { period: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return assets as FixedAssetWithCategory[];
}

// Obtener categorías de activos
export async function getAssetCategories(organizationId: string) {
  return prisma.assetCategory.findMany({
    where: { organizationId, isActive: true },
    orderBy: { name: "asc" },
  });
}

// Obtener estadísticas de activos
export async function getAssetStats(organizationId: string): Promise<AssetStats> {
  const assets = await prisma.fixedAsset.findMany({
    where: { organizationId },
    select: {
      acquisitionCost: true,
      currentValue: true,
      accumulatedDepreciation: true,
    },
  });

  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, a) => sum + Number(a.acquisitionCost), 0);
  const accumulatedDepreciation = assets.reduce((sum, a) => sum + Number(a.accumulatedDepreciation), 0);
  const netValue = assets.reduce((sum, a) => sum + Number(a.currentValue), 0);

  return { totalAssets, totalValue, accumulatedDepreciation, netValue };
}

// Crear activo fijo
export async function createFixedAsset(
  organizationId: string,
  data: {
    code: string;
    name: string;
    description?: string;
    categoryId: string;
    location?: string;
    responsibleId?: string;
    acquisitionDate: Date;
    acquisitionCost: number;
    salvageValue?: number;
    usefulLifeYears?: number;
    depreciationMethod: DepreciationMethod;
    notes?: string;
  }
) {
  // Calcular depreciación inicial
  const depreciableAmount = data.acquisitionCost - (data.salvageValue || 0);
  const usefulLife = data.usefulLifeYears || 5;
  const annualDepreciation = depreciableAmount / usefulLife;
  const monthlyDepreciation = annualDepreciation / 12;

  // Obtener la categoría para las cuentas contables
  const category = await prisma.assetCategory.findUnique({
    where: { id: data.categoryId },
  });

  // Crear el activo
  const asset = await prisma.fixedAsset.create({
    data: {
      organizationId,
      code: data.code,
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      location: data.location,
      responsibleId: data.responsibleId,
      acquisitionDate: data.acquisitionDate,
      acquisitionCost: data.acquisitionCost,
      salvageValue: data.salvageValue || 0,
      usefulLifeYears: data.usefulLifeYears,
      depreciationMethod: data.depreciationMethod,
      depreciationStartDate: data.acquisitionDate,
      currentValue: data.acquisitionCost,
      accumulatedDepreciation: 0,
      notes: data.notes,
    },
    include: {
      category: true,
    },
  });

  revalidatePath("/contabilidad/activos");
  return asset;
}

// Actualizar activo fijo
export async function updateFixedAsset(
  assetId: string,
  data: Partial<{
    name: string;
    description: string;
    categoryId: string;
    location: string;
    responsibleId: string;
    salvageValue: number;
    usefulLifeYears: number;
    depreciationMethod: DepreciationMethod;
    status: AssetStatus;
    notes: string;
  }>
) {
  const asset = await prisma.fixedAsset.update({
    where: { id: assetId },
    data,
    include: { category: true },
  });

  revalidatePath("/contabilidad/activos");
  return asset;
}

// Eliminar activo fijo
export async function deleteFixedAsset(assetId: string) {
  await prisma.fixedAsset.delete({
    where: { id: assetId },
  });

  revalidatePath("/contabilidad/activos");
}

// Obtener un activo por ID
export async function getFixedAsset(assetId: string) {
  return prisma.fixedAsset.findUnique({
    where: { id: assetId },
    include: {
      category: true,
      depreciations: {
        orderBy: { period: "desc" },
      },
    },
  });
}

// Generar depreciación para un período
export async function calculateDepreciation(
  assetId: string,
  period: string // "2026-03"
): Promise<{ monthlyAmount: number; accumulated: number }> {
  const asset = await prisma.fixedAsset.findUnique({
    where: { id: assetId },
    include: { category: true },
  });

  if (!asset) throw new Error("Activo no encontrado");

  const acquisitionCost = Number(asset.acquisitionCost);
  const salvageValue = Number(asset.salvageValue);
  const usefulLifeYears = asset.usefulLifeYears || asset.category.usefulLifeYears;
  const depreciableAmount = acquisitionCost - salvageValue;

  let monthlyDepreciation = 0;

  switch (asset.depreciationMethod) {
    case "STRAIGHT_LINE":
      monthlyDepreciation = depreciableAmount / (usefulLifeYears * 12);
      break;
    case "SUM_OF_YEARS_DIGITS":
      // Suma de dígitos = n*(n+1)/2
      const sumOfYears = (usefulLifeYears * (usefulLifeYears + 1)) / 2;
      const remainingYears = usefulLifeYears - Math.floor((Number(period.slice(0, 4)) - asset.acquisitionDate.getFullYear()) + (Number(period.slice(5)) - asset.acquisitionDate.getMonth()) / 12);
      monthlyDepreciation = (depreciableAmount * remainingYears) / sumOfYears / 12;
      break;
    case "DECLINING_BALANCE":
      const rate = 2 / usefulLifeYears;
      const currentValue = Number(asset.currentValue);
      monthlyDepreciation = currentValue * (rate / 12);
      break;
  }

  // Calcular acumulado
  const existingDep = await prisma.assetDepreciation.findMany({
    where: { assetId },
    select: { accumulated: true },
    orderBy: { period: "desc" },
  });

  const currentAccumulated = existingDep.length > 0 ? Number(existingDep[0].accumulated) : 0;
  const newAccumulated = currentAccumulated + monthlyDepreciation;

  return {
    monthlyAmount: monthlyDepreciation,
    accumulated: newAccumulated,
  };
}

// Registrar depreciación del período
export async function recordDepreciation(
  assetId: string,
  period: string,
  amount: number,
  accumulated: number
) {
  // Primero obtener el activo para calcular el valor actual
  const existingAsset = await prisma.fixedAsset.findUnique({
    where: { id: assetId },
  });
  
  if (!existingAsset) {
    throw new Error("Activo no encontrado");
  }
  
  const currentValue = Number(existingAsset.acquisitionCost) - accumulated;
  
  const asset = await prisma.fixedAsset.update({
    where: { id: assetId },
    data: {
      accumulatedDepreciation: accumulated,
      currentValue,
    },
  });

  await prisma.assetDepreciation.create({
    data: {
      assetId,
      organizationId: asset.organizationId,
      date: new Date(),
      period,
      amount,
      accumulated,
    },
  });

  revalidatePath("/contabilidad/activos");
}

// Obtener depreciaciones de todos los activos para un período
export async function getDepreciationsByPeriod(
  organizationId: string,
  period: string
) {
  const assets = await prisma.fixedAsset.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
    },
    include: {
      category: true,
      depreciations: {
        where: { period },
      },
    },
  });

  return assets.map((asset) => {
    const { monthlyAmount, accumulated } = calculateMonthlyDepreciation(asset);
    return {
      asset,
      period,
      monthlyAmount,
      accumulated,
    };
  });
}

// Helper para calcular depreciación mensual
function calculateMonthlyDepreciation(asset: any) {
  const acquisitionCost = Number(asset.acquisitionCost);
  const salvageValue = Number(asset.salvageValue);
  const usefulLifeYears = asset.usefulLifeYears || asset.category.usefulLifeYears;
  const depreciableAmount = acquisitionCost - salvageValue;

  let monthlyDepreciation = 0;

  switch (asset.depreciationMethod) {
    case "STRAIGHT_LINE":
      monthlyDepreciation = depreciableAmount / (usefulLifeYears * 12);
      break;
    case "SUM_OF_YEARS_DIGITS":
      const sumOfYears = (usefulLifeYears * (usefulLifeYears + 1)) / 2;
      const currentAccumulated = Number(asset.accumulatedDepreciation);
      const remainingDepreciable = depreciableAmount - currentAccumulated;
      monthlyDepreciation = (remainingDepreciable * usefulLifeYears) / sumOfYears / 12;
      break;
    case "DECLINING_BALANCE":
      const rate = 2 / usefulLifeYears;
      const currentValue = Number(asset.currentValue);
      monthlyDepreciation = currentValue * (rate / 12);
      break;
  }

  return {
    monthlyAmount: monthlyDepreciation,
    accumulated: Number(asset.accumulatedDepreciation) + monthlyDepreciation,
  };
}

// Generar asientos contables de depreciación
export async function generateDepreciationEntries(
  organizationId: string,
  period: string
) {
  const assets = await prisma.fixedAsset.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
      depreciations: {
        none: { period },
      },
    },
    include: { category: true },
  });

  if (assets.length === 0) {
    return { message: "No hay activos que depreciar en este período", count: 0 };
  }

  const entries = [];
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);

  for (const asset of assets) {
    const { monthlyAmount } = calculateMonthlyDepreciation(asset);

    if (monthlyAmount > 0) {
      // Crear asiento de diario
      const entry = await prisma.journalEntry.create({
        data: {
          organizationId,
          date,
          description: `Depreciación ${asset.name} - ${period}`,
          sourceType: "DEPRECIATION",
          sourceId: asset.id,
          status: "POSTED",
          lines: {
            create: [
              {
                accountId: asset.category.accountExpenseId || "",
                debit: monthlyAmount,
                credit: 0,
                description: "Gasto depreciación",
              },
              {
                accountId: asset.category.accountDepreciationId || "",
                debit: 0,
                credit: monthlyAmount,
                description: "Depreciación acumulada",
              },
            ],
          },
        },
      });

      // Registrar la depreciación
      await prisma.assetDepreciation.create({
        data: {
          assetId: asset.id,
          organizationId,
          date,
          period,
          amount: monthlyAmount,
          accumulated: Number(asset.accumulatedDepreciation) + monthlyAmount,
          journalEntryId: entry.id,
        },
      });

      // Actualizar el activo
      await prisma.fixedAsset.update({
        where: { id: asset.id },
        data: {
          accumulatedDepreciation: Number(asset.accumulatedDepreciation) + monthlyAmount,
          currentValue: Number(asset.acquisitionCost) - (Number(asset.accumulatedDepreciation) + monthlyAmount),
        },
      });

      entries.push({ asset: asset.name, amount: monthlyAmount, entryId: entry.id });
    }
  }

  revalidatePath("/contabilidad/activos");
  revalidatePath("/contabilidad/asientos");

  return {
    message: `Se generaron ${entries.length} asientos de depreciación`,
    count: entries.length,
    entries,
  };
}
