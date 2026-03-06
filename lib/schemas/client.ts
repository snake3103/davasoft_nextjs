import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  email: z.string().email("Correo inválido").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  idNumber: z.string().min(1, "El NIT o Cédula es requerido"),
  type: z.enum(["CLIENT", "PROVIDER", "BOTH"]).default("CLIENT"),
});

export type ClientFormData = z.infer<typeof clientSchema>;
