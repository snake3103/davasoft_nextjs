/**
 * Bank Statement Parser
 * 
 * Parser para diferentes formatos de extractos bancarios.
 * Soporta CSV, XLSX y detecta automáticamente el formato.
 */

// Tipos de datos
export interface ParsedTransaction {
  date: Date;
  description: string;
  reference: string | null;
  amount: number; // Positivo = crédito (entrada), Negativo = débito (salida)
  type: "CREDIT" | "DEBIT";
  balance: number | null; // Saldo después de la transacción
  rawData: Record<string, string>; // Datos originales para debugging
}

export interface ParseResult {
  success: boolean;
  transactions: ParsedTransaction[];
  errors: ParseError[];
  metadata: {
    bankName: string | null;
    accountNumber: string | null;
    dateRange: { start: Date; end: Date } | null;
    totalCredits: number;
    totalDebits: number;
    currency: string;
    format: string;
  };
}

export interface ParseError {
  row: number;
  message: string;
  rawData?: string;
}

export interface BankFormat {
  name: string;
  bankName: string;
  dateColumn: number | string;
  descriptionColumn: number | string;
  amountColumn?: number | string; // Requerido si NO hay debitColumn y creditColumn
  debitColumn?: number | string; // Alternativa a amountColumn
  creditColumn?: number | string; // Alternativa a amountColumn
  referenceColumn?: number | string;
  balanceColumn?: number | string;
  dateFormat: string;
  decimalSeparator: "." | ",";
  thousandsSeparator: "," | "." | "";
  skipRows: number;
  encoding: "utf-8" | "latin1";
}

// Formatos de bancos comunes (Latinoamérica)
export const BANK_FORMATS: Record<string, BankFormat> = {
  // Formato genérico CSV
  GENERIC_CSV: {
    name: "Generic CSV",
    bankName: "Generic",
    dateColumn: 0,
    descriptionColumn: 1,
    amountColumn: 2,
    dateFormat: "YYYY-MM-DD",
    decimalSeparator: ".",
    thousandsSeparator: ",",
    skipRows: 0,
    encoding: "utf-8",
  },
  
  // República Dominicana - Banco Popular
  BANCO_POPULAR: {
    name: "Banco Popular - República Dominicana",
    bankName: "Banco Popular Dominicano",
    dateColumn: "Fecha",
    descriptionColumn: "Descripción",
    amountColumn: "Monto",
    referenceColumn: "Referencia",
    balanceColumn: "Saldo",
    dateFormat: "DD/MM/YYYY",
    decimalSeparator: ".",
    thousandsSeparator: ",",
    skipRows: 1,
    encoding: "utf-8",
  },
  
  // República Dominicana - Banco de Reservas
  BANCO_RESERVAS: {
    name: "Banco de Reservas - República Dominicana",
    bankName: "Banco de Reservas",
    dateColumn: "FECHA",
    descriptionColumn: "DESCRIPCION",
    debitColumn: "DEBITO",
    creditColumn: "CREDITO",
    balanceColumn: "SALDO",
    dateFormat: "DD/MM/YYYY",
    decimalSeparator: ".",
    thousandsSeparator: ",",
    skipRows: 1,
    encoding: "utf-8",
  },
  
  // Estados Unidos - Chase
  CHASE: {
    name: "Chase Bank - USA",
    bankName: "Chase",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    balanceColumn: "Balance",
    dateFormat: "MM/DD/YYYY",
    decimalSeparator: ".",
    thousandsSeparator: ",",
    skipRows: 0,
    encoding: "utf-8",
  },
  
  // Estados Unidos - Bank of America
  BOFA: {
    name: "Bank of America - USA",
    bankName: "Bank of America",
    dateColumn: "Date",
    descriptionColumn: "Description",
    debitColumn: "Withdrawal, ATM",
    creditColumn: "Deposit",
    balanceColumn: "Balance",
    dateFormat: "MM/DD/YYYY",
    decimalSeparator: ".",
    thousandsSeparator: ",",
    skipRows: 0,
    encoding: "utf-8",
  },
  
  // México - BBVA México
  BBVA_MX: {
    name: "BBVA México",
    bankName: "BBVA México",
    dateColumn: "Fecha",
    descriptionColumn: "Descripción",
    debitColumn: "Retiros",
    creditColumn: "Depósitos",
    balanceColumn: "Saldo",
    dateFormat: "DD/MM/YYYY",
    decimalSeparator: ".",
    thousandsSeparator: ",",
    skipRows: 1,
    encoding: "utf-8",
  },
  
  // Colombia - Bancolombia
  BANCOLOMBIA: {
    name: "Bancolombia - Colombia",
    bankName: "Bancolombia",
    dateColumn: "Fecha",
    descriptionColumn: "Descripción",
    amountColumn: "Valor",
    referenceColumn: "Referencia",
    dateFormat: "YYYY-MM-DD",
    decimalSeparator: ",",
    thousandsSeparator: ".",
    skipRows: 0,
    encoding: "utf-8",
  },
};

