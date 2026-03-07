import { z } from "zod";

export const registerSchema = z.object({
  companyName: z.string().min(2, "El nombre de la empresa debe tener al menos 2 caracteres"),
  name: z.string().min(2, "Tu nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]).default("FREE"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
