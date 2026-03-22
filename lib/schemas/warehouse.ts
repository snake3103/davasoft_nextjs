import { z } from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  address: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const warehouseTransferSchema = z.object({
  productId: z.string().min(1, "El producto es requerido"),
  fromWarehouseId: z.string().min(1, "La bodega de origen es requerida"),
  toWarehouseId: z.string().min(1, "La bodega de destino es requerida"),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
  notes: z.string().optional().nullable(),
});

export const inventoryWarehouseUpdateSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  quantity: z.coerce.number().int().nonnegative(),
  type: z.enum(["SET", "ADD", "SUBTRACT"]),
});

export type WarehouseFormData = z.infer<typeof warehouseSchema>;
export type WarehouseTransferFormData = z.infer<typeof warehouseTransferSchema>;
export type InventoryWarehouseUpdateData = z.infer<typeof inventoryWarehouseUpdateSchema>;
