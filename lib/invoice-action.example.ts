import { Decimal } from 'decimal.js';
import prisma from './prisma'; // Tu cliente de Prisma

// Configuración recomendada para ERP
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

interface CreateInvoiceInput {
  organizationId: string;
  clientId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    taxRate: number; // Ej: 0.19 para 19%
  }[];
}

/**
 * Ejemplo de creación de factura con Precisión Financiera y transacciones
 * Basado en las recomendaciones de la Auditoría Técnica.
 */
export async function createInvoice(input: CreateInvoiceInput) {
  return await prisma.$transaction(async (tx) => {
    let subtotal = new Decimal(0);
    let totalTax = new Decimal(0);

    // 1. Procesar ítems y calcular totales con decimal.js
    const processedItems = input.items.map((item) => {
      const itemPrice = new Decimal(item.price);
      const itemQty = new Decimal(item.quantity);
      const itemTaxRate = new Decimal(item.taxRate);

      const itemSubtotal = itemPrice.mul(itemQty);
      const itemTax = itemSubtotal.mul(itemTaxRate);
      const itemTotal = itemSubtotal.add(itemTax);

      subtotal = subtotal.add(itemSubtotal);
      totalTax = totalTax.add(itemTax);

      return {
        productId: item.productId,
        quantity: item.quantity, // Prisma acepta Number, pero los totales deben ser Decimal
        price: itemPrice.toNumber(), 
        total: itemTotal.toNumber(),
      };
    });

    const total = subtotal.add(totalTax);

    // 2. Crear la factura y los ítems en una sola transacción
    const invoice = await tx.invoice.create({
      data: {
        organizationId: input.organizationId, // Requerido para Multitenancy
        clientId: input.clientId,
        number: `FE-${Date.now()}`, // Lógica de consecutivo real iría aquí
        subtotal: subtotal.toFixed(2),
        tax: totalTax.toFixed(2),
        total: total.toFixed(2),
        status: "DRAFT",
        items: {
          create: processedItems
        }
      },
      include: {
        items: true
      }
    });

    // 3. Actualizar Inventario (Lógica de Kardex simplificada)
    for (const item of input.items) {
      await tx.product.update({
        where: { 
          id: item.productId,
          organizationId: input.organizationId // Seguridad: siempre filtrar por org
        },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    return invoice;
  });
}
