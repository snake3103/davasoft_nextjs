import { z } from "zod";

const envSchema = z.object({
  // Base de Datos
  DATABASE_URL: z.string().url("DATABASE_URL debe ser una URL válida"),
  
  // Autenticación
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET debe tener al menos 32 caracteres"),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const envParse = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
});

if (!envParse.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(envParse.error.format(), null, 2)
  );
  throw new Error("Invalid environment variables");
}

export const env = envParse.data;
