import { z } from "zod";

export const expenseItemSchema = z.object({
  productId: z.string().optional().nullable(),
  description: z.string().min(1, "La descripción es requerida"),
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1"),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  total: z.coerce.number(),
});

export const expenseSchema = z.object({
  number: z.string().min(1, "El número de gasto es requerido"),
  date: z.string().or(z.date()),
  provider: z.string().min(1, "El proveedor es requerido"),
  categoryId: z.string().min(1, "La categoría es requerida"),
  total: z.coerce.number(),
  status: z.enum(["PENDING", "PAID", "CANCELLED"]).default("PENDING"),
  items: z.array(expenseItemSchema).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
