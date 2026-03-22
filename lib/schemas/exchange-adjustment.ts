import { z } from "zod";

export const exchangeAdjustmentSchema = z.object({
  date: z.string().or(z.date()),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Formato de período inválido (YYYY-MM)"),
  notes: z.string().optional(),
});

export const exchangeAdjustmentCalculateSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, "Formato de período inválido (YYYY-MM)"),
  exchangeRate: z.number().positive("La tasa de cambio debe ser positiva"),
});

export type ExchangeAdjustmentInput = z.infer<typeof exchangeAdjustmentSchema>;
export type ExchangeAdjustmentCalculateInput = z.infer<typeof exchangeAdjustmentCalculateSchema>;
