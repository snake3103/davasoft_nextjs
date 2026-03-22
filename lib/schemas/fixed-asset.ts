import { z } from "zod";

export const assetCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  code: z.string().min(1, "El código es requerido"),
  depreciationMethod: z.enum(["STRAIGHT_LINE", "SUM_OF_YEARS_DIGITS", "DECLINING_BALANCE"]).default("STRAIGHT_LINE"),
  usefulLifeYears: z.number().int().positive().default(5),
  depreciationRate: z.number().positive().max(100).default(20),
  accountAssetId: z.string().optional(),
  accountDepreciationId: z.string().optional(),
  accountExpenseId: z.string().optional(),
});

export const fixedAssetSchema = z.object({
  categoryId: z.string().min(1, "La categoría es requerida"),
  code: z.string().min(1, "El código es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  location: z.string().optional(),
  responsibleId: z.string().optional(),
  acquisitionDate: z.string().or(z.date()),
  acquisitionCost: z.number().positive("El costo debe ser positivo"),
  salvageValue: z.number().min(0).default(0),
  usefulLifeYears: z.number().int().positive().optional(),
  depreciationMethod: z.enum(["STRAIGHT_LINE", "SUM_OF_YEARS_DIGITS", "DECLINING_BALANCE"]).default("STRAIGHT_LINE"),
  depreciationStartDate: z.string().or(z.date()).optional(),
  invoiceId: z.string().optional(),
  notes: z.string().optional(),
});

export const fixedAssetUpdateSchema = fixedAssetSchema.partial().extend({
  status: z.enum(["ACTIVE", "IN_REPAIR", "IN_STORAGE", "DISPOSED", "SOLD"]).optional(),
});

export const depreciationCalculateSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, "Formato de período inválido (YYYY-MM)"),
  date: z.string().or(z.date()).optional(),
});

export const assetDisposeSchema = z.object({
  reason: z.string().min(1, "La razón es requerida"),
  date: z.string().or(z.date()),
  notes: z.string().optional(),
});

export const assetSellSchema = z.object({
  salePrice: z.number().positive("El precio de venta debe ser positivo"),
  buyer: z.string().optional(),
  date: z.string().or(z.date()),
  notes: z.string().optional(),
});

export type AssetCategoryInput = z.infer<typeof assetCategorySchema>;
export type FixedAssetInput = z.infer<typeof fixedAssetSchema>;
export type FixedAssetUpdateInput = z.infer<typeof fixedAssetUpdateSchema>;
export type DepreciationCalculateInput = z.infer<typeof depreciationCalculateSchema>;
export type AssetDisposeInput = z.infer<typeof assetDisposeSchema>;
export type AssetSellInput = z.infer<typeof assetSellSchema>;
