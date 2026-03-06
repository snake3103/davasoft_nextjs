import { z } from "zod";

export const invoiceItemSchema = z.object({
  productId: z.string().optional().nullable(),
  description: z.string().min(1, "La descripción es requerida"),
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1"),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  tax: z.coerce.number().optional().default(0),
  total: z.coerce.number().optional().default(0),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Debes seleccionar un cliente"),
  number: z.string().min(1, "El número de factura es requerido"),
  date: z.string().or(z.date()),
  dueDate: z.string().or(z.date()).optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, "Debe haber al menos un ítem"),
  subtotal: z.coerce.number().optional(),
  tax: z.coerce.number().optional(),
  total: z.coerce.number().optional(),
  status: z.enum(["DRAFT", "SENT", "PAID", "CANCELLED"]).default("DRAFT"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
