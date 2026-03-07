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
  LogOut,
  Store
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const menuGroups = [
  {
    title: "Principal",
    items: [
      { icon: Home, label: "Inicio", href: "/" },
      { icon: Store, label: "Punto de Venta", href: "/pos", isSpecial: true },
    ]
  },
  {
    title: "Comercial",
    items: [
      { icon: ShoppingCart, label: "Ventas (Facturas)", href: "/ventas" },
      { icon: FileText, label: "Cotizaciones", href: "/cotizaciones" },
      { icon: Users, label: "Contactos", href: "/contactos" },
    ]
  },
  {
    title: "Operaciones",
    items: [
      { icon: ShoppingBag, label: "Compras", href: "/compras" },
      { icon: CreditCard, label: "Gastos", href: "/gastos" },
      { icon: Package, label: "Inventario", href: "/inventario" },
    ]
  },
  {
    title: "Finanzas",
    items: [
      { icon: Banknote, label: "Bancos", href: "/bancos" },
    ]
  },
  {
    title: "Sistema",
    items: [
      { icon: Settings, label: "Configuración", href: "/configuracion" },
    ]
  }
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-border transition-all duration-300 flex flex-col sticky top-0 bg-white",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        {!isCollapsed && (
          <span className="text-2xl font-black text-primary tracking-tight">DavaSoft</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5 flex flex-col items-center sm:items-stretch">
            <p className={cn(
              "px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest transition-all duration-300",
              isCollapsed ? "opacity-0 h-0 overflow-hidden m-0 p-0" : "opacity-100 mb-2 truncate"
            )}>
              {group.title}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    isCollapsed ? "justify-center w-12" : "w-full",
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20 font-semibold"
                      : item.isSpecial
                        ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-primary font-medium"
                  )}
                >
                  <item.icon
                    size={20}
                    className={cn(
                      "shrink-0",
                      isActive ? "text-white" : item.isSpecial ? "text-emerald-600" : "text-slate-400 group-hover:text-primary transition-colors"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-3 bg-slate-50/50">
        {!isCollapsed && (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm">
            <p className="text-xs font-bold text-slate-700 mb-1.5">Estado del Plan</p>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-primary w-3/4 rounded-full"></div>
            </div>
            <p className="text-[10px] font-semibold text-slate-400">75% de recursos usados</p>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "w-full flex items-center px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors group font-semibold text-sm",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut size={20} className="shrink-0 text-rose-500" />
          {!isCollapsed && <span className="ml-3">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
