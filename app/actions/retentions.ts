"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Decimal } from "decimal.js";

// Tipos
export type RetentionType =
  | "ISR_RETENTION"
  | "IVA_RETENTION"
  | "ISC_RETENTION"
  | "FLETE_RETENTION"
  | "ICA_RETENTION"
  | "RENTA_RETENTION"
  | "NOTARY_RETENTION";

export type ApplyTo = "SALES" | "PURCHASES" | "BOTH";

// Modelo de retención
export interface RetentionWithAccounts {
  id: string;
  name: string;
  type: RetentionType;
  percentage: Decimal;
  description: string | null;
  appliesTo: ApplyTo;
  isActive: boolean;
  accountPayableId: string | null;
  accountReceivableId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Modelo de certificado
export interface RetentionCertificate {
  id: string;
  organizationId: string;
  retentionId: string;
  retention: {
    name: string;
    type: RetentionType;
    percentage: Decimal;
  };
  certificateNumber: string;
  date: Date;
  agentName: string;
  agentTaxId: string;
  agentAddress: string;
  beneficiaryName: string;
  beneficiaryTaxId: string;
  beneficiaryAddress: string;
  totalAmount: number;
  retainedAmount: number;
  concept: string;
  period: string;
  journalEntryId: string | null;
  createdAt: Date;
}

// Obtener todas las retenciones
export async function getRetentions(organizationId: string) {
  return prisma.retention.findMany({
    where: { organizationId, isActive: true },
    orderBy: { name: "asc" },
  });
}

// Obtener una retención por ID
export async function getRetention(retentionId: string) {
  return prisma.retention.findUnique({
    where: { id: retentionId },
  });
}

// Crear retención
export async function createRetention(
  organizationId: string,
  data: {
    name: string;
    type: RetentionType;
    percentage: number;
    description?: string;
    appliesTo: ApplyTo;
    accountPayableId?: string;
    accountReceivableId?: string;
  }
) {
  const retention = await prisma.retention.create({
    data: {
      organizationId,
      name: data.name,
      type: data.type,
      percentage: data.percentage,
      description: data.description,
      appliesTo: data.appliesTo,
      accountPayableId: data.accountPayableId,
      accountReceivableId: data.accountReceivableId,
    },
  });

  revalidatePath("/configuracion/impuestos/retenciones");
  return retention;
}

// Actualizar retención
export async function updateRetention(
  retentionId: string,
  data: Partial<{
    name: string;
    type: RetentionType;
    percentage: number;
    description: string;
    appliesTo: ApplyTo;
    accountPayableId: string;
    accountReceivableId: string;
    isActive: boolean;
  }>
) {
  const retention = await prisma.retention.update({
    where: { id: retentionId },
    data,
  });

  revalidatePath("/configuracion/impuestos/retenciones");
  return retention;
}

// Eliminar retención
export async function deleteRetention(retentionId: string) {
  await prisma.retention.update({
    where: { id: retentionId },
    data: { isActive: false },
  });

  revalidatePath("/configuracion/impuestos/retenciones");
}

// Obtener certificados de retención
export async function getRetentionCertificates(
  organizationId: string,
  filters?: {
    search?: string;
    type?: RetentionType;
    year?: number;
  }
) {
  const where: any = {};

  if (filters?.type) {
    where.retention = { type: filters.type };
  }

  if (filters?.year) {
    where.date = {
      gte: new Date(filters.year, 0, 1),
      lte: new Date(filters.year, 11, 31),
    };
  }

  const certificates = await prisma.retentionCertificate.findMany({
    where,
    include: {
      retention: {
        select: {
          name: true,
          type: true,
          percentage: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return certificates;
}

// Crear certificado de retención
export async function createRetentionCertificate(
  organizationId: string,
  data: {
    retentionId: string;
    certificateNumber: string;
    date: Date;
    agentName: string;
    agentTaxId: string;
    agentAddress: string;
    beneficiaryName: string;
    beneficiaryTaxId: string;
    beneficiaryAddress: string;
    totalAmount: number;
    concept: string;
    period: string;
  }
) {
  // Obtener el porcentaje de retención
  const retention = await prisma.retention.findUnique({
    where: { id: data.retentionId },
  });

  if (!retention) {
    throw new Error("Retención no encontrada");
  }

  const retainedAmount = data.totalAmount * (Number(retention.percentage) / 100);

  const certificate = await prisma.retentionCertificate.create({
    data: {
      organizationId,
      retentionId: data.retentionId,
      certificateNumber: data.certificateNumber,
      date: data.date,
      agentName: data.agentName,
      agentTaxId: data.agentTaxId,
      agentAddress: data.agentAddress,
      beneficiaryName: data.beneficiaryName,
      beneficiaryTaxId: data.beneficiaryTaxId,
      beneficiaryAddress: data.beneficiaryAddress,
      totalAmount: data.totalAmount,
      retainedAmount,
      concept: data.concept,
      period: data.period,
    },
    include: {
      retention: true,
    },
  });

  revalidatePath("/configuracion/impuestos/retenciones");
  return certificate;
}

// Obtener certificado por ID
export async function getRetentionCertificate(certificateId: string) {
  return prisma.retentionCertificate.findUnique({
    where: { id: certificateId },
    include: {
      retention: true,
    },
  });
}

// Generar número de certificado secuencial
export async function generateCertificateNumber(organizationId: string) {
  const year = new Date().getFullYear();
  const prefix = `RET-${year}-`;

  // Buscar el último certificado del año
  const lastCertificate = await prisma.retentionCertificate.findFirst({
    where: {
      organizationId,
      certificateNumber: {
        startsWith: prefix,
      },
    },
    orderBy: { certificateNumber: "desc" },
  });

  let nextNumber = 1;
  if (lastCertificate) {
    const lastNumber = parseInt(lastCertificate.certificateNumber.replace(prefix, ""));
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
}

// Obtener estadísticas de certificados
export async function getCertificateStats(organizationId: string) {
  const year = new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const certificates = await prisma.retentionCertificate.findMany({
    where: {
      organizationId,
      date: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    select: {
      retainedAmount: true,
      totalAmount: true,
      retention: {
        select: { type: true },
      },
    },
  });

  const totalCertificates = certificates.length;
  const totalRetained = certificates.reduce(
    (sum, cert) => sum + Number(cert.retainedAmount),
    0
  );
  const totalAmount = certificates.reduce(
    (sum, cert) => sum + Number(cert.totalAmount),
    0
  );

  // Agrupar por tipo
  const byType = certificates.reduce(
    (acc, cert) => {
      const type = cert.retention.type;
      if (!acc[type]) {
        acc[type] = { count: 0, retained: 0 };
      }
      acc[type].count++;
      acc[type].retained += Number(cert.retainedAmount);
      return acc;
    },
    {} as Record<string, { count: number; retained: number }>
  );

  return {
    totalCertificates,
    totalRetained,
    totalAmount,
    byType,
  };
}

// Tipos de retención con etiquetas
export const RETENTION_TYPES: Record<RetentionType, { label: string; description: string }> = {
  ISR_RETENTION: {
    label: "Retención ISR",
    description: "Impuesto Sobre la Renta",
  },
  IVA_RETENTION: {
    label: "Retención IVA",
    description: "Impuesto a la Transferencia de Bienes y Servicios",
  },
  ISC_RETENTION: {
    label: "Retención ISC",
    description: "Impuesto Específico a los Combustibles",
  },
  FLETE_RETENTION: {
    label: "Retención Flete",
    description: "Retención en fletes",
  },
  ICA_RETENTION: {
    label: "Retención ICA",
    description: "Industria y Comercio - Aerocivil",
  },
  RENTA_RETENTION: {
    label: "Retención Renta",
    description: "Retención en la fuente de renta",
  },
  NOTARY_RETENTION: {
    label: "Retención Notarios",
    description: "Retención a notarios",
  },
};
