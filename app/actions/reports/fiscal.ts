"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// ============================================
// TIPOS PARA REPORTES FISCALES DGII (REP. DOMINICANA)
// ============================================

export interface FiscalInvoice607 {
  fecha: string;
  ncf: string;
  ncfModificado?: string;
  tipoAnulacion?: string;
  rncCedulaCliente: string;
  nombreCliente: string;
  tipoOperacion: string;
  montoGravadoTotal: number;
  montoGravado18: number;
  montoExento: number;
  ITBIS18: number;
  ITBIS18Percibido: number;
  ITBIS18Retenido: number;
  retenerISR: number;
  retenerITBIS: number;
  montoTotal: number;
}

export interface Report607 {
  periodo: string;
  rncCedula: string;
  tipoIdContribuyente: string;
  facturas: FiscalInvoice607[];
  totales: {
    cantidadRegistros: number;
    montoGravadoTotal: number;
    montoExento: number;
    montoITBIS18: number;
    montoITBIS18Percibido: number;
    montoITBIS18Retenido: number;
    montoRetenerISR: number;
    montoRetenerITBIS: number;
    montoTotal: number;
  };
}

export interface FiscalInvoice606 {
  fecha: string;
  ncf: string;
  ncfModificado?: string;
  tipoAnulacion?: string;
  rncCedulaProveedor: string;
  nombreProveedor: string;
  tipoBienesServicios: string;
  montoGravadoTotal: number;
  montoGravado18: number;
  montoExento: number;
  ITBIS18: number;
  ITBIS18Percibido: number;
  ITBIS18Retenido: number;
  otrosImpuestos: number;
  retenerISR: number;
  retenerITBIS: number;
  montoTotal: number;
}

export interface Report606 {
  periodo: string;
  rncCedula: string;
  facturas: FiscalInvoice606[];
  totales: {
    cantidadRegistros: number;
    montoGravadoTotal: number;
    montoExento: number;
    montoITBIS18: number;
    montoITBIS18Percibido: number;
    montoITBIS18Retenido: number;
    montoOtrosImpuestos: number;
    montoRetenerISR: number;
    montoRetenerITBIS: number;
    montoTotal: number;
  };
}

// ============================================
// REPORTE 607 - VENTAS (LIBRO DE VENTAS)
// ============================================

export async function generateReport607(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<Report607> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("No autorizado");
  }

  // Obtener organización para RNC
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true }
  });

  // Obtener facturas del período
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
      client: {
        include: {
          fiscalData: true
        }
      },
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { date: "asc" }
  });

  // Transformar facturas al formato 607
  const facturas: FiscalInvoice607[] = invoices.map((invoice) => {
    const fecha = new Date(invoice.date).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).replace(/\//g, "-");

    // Calcular montos
    const subtotal = Number(invoice.subtotal);
    const tax = Number(invoice.tax);
    const total = Number(invoice.total);

    // Determinar tipo de operación (1=crédito, 2=contado, 3=mixta)
    // Basado en si hay fecha de vencimiento
    const tipoOperacion = invoice.dueDate ? "1" : "2";

    // Obtener datos fiscales del cliente
    const clientFiscalData = invoice.client.fiscalData;
    const rncCliente = clientFiscalData?.taxId || invoice.client.idNumber || "";
    const tipoIdContribuyente = clientFiscalData?.contributorType || "1";

    return {
      fecha,
      ncf: invoice.number, // Número de factura como NCF
      rncCedulaCliente: rncCliente,
      nombreCliente: invoice.client.name,
      tipoOperacion,
      montoGravadoTotal: subtotal,
      montoGravado18: tax > 0 ? subtotal : 0,
      montoExento: tax === 0 ? subtotal : 0,
      ITBIS18: tax,
      ITBIS18Percibido: 0, // Solo aplica si el cliente es agente de percepción
      ITBIS18Retenido: clientFiscalData?.agentRetention ? (tax * 0.30) : 0, // 30% del ITBIS si es agente de retención
      retenerISR: 0, // Retención ISR aplica solo a ciertos tipos de income
      retenerITBIS: 0,
      montoTotal: total
    };
  });

  // Calcular totales
  const totales = facturas.reduce(
    (acc, fac) => ({
      cantidadRegistros: acc.cantidadRegistros + 1,
      montoGravadoTotal: acc.montoGravadoTotal + fac.montoGravadoTotal,
      montoExento: acc.montoExento + fac.montoExento,
      montoITBIS18: acc.montoITBIS18 + fac.ITBIS18,
      montoITBIS18Percibido: acc.montoITBIS18Percibido + fac.ITBIS18Percibido,
      montoITBIS18Retenido: acc.montoITBIS18Retenido + fac.ITBIS18Retenido,
      montoRetenerISR: acc.montoRetenerISR + fac.retenerISR,
      montoRetenerITBIS: acc.montoRetenerITBIS + fac.retenerITBIS,
      montoTotal: acc.montoTotal + fac.montoTotal
    }),
    {
      cantidadRegistros: 0,
      montoGravadoTotal: 0,
      montoExento: 0,
      montoITBIS18: 0,
      montoITBIS18Percibido: 0,
      montoITBIS18Retenido: 0,
      montoRetenerISR: 0,
      montoRetenerITBIS: 0,
      montoTotal: 0
    }
  );

  // Formato período: AAAAMM
  const periodStart = startDate;
  const periodo = `${periodStart.getFullYear()}${String(periodStart.getMonth() + 1).padStart(2, "0")}`;

  return {
    periodo,
    rncCedula: "", // Esta información debería venir de la configuración de la organización
    tipoIdContribuyente: "2", // Persona jurídica por defecto
    facturas,
    totales
  };
}

