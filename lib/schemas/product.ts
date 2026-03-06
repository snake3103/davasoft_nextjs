import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo").default(0),
  sku: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

export type ProductFormData = z.infer<typeof productSchema>;