/**
 * Detecta el formato del archivo basándose en las cabeceras
 */
export function detectFormat(headers: string[]): BankFormat | null {
  const normalizedHeaders = headers.map(h => h.trim().toUpperCase());
  
  // Buscar coincidencias con formatos conocidos
  for (const [key, format] of Object.entries(BANK_FORMATS)) {
    const formatHeaders = [
      format.dateColumn,
      format.descriptionColumn,
      format.amountColumn,
      format.debitColumn,
      format.creditColumn,
    ].filter(h => typeof h === "string") as string[];
    
    const matches = formatHeaders.filter(h => 
      normalizedHeaders.includes((h as string).toUpperCase())
    ).length;
    
    // Si hay al menos 2 coincidencias, asumimos este formato
    if (matches >= 2) {
      return format;
    }
  }
  
  return BANK_FORMATS.GENERIC_CSV;
}

/**
 * Parsea una fecha en diferentes formatos
 */
export function parseDate(dateStr: string, format: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;
  
  const cleanDate = dateStr.trim();
  
  // Intentar múltiples formatos
  const formats = [
    format,
    "YYYY-MM-DD",
    "DD/MM/YYYY",
    "MM/DD/YYYY",
    "YYYY/MM/DD",
    "DD-MM-YYYY",
    "MM-DD-YYYY",
    "YYYY-MM-DDTHH:mm:ss",
  ];
  
  for (const fmt of formats) {
    try {
      const parsed = parseDateByFormat(cleanDate, fmt);
      if (parsed && !isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch {
      continue;
    }
  }
  
  // Intentar con Date nativo como fallback
  const fallback = new Date(cleanDate);
  if (!isNaN(fallback.getTime())) {
    return fallback;
  }
  
  return null;
}

/**
 * Parsea fecha según formato específico
 */
function parseDateByFormat(dateStr: string, format: string): Date | null {
  const parts: Record<string, number> = {};
  
  // Extraer componentes de fecha
  if (format.includes("DD")) {
    const match = dateStr.match(/(\d{1,2})/);
    if (match) parts.DD = parseInt(match[1], 10);
  }
  if (format.includes("MM")) {
    const match = dateStr.match(/(\d{1,2})/);
    if (match) parts.MM = parseInt(match[1], 10) - 1;
  }
  if (format.includes("YYYY")) {
    const match = dateStr.match(/(\d{4})/);
    if (match) parts.YYYY = parseInt(match[1], 10);
  } else if (format.includes("YY")) {
    const match = dateStr.match(/(\d{2})/);
    if (match) parts.YYYY = 2000 + parseInt(match[1], 10);
  }
  
  if (parts.DD && parts.MM !== undefined && parts.YYYY) {
    return new Date(parts.YYYY, parts.MM, parts.DD);
  }
  
  return null;
}

/**
 * Parsea un monto en diferentes formatos
 */
export function parseAmount(amountStr: string, decimalSeparator: "." | ",", thousandsSeparator: "," | "." | ""): number {
  if (!amountStr || amountStr.trim() === "") return 0;
  
  let cleanAmount = amountStr.trim();
  
  // Remover espacios
  cleanAmount = cleanAmount.replace(/\s/g, "");
  
  // Remover símbolos de moneda
  cleanAmount = cleanAmount.replace(/[$€£¥]/g, "");
  
  // Remover paréntesis (números negativos en formato contable)
  const isNegative = cleanAmount.startsWith("(") && cleanAmount.endsWith(")");
  if (isNegative) {
    cleanAmount = cleanAmount.slice(1, -1);
  }
  
  // Remover el signo menos si existe
  const hasMinus = cleanAmount.startsWith("-");
  if (hasMinus) {
    cleanAmount = cleanAmount.slice(1);
  }
  
  // Normalizar separadores de miles y decimales
  if (decimalSeparator === ",") {
    // Formato europeo: 1.234,56
    cleanAmount = cleanAmount.replace(/\./g, "");
    cleanAmount = cleanAmount.replace(",", ".");
  } else {
    // Formato americano: 1,234.56
    cleanAmount = cleanAmount.replace(/,/g, "");
  }
  
  const value = parseFloat(cleanAmount);
  
  if (isNaN(value)) return 0;
  
  return (isNegative || hasMinus) ? -value : value;
}

/**
 * Encuentra el índice de una columna por nombre
 */
function findColumnIndex(headers: string[], columnRef: number | string): number {
  if (typeof columnRef === "number") {
    return columnRef;
  }
  
  const normalizedRef = columnRef.toUpperCase().trim();
  
  // Buscar coincidencia exacta
  const exactIndex = headers.findIndex(h => h.toUpperCase().trim() === normalizedRef);
  if (exactIndex !== -1) return exactIndex;
  
  // Buscar coincidencia parcial
  const partialIndex = headers.findIndex(h => 
    h.toUpperCase().trim().includes(normalizedRef)
  );
  
  return partialIndex;
}

/**
 * Parsea contenido CSV
 */
export function parseCSV(content: string, format?: BankFormat): ParseResult {
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");
  
  if (lines.length === 0) {
    return {
      success: false,
      transactions: [],
      errors: [{ row: 0, message: "El archivo está vacío" }],
      metadata: {
        bankName: null,
        accountNumber: null,
        dateRange: null,
        totalCredits: 0,
        totalDebits: 0,
        currency: "DOP",
        format: "unknown",
      },
    };
  }
  
  // Detectar formato si no se proporciona
  const detectedFormat = format || detectFormat(parseCSVLine(lines[0])) || BANK_FORMATS.GENERIC_CSV;
  
  // Parsear cabeceras
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  
  // Configuración de parsing
  const config = detectedFormat;
  const skipRows = config.skipRows;
  
  const transactions: ParsedTransaction[] = [];
  const errors: ParseError[] = [];
  
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  let totalCredits = 0;
  let totalDebits = 0;
  
  // Parsear filas
  for (let i = skipRows + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const columns = parseCSVLine(line);
    const rawData: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rawData[h] = columns[idx] || "";
    });
    
    try {
      // Extraer datos según el formato
      const dateColIdx = findColumnIndex(headers, config.dateColumn);
      const descColIdx = findColumnIndex(headers, config.descriptionColumn);
      const refColIdx = config.referenceColumn 
        ? findColumnIndex(headers, config.referenceColumn) 
        : -1;
      const balanceColIdx = config.balanceColumn 
        ? findColumnIndex(headers, config.balanceColumn) 
        : -1;
      
      const dateStr = columns[dateColIdx];
      const description = columns[descColIdx];
      const reference = refColIdx >= 0 ? columns[refColIdx] : null;
      const balanceStr = balanceColIdx >= 0 ? columns[balanceColIdx] : null;
      
      // Parsear fecha
      const date = parseDate(dateStr, config.dateFormat);
      if (!date) {
        errors.push({ row: i + 1, message: `Fecha inválida: ${dateStr}`, rawData: line });
        continue;
      }
      
      // Parsear monto
      let amount = 0;
      let type: "CREDIT" | "DEBIT" = "DEBIT";
      
      if (config.debitColumn && config.creditColumn) {
        // Formato con columnas separadas para débitos y créditos
        const debitColIdx = findColumnIndex(headers, config.debitColumn);
        const creditColIdx = findColumnIndex(headers, config.creditColumn);
        
        const debitStr = columns[debitColIdx];
        const creditStr = columns[creditColIdx];
        
        if (creditStr && creditStr.trim()) {
          amount = parseAmount(creditStr, config.decimalSeparator, config.thousandsSeparator);
          type = "CREDIT";
        } else if (debitStr && debitStr.trim()) {
          amount = -parseAmount(debitStr, config.decimalSeparator, config.thousandsSeparator);
          type = "DEBIT";
        }
      } else if (config.amountColumn !== undefined) {
        // Formato con una sola columna de monto
        const amountColIdx = findColumnIndex(headers, config.amountColumn);
        const amountStr = columns[amountColIdx];
        
        amount = parseAmount(amountStr, config.decimalSeparator, config.thousandsSeparator);
        type = amount >= 0 ? "CREDIT" : "DEBIT";
      }
      
      // Parsear saldo
      const balance = balanceStr ? parseAmount(balanceStr, config.decimalSeparator, config.thousandsSeparator) : null;
      
      // Calcular totales
      if (type === "CREDIT") {
        totalCredits += amount;
      } else {
        totalDebits += Math.abs(amount);
      }
      
      // Actualizar rango de fechas
      if (!startDate || date < startDate) startDate = date;
      if (!endDate || date > endDate) endDate = date;
      
      transactions.push({
        date,
        description: description || "",
        reference,
        amount,
        type,
        balance,
        rawData,
      });
      
    } catch (error) {
      errors.push({ 
        row: i + 1, 
        message: `Error al procesar fila: ${error instanceof Error ? error.message : "Error desconocido"}`,
        rawData: line,
      });
    }
  }
  
  return {
    success: errors.length === 0,
    transactions,
    errors,
    metadata: {
      bankName: config.bankName,
      accountNumber: null,
      dateRange: startDate && endDate ? { start: startDate, end: endDate } : null,
      totalCredits,
      totalDebits,
      currency: "DOP",
      format: config.name,
    },
  };
}

