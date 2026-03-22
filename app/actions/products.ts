"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/lib/schemas/product";
import { logCreate, logUpdate, logDelete } from "@/lib/activity-log";

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
      taxId: formData.get("taxId") as string || null,
      cost: formData.get("cost") as string || "0",
      minStock: formData.get("minStock") as string || "0",
      costMethod: formData.get("costMethod") as string || "AVERAGE",
      productType: formData.get("productType") as string || "FINISHED",
      hasDimensions: formData.get("hasDimensions") === "true",
      length: formData.get("length") as string || null,
      width: formData.get("width") as string || null,
      height: formData.get("height") as string || null,
      dimensionUnit: formData.get("dimensionUnit") as string || "CM",
      pricingType: formData.get("pricingType") as string || "FIXED",
      pricePerUnit: formData.get("pricePerUnit") as string || null,
    };

    const bomItemsRaw = formData.get("bomItems") as string;
    let bomItems: any[] = [];
    try {
      bomItems = bomItemsRaw ? JSON.parse(bomItemsRaw) : [];
    } catch {
      bomItems = [];
    }

    const result = productSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    // Crear el producto
    const product = await prisma.product.create({
      data: {
        ...result.data,
        organizationId: session.user.organizationId!,
      },
    });

    // Crear la lista de materiales si hay items
    if (bomItems.length > 0 && bomItems.some((item: any) => item.componentId)) {
      await prisma.billOfMaterials.create({
        data: {
          organizationId: session.user.organizationId!,
          productId: product.id,
          version: "1.0",
          isActive: true,
          isDefault: true,
          boMItems: {
            create: bomItems
              .filter((item: any) => item.componentId)
              .map((item: any, index: number) => ({
                componentId: item.componentId,
                quantity: item.quantity || 1,
                isOptional: item.isOptional || false,
                scrapPercent: item.scrapPercent || 0,
                sequence: index,
                substitutes: item.substitutes?.length > 0 ? {
                  create: item.substitutes
                    .filter((sub: any) => sub.substituteId)
                    .map((sub: any) => ({
                      substituteId: sub.substituteId,
                      priority: sub.priority || 1,
                      quantityRatio: sub.quantityRatio || 1,
                      isActive: sub.isActive !== false,
                    })),
                } : undefined,
              })),
          },
        },
      });
    }

    await logCreate({
      action: "product.create",
      description: `Creó producto ${result.data.name}`,
      module: "products",
      entityType: "Product",
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
      taxId: formData.get("taxId") as string || null,
      cost: formData.get("cost") as string || "0",
      minStock: formData.get("minStock") as string || "0",
      costMethod: formData.get("costMethod") as string || "AVERAGE",
      productType: formData.get("productType") as string || "FINISHED",
      hasDimensions: formData.get("hasDimensions") === "true",
      length: formData.get("length") as string || null,
      width: formData.get("width") as string || null,
      height: formData.get("height") as string || null,
      dimensionUnit: formData.get("dimensionUnit") as string || "CM",
      pricingType: formData.get("pricingType") as string || "FIXED",
      pricePerUnit: formData.get("pricePerUnit") as string || null,
    };

    const bomItemsRaw = formData.get("bomItems") as string;
    let bomItems: any[] = [];
    try {
      bomItems = bomItemsRaw ? JSON.parse(bomItemsRaw) : [];
    } catch {
      bomItems = [];
    }

    const result = productSchema.partial().safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    // Actualizar el producto
    await prisma.product.update({
      where: { 
        id,
        organizationId: session.user.organizationId!
      },
      data: {
        ...result.data,
        taxId: rawData.taxId || null,
      },
    });

    // Manejar la lista de materiales
    const existingBom = await prisma.billOfMaterials.findFirst({
      where: { productId: id, isDefault: true },
      include: { boMItems: { include: { substitutes: true } } },
    });

    const validBomItems = bomItems.filter((item: any) => item.componentId);

    if (validBomItems.length > 0) {
      if (existingBom) {
        // Actualizar BOM existente
        const existingItemIds = existingBom.boMItems.map(i => i.id);
        const newItemIds = validBomItems.filter((i: any) => i.id).map((i: any) => i.id);
        const itemsToDelete = existingItemIds.filter(eId => !newItemIds.includes(eId));

        // Eliminar items que ya no están
        if (itemsToDelete.length > 0) {
          await prisma.materialSubstitute.deleteMany({ where: { bomItemId: { in: itemsToDelete } } });
          await prisma.boMItem.deleteMany({ where: { id: { in: itemsToDelete } } });
        }

        // Procesar cada item
        for (let i = 0; i < validBomItems.length; i++) {
          const item: any = validBomItems[i];
          
          if (item.id) {
            // Actualizar item existente
            await prisma.boMItem.update({
              where: { id: item.id },
              data: {
                quantity: item.quantity || 1,
                isOptional: item.isOptional || false,
                scrapPercent: item.scrapPercent || 0,
                sequence: i,
              },
            });

            // Manejar sustitutos
            const existingSubIds = existingBom.boMItems.find(bi => bi.id === item.id)?.substitutes.map(s => s.id) || [];
            const newSubIds = (item.substitutes || []).filter((s: any) => s.id).map((s: any) => s.id);
            const subsToDelete = existingSubIds.filter((sId: string) => !newSubIds.includes(sId));
            
            if (subsToDelete.length > 0) {
              await prisma.materialSubstitute.deleteMany({ where: { id: { in: subsToDelete } } });
            }

            // Actualizar/crear sustitutos
            for (let j = 0; j < (item.substitutes || []).length; j++) {
              const sub: any = item.substitutes[j];
              if (!sub.substituteId) continue;

              if (sub.id) {
                await prisma.materialSubstitute.update({
                  where: { id: sub.id },
                  data: {
                    substituteId: sub.substituteId,
                    priority: sub.priority || (j + 1),
                    quantityRatio: sub.quantityRatio || 1,
                    isActive: sub.isActive !== false,
                  },
                });
              } else {
                await prisma.materialSubstitute.create({
                  data: {
                    bomItemId: item.id,
                    substituteId: sub.substituteId,
                    priority: sub.priority || (j + 1),
                    quantityRatio: sub.quantityRatio || 1,
                    isActive: sub.isActive !== false,
                  },
                });
              }
            }
          } else {
            // Crear nuevo item
            const newBomItem = await prisma.boMItem.create({
              data: {
                bomId: existingBom.id,
                componentId: item.componentId,
                quantity: item.quantity || 1,
                isOptional: item.isOptional || false,
                scrapPercent: item.scrapPercent || 0,
                sequence: i,
              },
            });

            // Crear sustitutos
            for (let j = 0; j < (item.substitutes || []).length; j++) {
              const sub: any = item.substitutes[j];
              if (!sub.substituteId) continue;

              await prisma.materialSubstitute.create({
                data: {
                  bomItemId: newBomItem.id,
                  substituteId: sub.substituteId,
                  priority: sub.priority || (j + 1),
                  quantityRatio: sub.quantityRatio || 1,
                  isActive: sub.isActive !== false,
                },
              });
            }
          }
        }
      } else {
        // Crear nuevo BOM
        await prisma.billOfMaterials.create({
          data: {
            organizationId: session.user.organizationId!,
            productId: id,
            version: "1.0",
            isActive: true,
            isDefault: true,
            boMItems: {
              create: validBomItems.map((item: any, index: number) => ({
                componentId: item.componentId,
                quantity: item.quantity || 1,
                isOptional: item.isOptional || false,
                scrapPercent: item.scrapPercent || 0,
                sequence: index,
                substitutes: item.substitutes?.length > 0 ? {
                  create: item.substitutes
                    .filter((sub: any) => sub.substituteId)
                    .map((sub: any) => ({
                      substituteId: sub.substituteId,
                      priority: sub.priority || 1,
                      quantityRatio: sub.quantityRatio || 1,
                      isActive: sub.isActive !== false,
                    })),
                } : undefined,
              })),
            },
          },
        });
      }
    } else if (existingBom) {
      // Eliminar BOM si no hay items
      await prisma.materialSubstitute.deleteMany({
        where: { bomItemId: { in: existingBom.boMItems.map(i => i.id) } },
      });
      await prisma.boMItem.deleteMany({ where: { bomId: existingBom.id } });
      await prisma.billOfMaterials.delete({ where: { id: existingBom.id } });
    }

    await logUpdate({
      action: "product.update",
      description: `Actualizó producto ${rawData.name}`,
      module: "products",
      entityType: "Product",
      entityId: id,
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

    await logDelete({
      action: "product.delete",
      description: `Eliminó producto`,
      module: "products",
      entityType: "Product",
      entityId: id,
    });

    revalidatePath("/inventario");
    return { success: true };
  } catch (error: any) {
    throw new Error("Error al eliminar producto");
  }
}
