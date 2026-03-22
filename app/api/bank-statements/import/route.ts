import { NextResponse } from "next/server";
import { unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { 
  parseCSV, 
  detectFileType, 
  toReconciliationItems,
  ParsedTransaction,
  BANK_FORMATS 
} from "@/lib/bank-statement-parser";

/**
 * Tipos de datos para la respuesta
 */
interface ImportResult {
  success: boolean;
  importId?: string;
  previewData: Array<{
    date: string;
    description: string;
    reference: string | null;
    amount: number;
    type: "CREDIT" | "DEBIT";
  }>;
  metadata: {
    bankName: string | null;
    dateRange: { start: string; end: string } | null;
    totalTransactions: number;
    totalCredits: number;
    totalDebits: number;
    format: string;
    filename: string;
  };
  errors: Array<{ row: number; message: string }>;
}

/**
 * POST /api/bank-statements/import
 * Importa un extracto bancario (CSV o XLSX)
 * 
 * El archivo se procesa y devuelve una vista previa de las transacciones
 * detectadas para que el usuario pueda revisar antes de confirmar.
 */
export async function POST(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    // Obtener el archivo
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bankAccountId = formData.get("bankAccountId") as string | null;
    const format = formData.get("format") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    // Validar que la cuenta bancaria existe
    if (!bankAccountId) {
      return NextResponse.json({ error: "Se requiere especificar la cuenta bancaria" }, { status: 400 });
    }

    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, organizationId },
    });

    if (!bankAccount) {
      return NextResponse.json({ error: "Cuenta bancaria no encontrada" }, { status: 404 });
    }

    // Leer el contenido del archivo
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Detectar tipo de archivo
    const fileType = detectFileType(file.name, buffer);
    
    if (fileType !== "CSV") {
      return NextResponse.json({ 
        error: `Tipo de archivo no soportado: ${fileType}. Solo se soporta CSV actualmente.` 
      }, { status: 400 });
    }

    // Decodificar contenido
    const content = buffer.toString("utf-8");
    
    // Parsear según el formato seleccionado o auto-detectar
    let bankFormat = format && BANK_FORMATS[format] ? BANK_FORMATS[format] : undefined;
    const parseResult = parseCSV(content, bankFormat);

    if (parseResult.transactions.length === 0 && parseResult.errors.length > 0) {
      // Crear registro de import fallido
      await prisma.bankStatementImport.create({
        data: {
          organizationId,
          bankAccountId,
          filename: file.name,
          fileSize: file.size,
          status: "FAILED",
          errorMessage: parseResult.errors.map(e => `Fila ${e.row}: ${e.message}`).join("; "),
        },
      });

      return NextResponse.json({
        success: false,
        errors: parseResult.errors,
        metadata: {
          ...parseResult.metadata,
          filename: file.name,
        },
      }, { status: 400 });
    }

    // Crear registro de import
    const importRecord = await prisma.bankStatementImport.create({
      data: {
        organizationId,
        bankAccountId,
        filename: file.name,
        fileSize: file.size,
        transactions: parseResult.transactions.length,
        status: "PENDING",
        previewData: JSON.stringify(parseResult.transactions),
      },
    });

    // Preparar respuesta con vista previa
    const previewData = parseResult.transactions.slice(0, 100).map((t: ParsedTransaction) => ({
      date: t.date.toISOString(),
      description: t.description,
      reference: t.reference,
      amount: t.amount,
      type: t.type,
    }));

    const result: ImportResult = {
      success: true,
      importId: importRecord.id,
      previewData,
      metadata: {
        bankName: parseResult.metadata.bankName,
        dateRange: parseResult.metadata.dateRange 
          ? { 
              start: parseResult.metadata.dateRange.start.toISOString(), 
              end: parseResult.metadata.dateRange.end.toISOString() 
            } 
          : null,
        totalTransactions: parseResult.transactions.length,
        totalCredits: parseResult.metadata.totalCredits,
        totalDebits: parseResult.metadata.totalDebits,
        format: parseResult.metadata.format,
        filename: file.name,
      },
      errors: parseResult.errors,
    };

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error("Import bank statement error:", error);
    return errorResponse("Error al importar el extracto bancario");
  }
}

/**
 * GET /api/bank-statements/import
 * Lista los imports de extractos bancarios
 */
export async function GET(request: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  
  if (!organizationId) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const bankAccountId = searchParams.get("bankAccountId");
    const status = searchParams.get("status");

    const where: any = { organizationId };
    if (bankAccountId) where.bankAccountId = bankAccountId;
    if (status) where.status = status;

    const imports = await prisma.bankStatementImport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(imports);
  } catch (error) {
    console.error("Fetch bank statement imports error:", error);
    return errorResponse("Error fetching bank statement imports");
  }
}
