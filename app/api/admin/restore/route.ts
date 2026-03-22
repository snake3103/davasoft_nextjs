import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { filename } = await request.json();
    
    if (!filename || !filename.endsWith(".sql")) {
      return NextResponse.json({ error: "Nombre de archivo inválido" }, { status: 400 });
    }
    
    const backupFile = path.join(process.cwd(), "backups", filename);
    
    try {
      await fs.access(backupFile);
    } catch {
      return NextResponse.json({ error: "Archivo de backup no encontrado" }, { status: 404 });
    }
    
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL no configurado" }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Restore preparado. En producción, ejecutar manualmente con pg_restore",
      file: filename,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error en restore", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
