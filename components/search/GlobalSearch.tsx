"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, User, Package, Truck, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { devLog } from "@/lib/safe-log";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "client" | "invoice" | "product" | "vehicle" | "workOrder";
  href: string;
}

const typeIcons: Record<string, React.ElementType> = {
  client: User,
  invoice: FileText,
  product: Package,
  vehicle: Truck,
  workOrder: Truck,
};

const typeColors: Record<string, string> = {
  client: "bg-blue-100 text-blue-600",
  invoice: "bg-emerald-100 text-emerald-600",
  product: "bg-amber-100 text-amber-600",
  vehicle: "bg-purple-100 text-purple-600",
  workOrder: "bg-orange-100 text-orange-600",
};

const typeLabels: Record<string, string> = {
  client: "Cliente",
  invoice: "Factura",
  product: "Producto",
  vehicle: "Vehículo",
  workOrder: "Orden de Servicio",
};

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Atajo de teclado Ctrl+K
  useEffect(() => {
    devLog("[GlobalSearch] Setting up keyboard listener");
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        devLog("[GlobalSearch] Opening search modal");
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        devLog("[GlobalSearch] Closing search modal");
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input cuando se abre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Buscar con debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search/global?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results);
          setSelectedIndex(0);
        }
      } catch (error) {
        devLog("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Navegación con teclado
  const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      navigateTo(results[selectedIndex].href);
    }
  }, [results, selectedIndex]);

  const navigateTo = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="absolute inset-x-4 top-[15%] mx-auto max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center border-b border-slate-100 px-4">
            <Search size={20} className="text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyNavigation}
              placeholder="Buscar clientes, productos, vehículos, órdenes..."
              className="flex-1 px-4 py-4 text-lg outline-none placeholder-slate-400"
            />
            {isLoading ? (
              <Loader2 size={20} className="text-slate-400 animate-spin" />
            ) : query ? (
              <button
                onClick={() => setQuery("")}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X size={18} className="text-slate-400" />
              </button>
            ) : null}
            <kbd className="ml-2 px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {query.length < 2 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500">Escribe al menos 2 caracteres para buscar</p>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-100 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-slate-100 rounded">↓</kbd>
                    navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-100 rounded">Enter</kbd>
                    seleccionar
                  </span>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500">No se encontraron resultados</p>
                <p className="text-sm text-slate-400 mt-1">para "{query}"</p>
              </div>
            ) : (
              <div className="py-2">
                {results.map((result, index) => {
                  const Icon = typeIcons[result.type] || Search;
                  const colorClass = typeColors[result.type] || "bg-slate-100 text-slate-600";
                  const label = typeLabels[result.type] || result.type;
                  
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => navigateTo(result.href)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 transition-colors text-left",
                        index === selectedIndex ? "bg-primary/5" : "hover:bg-slate-50"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", colorClass)}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{result.title}</p>
                        <p className="text-sm text-slate-500 truncate">{result.subtitle}</p>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        {label}
                      </span>
                      {index === selectedIndex && (
                        <kbd className="text-xs text-slate-400">Enter</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border shadow-sm">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 bg-white rounded border shadow-sm">K</kbd>
                abrir
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border shadow-sm">ESC</kbd>
                cerrar
              </span>
            </div>
            <span>Davasoft Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
