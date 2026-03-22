import { z } from "zod";

export const retentionSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum([
    "ISR_RETENTION",
    "IVA_RETENTION", 
    "ISC_RETENTION",
    "FLETE_RETENTION",
    "ICA_RETENTION",
    "RENTA_RETENTION",
    "NOTARY_RETENTION",
  ]),
  percentage: z.number().positive("El porcentaje debe ser positivo").max(100),
  description: z.string().optional(),
  accountPayableId: z.string().optional(),
  accountReceivableId: z.string().optional(),
  appliesTo: z.enum(["SALES", "PURCHASES", "BOTH"]).default("BOTH"),
  isActive: z.boolean().default(true),
});

export const retentionUpdateSchema = retentionSchema.partial();

export type RetentionInput = z.infer<typeof retentionSchema>;
export type RetentionUpdateInput = z.infer<typeof retentionUpdateSchema>;
