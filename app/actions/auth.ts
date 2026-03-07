"use server";

import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/schemas/register";
import bcrypt from "bcryptjs";

export async function registerCompany(prevState: any, formData: FormData) {
  try {
    const rawData = {
      companyName: formData.get("companyName") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      plan: formData.get("plan") as string || "FREE",
    };

    const result = registerSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const { companyName, name, email, password, plan } = result.data;

    // 1. Check si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Este correo electrónico ya está registrado." };
    }

    // 2. Generar slug único para la organización (ej: "mi-empresa-sas-4912")
    const baseSlug = companyName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${randomSuffix}`;

    // 3. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear de forma transaccional: Organización -> Usuario -> Membresía
    await prisma.$transaction(async (tx) => {
      // Crear Empresa
      const organization = await tx.organization.create({
        data: {
          name: companyName,
          slug,
          plan: plan as any,
        },
      });

      // Crear Usuario
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "ADMIN",
        },
      });

      // Atar el Usuario a la Empresa como Dueño (ADMIN)
      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "ADMIN",
        },
      });
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error en registro:", error);
    return { error: "Ocurrió un error inesperado al registrar la cuenta." };
  }
}
