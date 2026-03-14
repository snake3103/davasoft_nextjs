import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const posConfigSchema = z.object({
  posType: z.enum(["STANDARD", "SPLIT"]).default("STANDARD"),
  printFormat: z.enum(["TICKET", "HALF_LETTER", "LETTER"]).default("TICKET"),
  printCopies: z.number().min(1).max(5).default(1),
  autoPrint: z.boolean().default(false),
  showLogo: z.boolean().default(true),
  defaultClientId: z.string().optional().nullable(),
  defaultTaxRate: z.number().min(0).max(100).default(18),
  taxIncluded: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const config = await prisma.pOSConfig.findUnique({
      where: { organizationId },
      include: {
        defaultClient: true,
      },
    });

    if (!config) {
      const defaultConfig = {
        posType: "STANDARD",
        printFormat: "TICKET",
        printCopies: 1,
        autoPrint: false,
        showLogo: true,
        defaultTaxRate: 18,
        taxIncluded: true,
        isActive: true,
      };
      return NextResponse.json(defaultConfig);
    }

    return NextResponse.json({
      id: config.id,
      posType: config.posType,
      printFormat: config.printFormat,
      printCopies: config.printCopies,
      autoPrint: config.autoPrint,
      showLogo: config.showLogo,
      defaultClientId: config.defaultClientId,
      defaultTaxRate: Number(config.defaultTaxRate),
      taxIncluded: config.taxIncluded,
      isActive: config.isActive,
    });
  } catch (error) {
    console.error("Error fetching POS config:", error);
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = posConfigSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const data = result.data;

    const config = await prisma.pOSConfig.upsert({
      where: { organizationId },
      update: {
        posType: data.posType,
        printFormat: data.printFormat,
        printCopies: data.printCopies,
        autoPrint: data.autoPrint,
        showLogo: data.showLogo,
        defaultClientId: data.defaultClientId || null,
        defaultTaxRate: data.defaultTaxRate,
        taxIncluded: data.taxIncluded,
        isActive: data.isActive,
      },
      create: {
        organizationId,
        posType: data.posType,
        printFormat: data.printFormat,
        printCopies: data.printCopies,
        autoPrint: data.autoPrint,
        showLogo: data.showLogo,
        defaultClientId: data.defaultClientId || null,
        defaultTaxRate: data.defaultTaxRate,
        taxIncluded: data.taxIncluded,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({
      id: config.id,
      posType: config.posType,
      printFormat: config.printFormat,
      printCopies: config.printCopies,
      autoPrint: config.autoPrint,
      showLogo: config.showLogo,
      defaultClientId: config.defaultClientId,
      defaultTaxRate: Number(config.defaultTaxRate),
      taxIncluded: config.taxIncluded,
      isActive: config.isActive,
    });
  } catch (error) {
    console.error("Error saving POS config:", error);
    return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 });
  }
}
