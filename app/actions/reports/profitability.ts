"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// ============================================
// TIPOS PARA REPORTES DE RENTABILIDAD
// ============================================

export interface ProfitabilityProduct {
  productId: string;
  codigo: string;
  nombre: string;
  categoria: string;
  cantidadVendida: number;
  cantidadDevuelta: number;
  cantidadNeta: number;
  ventasBrutas: number;
  descuentos: number;
  ventasNetas: number;
  costoTotal: number;
  utilidadBruta: number;
  margenBruto: number;
}

export interface ProfitabilityByProduct {
  periodo: string;
  productos: ProfitabilityProduct[];
  totales: {
    totalVentasNetas: number;
    totalCostos: number;
    totalUtilidad: number;
    margenPromedio: number;
  };
}

export interface ProfitabilityClientInvoice {
  fecha: string;
  ncf: string;
  total: number;
  costo: number;
  utilidad: number;
  margen: number;
}

export interface ProfitabilityByClient {
  clienteId: string;
  codigo: string;
  nombre: string;
  facturas: ProfitabilityClientInvoice[];
  totales: {
    totalVentas: number;
    totalCostos: number;
    totalUtilidad: number;
    margenPromedio: number;
    ranking: number;
  };
}

// ============================================
// RENTABILIDAD POR PRODUCTO
// ============================================

export async function generateProfitabilityByProduct(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  categoryId?: string
): Promise<ProfitabilityByProduct> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("No autorizado");
  }

  // Obtener invoices del período
  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId,
      status: { in: ["PAID", "SENT"] },
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      }
    }
  });

  // Agrupar por producto
  const productMap = new Map<string, {
    product: any;
    cantidad: number;
    ventasBrutas: number;
    costoTotal: number;
  }>();

  for (const invoice of invoices) {
    for (const item of invoice.items) {
      if (!item.productId || !item.product) continue;

      const existing = productMap.get(item.productId) || {
        product: item.product,
        cantidad: 0,
        ventasBrutas: 0,
        costoTotal: 0
      };

      existing.cantidad += item.quantity;
      existing.ventasBrutas += Number(item.total);
      existing.costoTotal += Number(item.product.cost) * item.quantity;

      productMap.set(item.productId, existing);
    }
  }

  // Transformar a formato de rentabilidad
  let productos: ProfitabilityProduct[] = Array.from(productMap.values())
    .filter(item => !categoryId || item.product.categoryId === categoryId)
    .map(item => {
      const ventasNetas = item.ventasBrutas; // Aquí se podrían restar descuentos
      const utilidadBruta = ventasNetas - item.costoTotal;
      const margenBruto = ventasNetas > 0 ? (utilidadBruta / ventasNetas) * 100 : 0;

      return {
        productId: item.product.id,
        codigo: item.product.sku || "",
        nombre: item.product.name,
        categoria: item.product.category?.name || "Sin categoría",
        cantidadVendida: item.cantidad,
        cantidadDevuelta: 0, // Necesitaría implementar devoluciones
        cantidadNeta: item.cantidad,
        ventasBrutas: item.ventasBrutas,
        descuentos: 0,
        ventasNetas,
        costoTotal: item.costoTotal,
        utilidadBruta,
        margenBruto: Math.round(margenBruto * 100) / 100
      };
    })
    .sort((a, b) => b.utilidadBruta - a.utilidadBruta);

  // Calcular totales
  const totales = productos.reduce(
    (acc, prod) => ({
      totalVentasNetas: acc.totalVentasNetas + prod.ventasNetas,
      totalCostos: acc.totalCostos + prod.costoTotal,
      totalUtilidad: acc.totalUtilidad + prod.utilidadBruta,
      margenPromedio: 0 // Se calcula después
    }),
    { totalVentasNetas: 0, totalCostos: 0, totalUtilidad: 0, margenPromedio: 0 }
  );

  totales.margenPromedio = totales.totalVentasNetas > 0
    ? Math.round((totales.totalUtilidad / totales.totalVentasNetas) * 10000) / 100
    : 0;

  // Formato período
  const periodo = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`;

  return {
    periodo,
    productos,
    totales
  };
}

// ============================================
// RENTABILIDAD POR CLIENTE
// ============================================

export async function generateProfitabilityByClient(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<ProfitabilityByClient[]> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("No autorizado");
  }

  // Obtener invoices del período
  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId,
      status: { in: ["PAID", "SENT"] },
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      client: true,
      items: {
        include: {
          product: true
        }
      }
    }
  });

  // Agrupar por cliente
  const clientMap = new Map<string, {
    client: any;
    facturas: {
      fecha: string;
      ncf: string;
      total: number;
      costo: number;
      utilidad: number;
      margen: number;
    }[];
  }>();

  for (const invoice of invoices) {
    const existing = clientMap.get(invoice.clientId) || {
      client: invoice.client,
      facturas: []
    };

    // Calcular costo de la factura
    const costo = invoice.items.reduce((sum, item) => {
      return sum + (Number(item.product?.cost || 0) * item.quantity);
    }, 0);

    const total = Number(invoice.total);
    const utilidad = total - costo;
    const margen = total > 0 ? (utilidad / total) * 100 : 0;

    existing.facturas.push({
      fecha: new Date(invoice.date).toLocaleDateString("es-DO"),
      ncf: invoice.number,
      total,
      costo,
      utilidad,
      margen: Math.round(margen * 100) / 100
    });

    clientMap.set(invoice.clientId, existing);
  }

  // Transformar a formato de rentabilidad
  let clients: ProfitabilityByClient[] = Array.from(clientMap.entries()).map(([clientId, data]) => {
    const totalVentas = data.facturas.reduce((sum, f) => sum + f.total, 0);
    const totalCostos = data.facturas.reduce((sum, f) => sum + f.costo, 0);
    const totalUtilidad = data.facturas.reduce((sum, f) => sum + f.utilidad, 0);
    const margenPromedio = totalVentas > 0 ? (totalUtilidad / totalVentas) * 100 : 0;

    return {
      clienteId: clientId,
      codigo: data.client.idNumber || "",
      nombre: data.client.name,
      facturas: data.facturas,
      totales: {
        totalVentas,
        totalCostos,
        totalUtilidad,
        margenPromedio: Math.round(margenPromedio * 100) / 100,
        ranking: 0 // Se asignará después de ordenar
      }
    };
  });

  // Ordenar por utilidad descendente y asignar ranking
  clients.sort((a, b) => b.totales.totalUtilidad - a.totales.totalUtilidad);
  clients = clients.map((client, index) => ({
    ...client,
    totales: {
      ...client.totales,
      ranking: index + 1
    }
  }));

  return clients;
}

// Obtener top clientes por rentabilidad
export async function getTopProfitabilityClients(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<ProfitabilityByClient[]> {
  const clients = await generateProfitabilityByClient(organizationId, startDate, endDate);
  return clients.slice(0, limit);
}
