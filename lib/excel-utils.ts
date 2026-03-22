import ExcelJS from "exceljs";

export interface ProductImportRow {
  name: string;
  sku?: string;
  price?: number;
  cost?: number;
  stock?: number;
  category?: string;
  description?: string;
}

export interface ClientImportRow {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  idNumber?: string;
  type?: "CLIENT" | "PROVIDER" | "BOTH";
}

/**
 * Parse an Excel file buffer into rows
 */
export async function parseExcelFile<T>(buffer: Buffer | ArrayBuffer | Uint8Array): Promise<T[]> {
  const workbook = new ExcelJS.Workbook();
  // Convert to ArrayBuffer if needed
  let arrayBuffer: ArrayBuffer;
  if (buffer instanceof Buffer) {
    arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  } else if (buffer instanceof Uint8Array) {
    arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  } else {
    arrayBuffer = buffer;
  }
  await workbook.xlsx.load(arrayBuffer);
  const worksheet = workbook.getWorksheet(1);
  
  if (!worksheet) {
    return [];
  }
  
  const rows: any[] = [];
  
  // Get headers from first row
  const headers: string[] = [];
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    headers.push(String(cell.value || `col_${headers.length}`));
  });
  
  // Process data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row
    const values: any[] = [];
    row.eachCell((cell) => {
      values.push(cell.value);
    });
    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h] = values[i];
    });
    rows.push(obj);
  });
  
  return rows as T[];
}

/**
 * Generate an Excel template for products
 */
export async function generateProductTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Productos");
  
  // Headers
  worksheet.columns = [
    { header: "name", key: "name", width: 40 },
    { header: "sku", key: "sku", width: 15 },
    { header: "price", key: "price", width: 12 },
    { header: "cost", key: "cost", width: 12 },
    { header: "stock", key: "stock", width: 10 },
    { header: "category", key: "category", width: 20 },
    { header: "description", key: "description", width: 40 },
  ];
  
  // Sample data rows
  const template = [
    {
      name: "Producto 1",
      sku: "SKU001",
      price: 100.00,
      cost: 50.00,
      stock: 10,
      category: "Categoría 1",
      description: "Descripción del producto"
    },
    {
      name: "Producto 2",
      sku: "SKU002",
      price: 200.00,
      cost: 100.00,
      stock: 20,
      category: "Categoría 2",
      description: "Descripción del producto 2"
    }
  ];
  
  worksheet.addRows(template);
  
  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9E1F2" }
  };
  
  const bufferResult = await workbook.xlsx.writeBuffer();
  return Buffer.from(bufferResult as ArrayBuffer);
}

/**
 * Generate an Excel template for contacts/clients
 */
export async function generateClientTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Contactos");
  
  // Headers
  worksheet.columns = [
    { header: "name", key: "name", width: 40 },
    { header: "email", key: "email", width: 30 },
    { header: "phone", key: "phone", width: 15 },
    { header: "address", key: "address", width: 40 },
    { header: "idNumber", key: "idNumber", width: 18 },
    { header: "type", key: "type", width: 12 },
  ];
  
  // Sample data rows
  const template = [
    {
      name: "Cliente Ejemplo 1",
      email: "cliente@ejemplo.com",
      phone: "809-555-1234",
      address: "Dirección del cliente",
      idNumber: "001-1234567-1",
      type: "CLIENT"
    },
    {
      name: "Proveedor Ejemplo 1",
      email: "proveedor@ejemplo.com",
      phone: "809-555-5678",
      address: "Dirección del proveedor",
      idNumber: "001-7654321-1",
      type: "PROVIDER"
    }
  ];
  
  worksheet.addRows(template);
  
  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9E1F2" }
  };
  
  const bufferResult = await workbook.xlsx.writeBuffer();
  return Buffer.from(bufferResult as ArrayBuffer);
}

/**
 * Export data to Excel and return as buffer
 */