// ============================================
// REPORTE 606 - COMPRAS (LIBRO DE COMPRAS)
// ============================================

export async function generateReport606(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<Report606> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("No autorizado");
  }

  // Obtener gastos/compras del período
  const expenses = await prisma.expense.findMany({
    where: {
      organizationId,
      type: "PURCHASE",
      status: { in: ["PAID", "PENDING"] },
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { date: "asc" }
  });

  // Transformar compras al formato 606
  // Para proveedores, usamos el campo "provider" que es un string
  const facturas: FiscalInvoice606[] = expenses.map((expense) => {
    const fecha = new Date(expense.date).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).replace(/\//g, "-");

    const total = Number(expense.total);
    const subtotal = total / 1.18; // Asumiendo ITBIS incluido
    const itbis = total - subtotal;

    return {
      fecha,
      ncf: expense.number,
      rncCedulaProveedor: "", // El RNC del proveedor no está disponible en el modelo Expense
      nombreProveedor: expense.provider,
      tipoBienesServicios: "1", // Bienes por defecto
      montoGravadoTotal: subtotal,
      montoGravado18: itbis > 0 ? subtotal : 0,
      montoExento: itbis === 0 ? subtotal : 0,
      ITBIS18: itbis,
      ITBIS18Percibido: 0,
      ITBIS18Retenido: 0, // Esto aplicaría si somos agentes de retención
      otrosImpuestos: 0,
      retenerISR: 0,
      retenerITBIS: 0,
      montoTotal: total
    };
  });

  // Calcular totales
  const totales = facturas.reduce(
    (acc, fac) => ({
      cantidadRegistros: acc.cantidadRegistros + 1,
      montoGravadoTotal: acc.montoGravadoTotal + fac.montoGravadoTotal,
      montoExento: acc.montoExento + fac.montoExento,
      montoITBIS18: acc.montoITBIS18 + fac.ITBIS18,
      montoITBIS18Percibido: acc.montoITBIS18Percibido + fac.ITBIS18Percibido,
      montoITBIS18Retenido: acc.montoITBIS18Retenido + fac.ITBIS18Retenido,
      montoOtrosImpuestos: acc.montoOtrosImpuestos + fac.otrosImpuestos,
      montoRetenerISR: acc.montoRetenerISR + fac.retenerISR,
      montoRetenerITBIS: acc.montoRetenerITBIS + fac.retenerITBIS,
      montoTotal: acc.montoTotal + fac.montoTotal
    }),
    {
      cantidadRegistros: 0,
      montoGravadoTotal: 0,
      montoExento: 0,
      montoITBIS18: 0,
      montoITBIS18Percibido: 0,
      montoITBIS18Retenido: 0,
      montoOtrosImpuestos: 0,
      montoRetenerISR: 0,
      montoRetenerITBIS: 0,
      montoTotal: 0
    }
  );

  // Formato período: AAAAMM
  const periodStart = startDate;
  const periodo = `${periodStart.getFullYear()}${String(periodStart.getMonth() + 1).padStart(2, "0")}`;

  return {
    periodo,
    rncCedula: "",
    facturas,
    totales
  };
}
