"use client";

import { Bell, Search, UserCircle, PlusCircle, HelpCircle, LogOut, X, Loader2, User, FileText, Package } from "lucide-react";
import { signOut } from "next-auth/react";
import { useStore } from "@/store/useStore";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "client" | "invoice" | "product";
  href: string;
}

export function Header() {
  const { setTransactionModalOpen, notifications, removeNotification, addNotification } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleHelpClick = () => {
    addNotification("Centro de ayuda cargando...", "info");
    alert("Centro de ayuda: Estamos preparando la documentación para ti. Por ahora, contacta a soporte@davasoft.com");
  };

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data.results);
            setShowResults(true);
          }
        } catch (error) {
          console.error("Search fetch error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "client": return <User size={16} className="text-blue-500" />;
      case "invoice": return <FileText size={16} className="text-emerald-500" />;
      case "product": return <Package size={16} className="text-amber-500" />;
      default: return null;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center w-1/3" ref={searchRef}>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            placeholder="Buscar clientes, facturas o productos..."
            className="w-full bg-slate-50 border-none rounded-full py-2 pl-10 pr-10 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={18} />
          )}
          {query && !isSearching && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-2xl border border-border overflow-hidden z-50">
              {results.length > 0 ? (
                <div className="py-2">
                  {results.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={result.href}
                      onClick={() => setShowResults(false)}
                      className="flex items-center px-4 py-3 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3 group-hover:bg-white transition-colors">
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{result.title}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{result.subtitle}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500 italic">No se encontraron resultados para "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button
          onClick={() => setTransactionModalOpen(true)}
          className="flex items-center text-primary font-semibold text-sm hover:opacity-80 transition-opacity"
        >
          <PlusCircle size={20} className="mr-2" />
          Nuevo
        </button>

        <div className="flex items-center space-x-4 text-slate-500">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors relative"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-border overflow-hidden z-50">
                <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-800">Notificaciones</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="mx-auto h-8 w-8 text-slate-200 mb-2" />
                      <p className="text-sm text-slate-500">No hay notificaciones nuevas</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-4 border-b border-border last:border-0 hover:bg-slate-50 transition-colors flex justify-between items-start">
                        <div>
                          <p className={`text-xs font-medium ${n.type === 'error' ? 'text-rose-600' : n.type === 'success' ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {n.type.toUpperCase()}
                          </p>
                          <p className="text-sm text-slate-700 mt-1">{n.message}</p>
                        </div>
                        <button onClick={() => removeNotification(n.id)} className="text-slate-300 hover:text-slate-500">
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleHelpClick}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <HelpCircle size={20} />
          </button>
        </div>

        <div className="h-8 w-px bg-border mx-2"></div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700 leading-none">Administrador</p>
              <p className="text-[10px] text-slate-400 mt-1">admin@davasoft.com</p>
            </div>
            <UserCircle size={32} className="text-slate-400 group-hover:text-primary transition-colors" />
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
