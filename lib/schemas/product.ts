import { z } from "zod";

// Schema para sustituto de material
export const materialSubstituteSchema = z.object({
  id: z.string().optional(), // Si tiene ID, es existente
  substituteId: z.string().min(1, "El sustituto es requerido"),
  priority: z.coerce.number().int().min(1).default(1),
  quantityRatio: z.coerce.number().min(0).default(1),
  isActive: z.boolean().default(true),
});

// Schema para item de la lista de materiales (BoM)
export const bomItemSchema = z.object({
  id: z.string().optional(), // Si tiene ID, es existente
  componentId: z.string().min(1, "El material es requerido"),
  quantity: z.coerce.number().min(0.0001, "La cantidad debe ser mayor a 0"),
  isOptional: z.boolean().default(false),
  scrapPercent: z.coerce.number().min(0).max(100).default(0),
  substitutes: z.array(materialSubstituteSchema).default([]),
});

// Schema para lista de materiales (Bill of Materials)
export const billOfMaterialsSchema = z.object({
  id: z.string().optional(),
  version: z.string().default("1.0"),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(true),
  items: z.array(bomItemSchema).default([]),
});

export const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo").default(0),
  sku: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  cost: z.coerce.number().min(0, "El costo no puede ser negativo").default(0),
  minStock: z.coerce.number().int().min(0).default(0),
  costMethod: z.enum(["FIFO", "AVERAGE", "LIFO"]).default("AVERAGE"),
  
  // Tipo de producto para manufactura
  productType: z.enum(["FINISHED", "SEMI_FINISHED", "RAW", "CONFIGURABLE"]).default("FINISHED"),
  
  // Dimensiones del producto
  hasDimensions: z.boolean().default(false),
  length: z.coerce.number().min(0).optional().nullable(),
  width: z.coerce.number().min(0).optional().nullable(),
  height: z.coerce.number().min(0).optional().nullable(),
  dimensionUnit: z.enum(["CM", "M", "IN", "FT", "MM"]).default("CM"),
  
  // Tipo de precio por dimensión
  pricingType: z.enum(["FIXED", "PER_LINEAR", "PER_AREA", "PER_VOLUME", "PER_UNIT"]).default("FIXED"),
  pricePerUnit: z.coerce.number().min(0).optional().nullable(),
  
  // Lista de materiales (BOM)
  billOfMaterials: billOfMaterialsSchema.optional(),
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
export type BillOfMaterialsData = z.infer<typeof billOfMaterialsSchema>;
export type BoMItemData = z.infer<typeof bomItemSchema>;
export type MaterialSubstituteData = z.infer<typeof materialSubstituteSchema>;
