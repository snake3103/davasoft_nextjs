"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/lib/schemas/product";

export async function createProduct(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      stock: formData.get("stock") as string,
      sku: formData.get("sku") as string,
      categoryId: formData.get("categoryId") as string || null,
      cost: formData.get("cost") as string || "0",
      minStock: formData.get("minStock") as string || "0",
      costMethod: formData.get("costMethod") as string || "AVERAGE",
    };

    const result = productSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    await prisma.product.create({
      data: {
        ...result.data,
        organizationId: session.user.organizationId!,
      },
    });

    revalidatePath("/inventario");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { error: "Error interno al crear producto" };
  }
}

export async function updateProduct(id: string, prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "No autorizado" };
    }

    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      stock: formData.get("stock") as string,
      sku: formData.get("sku") as string,
      categoryId: formData.get("categoryId") as string || null,
      cost: formData.get("cost") as string || "0",
      minStock: formData.get("minStock") as string || "0",
      costMethod: formData.get("costMethod") as string || "AVERAGE",
    };

    const result = productSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    await prisma.product.update({
      where: { 
        id,
        organizationId: session.user.organizationId!
      },
      data: result.data,
    });

    revalidatePath("/inventario");
    revalidatePath(`/inventario/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { error: "Error interno al actualizar producto" };
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      throw new Error("No autorizado");
    }

    await prisma.product.delete({
      where: { 
        id,
        organizationId: session.user.organizationId!
      },
    });

    revalidatePath("/inventario");
    return { success: true };
  } catch (error: any) {
    throw new Error("Error al eliminar producto");
  }
}
