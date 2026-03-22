import { z } from "zod";

export const clientFiscalDataSchema = z.object({
  clientId: z.string().min(1, "Cliente requerido"),
  taxId: z.string().optional().nullable(),
  fiscalRegime: z.string().optional().nullable(),
  contributorType: z.string().optional().nullable(),
  addressFiscal: z.string().optional().nullable(),
  phoneFiscal: z.string().optional().nullable(),
  emailBilling: z.string().email("Email de facturación inválido").optional().or(z.literal("")),
  dgiiStatus: z.string().optional().nullable(),
  agentRetention: z.boolean().default(false),
  agentPerception: z.boolean().default(false),
});

export const updateClientFiscalDataSchema = clientFiscalDataSchema.partial();

export type ClientFiscalDataFormData = z.infer<typeof clientFiscalDataSchema>;
export type UpdateClientFiscalDataFormData = z.infer<typeof updateClientFiscalDataSchema>;
