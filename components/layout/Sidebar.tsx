"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingCart,
  CreditCard,
  Users,
  Package,
  Banknote,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  FileText,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const menuItems = [
  { icon: Home, label: "Inicio", href: "/" },
  { icon: ShoppingCart, label: "Ventas", href: "/ventas" },
  { icon: FileText, label: "Cotizaciones", href: "/cotizaciones" },
  { icon: CreditCard, label: "Gastos", href: "/gastos" },
  { icon: Users, label: "Contactos", href: "/contactos" },
  { icon: Package, label: "Inventario", href: "/inventario" },
  { icon: Banknote, label: "Bancos", href: "/bancos" },
  { icon: ShoppingBag, label: "POS", href: "/pos" },
  { icon: Settings, label: "Configuración", href: "/configuracion" },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-border transition-all duration-300 flex flex-col sticky top-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-2xl font-bold text-primary tracking-tight">DavaSoft</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-slate-100 text-slate-500"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <p className={cn(
          "px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 transition-opacity",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}>
          Administración
        </p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg transition-colors group",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : item.label === "POS"
                    ? "text-emerald-600 hover:bg-emerald-50 bg-emerald-50/50"
                    : "text-sidebar-foreground hover:bg-slate-50 hover:text-primary"
              )}
            >
              <item.icon size={22} className={cn("shrink-0", isActive ? "text-white" : "group-hover:text-primary")} />
              {!isCollapsed && (
                <span className="ml-3 font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "w-full flex items-center px-3 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors group",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut size={22} className="shrink-0" />
          {!isCollapsed && <span className="ml-3 font-medium">Cerrar Sesión</span>}
        </button>

        {!isCollapsed && (
          <div className="bg-slate-50 p-3 rounded-xl border border-border">
            <p className="text-xs font-medium text-slate-500 mb-1">Estado del Plan</p>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-3/4"></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">75% de recursos usados</p>
          </div>
        )}
      </div>
    </aside>
  );
}
