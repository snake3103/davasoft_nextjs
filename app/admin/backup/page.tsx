"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Database, Download, Trash2, Upload, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils";

interface Backup {
  name: string;
  size: number;
  createdAt: string;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/backup");
      const data = await res.json();
      setBackups(data.backups || []);
    } catch (err) {
      setMessage({ type: "error", text: "Error al cargar backups" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const createBackup = async () => {
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Backup creado: ${data.file}` });
        fetchBackups();
      } else {
        setMessage({ type: "error", text: data.error || "Error al crear backup" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    }
    setCreating(false);
  };

  const downloadBackup = (filename: string) => {
    window.open(`/api/admin/backup/${filename}`, "_blank");
  };

  const deleteBackup = async (filename: string) => {
    if (!confirm(`¿Eliminar ${filename}?`)) return;
    
    try {
      const res = await fetch(`/api/admin/backup/${filename}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Backup eliminado" });
        fetchBackups();
      } else {
        setMessage({ type: "error", text: "Error al eliminar" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="w-8 h-8" />
              Backup de Base de Datos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona copias de seguridad de PostgreSQL
            </p>
          </div>
          <Button onClick={createBackup} disabled={creating}>
            {creating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            <span className="ml-2">Crear Backup</span>
          </Button>
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === "success" 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
          }`}>
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Backups Disponibles</CardTitle>
            <CardDescription>
              {backups.length} backup(s) almacenado(s) en el servidor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando...</div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay backups disponibles
              </div>
            ) : (
              <div className="space-y-2">
                {backups.map((backup) => (
                  <div
                    key={backup.name}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <div className="font-medium">{backup.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatBytes(backup.size)} • {formatDate(backup.createdAt)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => downloadBackup(backup.name)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteBackup(backup.name)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Los backups se almacenan en la carpeta <code className="bg-muted px-1 rounded">backups/</code> del servidor</p>
            <p>• Solo se respaldan datos (no estructura ni índices)</p>
            <p>• Para restore completo, usar <code className="bg-muted px-1 rounded">pg_restore</code> manualmente</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
