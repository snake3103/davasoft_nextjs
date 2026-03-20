"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Activity, 
  ArrowLeft, 
  Filter,
  Search,
  Loader2,
  User,
  FileText,
  ShoppingCart,
  Package,
  Settings,
  CreditCard,
  Building,
  MoreVertical
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface ActivityLog {
  id: string;
  type: string;
  action: string;
  description: string;
  module: string | null;
  entityType: string | null;
  entityId: string | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

const moduleIcons: Record<string, any> = {
  invoices: FileText,
  products: Package,
  clients: ShoppingCart,
  users: User,
  settings: Settings,
  payments: CreditCard,
  estimates: FileText,
  inventory: Package,
  bank: Building,
  default: Activity,
};

const moduleLabels: Record<string, string> = {
  invoices: "Facturas",
  products: "Inventario",
  clients: "Clientes",
  users: "Usuarios",
  settings: "Configuración",
  payments: "Pagos",
  estimates: "Cotizaciones",
  inventory: "Inventario",
  bank: "Bancos",
  auth: "Autenticación",
};

const typeLabels: Record<string, { label: string; color: string }> = {
  LOGIN: { label: "Login", color: "bg-emerald-100 text-emerald-700" },
  LOGOUT: { label: "Logout", color: "bg-slate-100 text-slate-600" },
  CREATE: { label: "Creó", color: "bg-blue-100 text-blue-700" },
  UPDATE: { label: "Actualizó", color: "bg-amber-100 text-amber-700" },
  DELETE: { label: "Eliminó", color: "bg-red-100 text-red-700" },
  VIEW: { label: "VIó", color: "bg-slate-100 text-slate-500" },
  EXPORT: { label: "Exportó", color: "bg-purple-100 text-purple-700" },
  PRINT: { label: "Imprimió", color: "bg-indigo-100 text-indigo-700" },
};

export default function ActivityLogPage() {
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery<{ activities: ActivityLog[]; total: number }>({
    queryKey: ["activity-logs", selectedModule],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedModule) params.set("module", selectedModule);
      const res = await fetch(`/api/activity-logs?${params}`);
      return res.json();
    },
  });

  const activities = data?.activities || [];
  const filteredActivities = searchQuery
    ? activities.filter(a => 
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activities;

  const modules = Array.from(new Set(activities.map(a => a.module).filter(Boolean)));

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
        <Link href="/configuracion" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-primary" size={28} />
            Historial de Actividad
          </h1>
          <p className="text-slate-500 text-sm">Registro de todas las acciones realizadas en el sistema.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por usuario, acción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="">Todos los módulos</option>
            {modules.map((mod) => (
              <option key={mod} value={mod!}>
                {moduleLabels[mod!] || mod}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Activity size={48} className="mx-auto mb-4 opacity-50" />
            <p>No hay actividades registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const Icon = moduleIcons[activity.module || "default"] || Activity;
              const typeInfo = typeLabels[activity.type] || { label: activity.type, color: "bg-slate-100 text-slate-600" };
              const userInitials = (activity.user.name || activity.user.email)
                .split(" ")
                .map(w => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const date = new Date(activity.createdAt);
              const timeAgo = getTimeAgo(date);

              return (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", typeInfo.color)}>
                        {typeInfo.label}
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        {activity.user.name || activity.user.email}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{timeAgo}</span>
                    </div>
                    <p className="text-sm text-slate-600">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Icon size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-400">
                        {moduleLabels[activity.module || ""] || activity.module || "Otro"}
                      </span>
                      {activity.entityType && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400">{activity.entityType}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </AppLayout>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? "s" : ""}`;
  return "hace un momento";
}