/**
 * Parsea una línea CSV
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

/**
 * Detecta el tipo de archivo por su contenido o nombre
 */
export function detectFileType(
  filename: string,
  content?: Buffer | ArrayBuffer
): "CSV" | "XLSX" | "OFX" | "UNKNOWN" {
  const ext = filename.toLowerCase().split(".").pop();
  
  if (ext === "csv") return "CSV";
  if (ext === "xlsx" || ext === "xls") return "XLSX";
  if (ext === "ofx" || ext === "qfx") return "OFX";
  
  // Detectar por contenido si está disponible
  if (content) {
    let bytes: Buffer;
    if (content instanceof Buffer) {
      bytes = content;
    } else {
      // Convertir ArrayBuffer a Buffer
      bytes = Buffer.from(new Uint8Array(content));
    }
    const header = bytes.slice(0, 8).toString("utf-8");
    
    // Detectar XLSX (ZIP starts with PK)
    if (header.startsWith("PK")) return "XLSX";
    
    // Detectar XML-based formats
    if (header.includes("<?xml") || header.includes("<OFX>")) return "OFX";
  }
  
  return "UNKNOWN";
}

/**
 * Convierte transacciones parseadas al formato de ReconciliationItem
 */
export function toReconciliationItems(
  transactions: ParsedTransaction[]
): Array<{
  description: string;
  reference: string | null;
  statementDate: Date;
  statementAmount: number;
}> {
  return transactions.map(t => ({
    description: t.description,
    reference: t.reference,
    statementDate: t.date,
    statementAmount: t.amount,
  }));
}
