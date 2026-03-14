import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo").default(0),
  sku: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  cost: z.coerce.number().min(0, "El costo no puede ser negativo").default(0),
  minStock: z.coerce.number().int().min(0).default(0),
  costMethod: z.enum(["FIFO", "AVERAGE", "LIFO"]).default("AVERAGE"),
});

export const inventoryMovementSchema = z.object({
  productId: z.string().min(1, "El producto es requerido"),
  type: z.enum(["PURCHASE", "SALE", "ADJUSTMENT_IN", "ADJUSTMENT_OUT", "RETURN_IN", "RETURN_OUT", "TRANSFER_IN", "TRANSFER_OUT"]),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
  unitCost: z.coerce.number().min(0, "El costo unitario no puede ser negativo"),
  reference: z.string().optional().nullable(),
  sourceType: z.string().optional().nullable(),
  sourceId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type InventoryMovementFormData = z.infer<typeof inventoryMovementSchema>;
