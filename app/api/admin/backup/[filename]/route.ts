import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  if (!filename || !filename.endsWith(".sql")) {
    return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
  }
  
  const backupFile = path.join(process.cwd(), "backups", filename);
  
  try {
    const content = await fs.readFile(backupFile, "utf-8");
    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  if (!filename || !filename.endsWith(".sql")) {
    return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
  }
  
  const backupFile = path.join(process.cwd(), "backups", filename);
  
  try {
    await fs.unlink(backupFile);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
  }
}
