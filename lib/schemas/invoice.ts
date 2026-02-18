import { z } from "zod";

export const invoiceItemSchema = z.object({
  productId: z.string().min(1, "Debes seleccionar un producto"),
  description: z.string().min(1, "La descripción es requerida"),
  quantity: z.number().min(1, "La cantidad debe ser al menos 1"),
  price: z.number().min(0, "El precio no puede ser negativo"),
  tax: z.number(),
  total: z.number(),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Debes seleccionar un cliente"),
  number: z.string().min(1, "El número de factura es requerido"),
  date: z.string().or(z.date()),
  dueDate: z.string().or(z.date()).optional(),
  items: z.array(invoiceItemSchema).min(1, "Debe haber al menos un ítem"),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  status: z.enum(["DRAFT", "SENT", "PAID", "CANCELLED"]),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
