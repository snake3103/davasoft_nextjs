import { z } from "zod";

export const estimateItemSchema = z.object({
  productId: z.string().optional().nullable(),
  description: z.string().min(1, "La descripción es requerida"),
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1"),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  total: z.coerce.number().optional().default(0),
});

export const estimateSchema = z.object({
  clientId: z.string().min(1, "Debes seleccionar un cliente"),
  number: z.string().min(1, "El número de cotización es requerido"),
  date: z.string().or(z.date()),
  dueDate: z.string().or(z.date()).optional().nullable(),
  items: z.array(estimateItemSchema).min(1, "Debe haber al menos un ítem"),
  subtotal: z.coerce.number().optional(),
  tax: z.coerce.number().optional(),
  total: z.coerce.number().optional(),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]).default("DRAFT"),
  notes: z.string().optional().nullable(),
});

export type EstimateFormData = z.infer<typeof estimateSchema>;
export type EstimateItemFormData = z.infer<typeof estimateItemSchema>;
