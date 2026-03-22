import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

const execAsync = promisify(exec);

const BackupSchema = z.object({
  organizationId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Handle empty body gracefully
    let organizationId: string | undefined;
    try {
      const body = await request.json();
      const parsed = BackupSchema.parse(body);
      organizationId = parsed.organizationId;
    } catch {
      // Empty body is OK, organizationId is optional
      organizationId = undefined;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(process.cwd(), "backups");
    
    await fs.mkdir(backupDir, { recursive: true });
    
    const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);
    
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL no configurado" }, { status: 500 });
    }
    
    // Use pg_dump with -f flag instead of shell redirection
    const pgDumpCmd = `pg_dump -f "${backupFile}" "${dbUrl}"`;
    
    await execAsync(pgDumpCmd);
    
    const stats = await fs.stat(backupFile);
    
    return NextResponse.json({
      success: true,
      file: `backup-${timestamp}.sql`,
      size: stats.size,
      createdAt: timestamp,
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "Error al crear backup", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const backupDir = path.join(process.cwd(), "backups");
    await fs.mkdir(backupDir, { recursive: true });
    
    const files = await fs.readdir(backupDir);
    const backups = await Promise.all(
      files
        .filter(f => f.endsWith(".sql"))
        .map(async (f) => {
          const stats = await fs.stat(path.join(backupDir, f));
          return {
            name: f,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
          };
        })
    );
    
    backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({ backups });
  } catch (error) {
    return NextResponse.json({ backups: [] });
  }
}
