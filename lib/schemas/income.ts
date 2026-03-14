import { z } from "zod";

export const incomeSchema = z.object({
  number: z.string().min(1, "El número de ingreso es requerido"),
  date: z.string().or(z.date()),
  description: z.string().min(1, "La descripción es requerida"),
  clientId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
  paymentMethod: z.string().optional().default("CASH"),
  reference: z.string().optional(),
  status: z.enum(["PENDING", "RECEIVED", "CANCELLED"]).default("RECEIVED"),
  bankAccountId: z.string().optional().nullable(),
});

export type IncomeFormData = z.infer<typeof incomeSchema>;