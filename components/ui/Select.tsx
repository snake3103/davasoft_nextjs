"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  emptyText?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  className,
  error,
  disabled,
  searchable = true,
  emptyText = "No hay opciones disponibles",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    
    // Calcular posición del dropdown
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      });
    }
    
    setOpen(true);
    setQuery("");
  };

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setOpen(true);
  };

  const filteredOptions = query.trim().length === 0
    ? options
    : options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        (o.description && o.description.toLowerCase().includes(query.toLowerCase()))
      );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)} onClick={(e) => e.stopPropagation()}>
      <div 
        ref={triggerRef}
        className={cn(
          "w-full flex items-center justify-between bg-white border rounded-xl px-4 py-2.5 text-sm cursor-pointer transition-all",
          error ? "border-rose-300 bg-rose-50" : "border-slate-100 hover:border-slate-200",
          disabled && "opacity-50 cursor-not-allowed",
          selectedOption ? "text-slate-700 font-medium" : "text-slate-400",
          open && "ring-2 ring-primary/20 border-primary"
        )}
        onClick={handleOpen}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {value && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={16} className={cn("text-slate-300 transition-transform", open && "rotate-180")} />
        )}
      </div>

      {open && (
        <div
          className="bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 max-h-64 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={dropdownStyle}
        >
          {searchable && (
            <div className="p-2 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          
          <div className="p-2">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-slate-400 italic">{emptyText}</p>
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option);
                    }}
                    disabled={option.disabled}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group",
                      option.disabled && "opacity-50 cursor-not-allowed",
                      isSelected 
                        ? "bg-primary/10 border-l-4 border-l-primary" 
                        : "hover:bg-slate-50 border-l-4 border-l-transparent"
                    )}
                  >
                    {option.icon && (
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isSelected 
                          ? "bg-primary text-white" 
                          : "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                      )}>
                        {option.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium transition-colors",
                        isSelected ? "text-primary" : "text-slate-700 group-hover:text-primary"
                      )}>
                        {option.label}
                      </p>
                      {option.description && (
                        <p className="text-[10px] text-slate-400">{option.description}</p>
                      )}
                    </div>
                    {isSelected && (
                      <Check size={16} className="text-primary shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