export async function exportToExcelBuffer(data: Record<string, any>[], sheetName = "Sheet1"): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  
  if (data.length > 0) {
    // Add headers
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);
    
    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9E1F2" }
    };
    
    // Add data rows
    data.forEach(row => {
      worksheet.addRow(Object.values(row));
    });
    
    // Auto-fit columns
    headers.forEach((header, i) => {
      const maxWidth = Math.max(
        header.length,
        ...data.map(row => String(row[header] || "").length)
      );
      worksheet.getColumn(i + 1).width = Math.min(maxWidth + 2, 50);
    });
  }
  
  const bufferResult = await workbook.xlsx.writeBuffer();
  return Buffer.from(bufferResult as ArrayBuffer);
}

/**
 * Create Excel workbook from products array
 */
export async function createProductsExcel(products: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Productos");
  
  const data = products.map(p => ({
    name: p.name,
    sku: p.sku || "",
    price: p.price,
    cost: p.cost || 0,
    stock: p.stock || 0,
    category: p.category?.name || "",
    description: p.description || "",
    createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""
  }));
  
  // Columns
  worksheet.columns = [
    { header: "Nombre", key: "name", width: 40 },
    { header: "SKU", key: "sku", width: 15 },
    { header: "Precio", key: "price", width: 12 },
    { header: "Costo", key: "cost", width: 12 },
    { header: "Stock", key: "stock", width: 10 },
    { header: "Categoría", key: "category", width: 20 },
    { header: "Descripción", key: "description", width: 40 },
    { header: "Fecha Creación", key: "createdAt", width: 15 },
  ];
  
  worksheet.addRows(data);
  
  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9E1F2" }
  };
  
  const bufferResult = await workbook.xlsx.writeBuffer();
  return Buffer.from(bufferResult as ArrayBuffer);
}

/**
 * Create Excel workbook from clients array
 */
export async function createClientsExcel(clients: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Contactos");
  
  const data = clients.map(c => ({
    name: c.name,
    email: c.email || "",
    phone: c.phone || "",
    address: c.address || "",
    idNumber: c.idNumber || "",
    type: c.type || "CLIENT",
    createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""
  }));
  
  // Columns
  worksheet.columns = [
    { header: "Nombre", key: "name", width: 40 },
    { header: "Email", key: "email", width: 30 },
    { header: "Teléfono", key: "phone", width: 15 },
    { header: "Dirección", key: "address", width: 40 },
    { header: "RNC/Cédula", key: "idNumber", width: 18 },
    { header: "Tipo", key: "type", width: 12 },
    { header: "Fecha Creación", key: "createdAt", width: 15 },
  ];
  
  worksheet.addRows(data);
  
  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9E1F2" }
  };
  
  const bufferResult = await workbook.xlsx.writeBuffer();
  return Buffer.from(bufferResult as ArrayBuffer);
}

/**
 * Validate product import row
 */
export function validateProductRow(row: ProductImportRow): { valid: boolean; error?: string } {
  if (!row.name || row.name.trim() === "") {
    return { valid: false, error: "El nombre es requerido" };
  }
  
  if (row.price !== undefined && isNaN(Number(row.price))) {
    return { valid: false, error: `Precio inválido para "${row.name}"` };
  }
  
  if (row.cost !== undefined && isNaN(Number(row.cost))) {
    return { valid: false, error: `Costo inválido para "${row.name}"` };
  }
  
  if (row.stock !== undefined && isNaN(Number(row.stock))) {
    return { valid: false, error: `Stock inválido para "${row.name}"` };
  }
  
  return { valid: true };
}

/**
 * Validate client import row
 */
export function validateClientRow(row: ClientImportRow): { valid: boolean; error?: string } {
  if (!row.name || row.name.trim() === "") {
    return { valid: false, error: "El nombre es requerido" };
  }
  
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    return { valid: false, error: `Email inválido para "${row.name}"` };
  }
  
  if (row.type && !["CLIENT", "PROVIDER", "BOTH"].includes(row.type)) {
    return { valid: false, error: `Tipo inválido para "${row.name}". Use: CLIENT, PROVIDER o BOTH` };
  }
  
  return { valid: true };
}
