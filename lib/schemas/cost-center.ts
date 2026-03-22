import { z } from "zod";

export const costCenterSchema = z.object({
  code: z.string().min(1, "El código es requerido").max(50),
  name: z.string().min(1, "El nombre es requerido").max(200),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateCostCenterSchema = costCenterSchema.partial();

export type CostCenterFormData = z.infer<typeof costCenterSchema>;
export type UpdateCostCenterFormData = z.infer<typeof updateCostCenterSchema>;
