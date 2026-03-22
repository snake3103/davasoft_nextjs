"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import { Search, User, CreditCard, Building2, ChevronDown, Package, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchProps {
    value: string;
    onSelect: (item: any) => void;
    onChange: (val: string) => void;
    placeholder?: string;
    error?: boolean;
}

interface ContactSearchProps extends SearchProps {
    contacts: any[];
}

export function ContactSearch({ value, onSelect, onChange, contacts, placeholder = "Buscar contacto...", error }: ContactSearchProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { 
        setQuery(value); 
        if (value) {
            const selected = contacts.find((c: any) => c.name === value);
            if (selected) setSelectedId(selected.id);
        }
    }, [value, contacts]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = () => {
        if (!inputRef.current) return;
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownStyle({
            position: "fixed",
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
        });
        setOpen(true);
        if (value && query) {
            setQuery("");
        }
    };

    const handleSelect = (c: any) => {
        setQuery(c.name);
        setSelectedId(c.id);
        onSelect(c);
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setQuery("");
        setSelectedId(null);
        onSelect({ name: "", id: "" });
        onChange("");
        setOpen(true);
    };

    const filtered = query.trim().length === 0
        ? contacts
        : contacts.filter((c: any) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            (c.idNumber && c.idNumber.toLowerCase().includes(query.toLowerCase()))
        );

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={handleOpen}
                    className={cn(
                        "w-full bg-slate-50 border rounded-xl pl-11 pr-10 py-3 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all",
                        error ? "border-rose-300 bg-rose-50" : "border-slate-100 hover:border-slate-200"
                    )}
                />
                {selectedId ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                ) : (
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                )}
            </div>

            {open && (
                <div
                    style={dropdownStyle}
                    className="bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 max-h-72 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[9999]"
                >
                    <div className="p-2 space-y-1">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-8 text-center space-y-2">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                    <Search size={20} />
                                </div>
                                <p className="text-xs text-slate-400 italic font-medium">No se encontraron resultados</p>
                            </div>
                        ) : (
                            filtered.map((c: any) => {
                                const isSelected = c.id === selectedId;
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => handleSelect(c)}
                                        className={cn(
                                            "w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-4 group",
                                            isSelected 
                                                ? "bg-primary/10 border-l-4 border-l-primary" 
                                                : "hover:bg-slate-50 border-l-4 border-l-transparent"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors",
                                            isSelected 
                                                ? "bg-primary text-white" 
                                                : "bg-white border border-slate-100 text-slate-400 group-hover:border-primary/20 group-hover:text-primary"
                                        )}>
                                            <User size={22} strokeWidth={1.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm font-bold truncate transition-colors",
                                                isSelected ? "text-primary" : "text-slate-700 group-hover:text-primary"
                                            )}>{c.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <CreditCard size={12} className="text-slate-300" />
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{c.idNumber || "Sin NIT / CC"}</p>
                                            </div>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-2">
                                            {isSelected && (
                                                <span className="text-[10px] text-primary font-bold">✓</span>
                                            )}
                                            <span className={cn(
                                                "text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-tighter border",
                                                isSelected ? "bg-primary text-white border-primary" :
                                                    c.type === "CLIENT" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                        c.type === "PROVIDER" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                            "bg-purple-50 text-purple-600 border-purple-100"
                                            )}>
                                                {c.type === "CLIENT" ? "Cliente" : c.type === "PROVIDER" ? "Prov" : "Ambos"}
                                            </span>
                                        </div>
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

export function CategorySearch({ value, onSelect, onChange, categories, placeholder = "Buscar categoría...", error }: any) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { 
        setQuery(value); 
        if (value) {
            const selected = categories.find((c: any) => c.name === value);
            if (selected) setSelectedId(selected.id);
        }
    }, [value, categories]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = () => {
        if (!inputRef.current) return;
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownStyle({
            position: "fixed",
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
        });
        setOpen(true);
        if (value && query) {
            setQuery("");
        }
    };

    const handleSelect = (c: any) => {
        setQuery(c.name);
        setSelectedId(c.id);
        onSelect(c);
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setQuery("");
        setSelectedId(null);
        onSelect({ name: "", id: "" });
        onChange("");
        setOpen(true);
    };

    const filtered = query.trim().length === 0
        ? categories
        : categories.filter((c: any) =>
            c.name.toLowerCase().includes(query.toLowerCase())
        );

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={handleOpen}
                    className={cn(
                        "w-full bg-slate-50 border rounded-xl pl-11 pr-10 py-3 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all",
                        error ? "border-rose-300 bg-rose-50" : "border-slate-100 hover:border-slate-200"
                    )}
                />
                {selectedId ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                ) : (
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                )}
            </div>

            {open && (
                <div
                    style={dropdownStyle}
                    className="bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 max-h-64 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[9999]"
                >
                    <div className="p-2 space-y-1">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-8 text-center uppercase tracking-widest text-slate-300 text-[10px] font-bold">
                                No hay resultados
                            </div>
                        ) : (
                            filtered.map((c: any) => {
                                const isSelected = c.id === selectedId;
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => handleSelect(c)}
                                        className={cn(
                                            "w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group",
                                            isSelected 
                                                ? "bg-primary/10 border-l-4 border-l-primary" 
                                                : "hover:bg-slate-50 border-l-4 border-l-transparent"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                            isSelected 
                                                ? "bg-primary text-white" 
                                                : "bg-white border border-slate-100 text-slate-400 group-hover:text-primary"
                                        )}>
                                            <Building2 size={18} strokeWidth={1.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm font-bold truncate transition-colors",
                                                isSelected ? "text-primary" : "text-slate-700 group-hover:text-primary"
                                            )}>{c.name}</p>
                                        </div>
                                        {isSelected && (
                                            <span className="text-[10px] text-primary font-bold">✓</span>
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

export function ProductSearch({ value, onSelect, onChange, products, placeholder = "Buscar producto...", error }: any) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { 
        setQuery(value); 
        if (value) {
            const selected = products.find((p: any) => p.name === value);
            if (selected) setSelectedId(selected.id);
        }
    }, [value, products]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = () => {
        if (!inputRef.current) return;
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownStyle({
            position: "fixed",
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
        });
        setOpen(true);
        if (value && query) {
            setQuery("");
        }
    };

    const handleSelect = (p: any) => {
        setQuery(p.name);
        setSelectedId(p.id);
        onSelect({ name: p.name, price: Number(p.price), id: p.id });
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setQuery("");
        setSelectedId(null);
        onSelect({ name: "", price: 0, id: "" });
        onChange("");
        setOpen(true);
    };

    const filtered = query.trim().length === 0
        ? products
        : products.filter((p: any) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(query.toLowerCase()))
        );

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    title={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={handleOpen}
                    className={cn(
                        "w-full bg-white border border-border rounded-lg pl-8 pr-8 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all",
                        error && "border-rose-400 bg-rose-50"
                    )}
                />
                {selectedId ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={14} />
                    </button>
                ) : null}
            </div>
            {open && (
                <div
                    style={dropdownStyle}
                    className="bg-white border border-border rounded-xl shadow-2xl max-h-64 overflow-y-auto z-[9999] min-w-[320px]"
                >
                    {filtered.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Search size={18} className="text-slate-300" />
                            </div>
                            <p className="text-xs text-slate-400 italic">Sin resultados</p>
                        </div>
                    ) : (
                        filtered.map((p: any) => {
                            const isSelected = p.id === selectedId;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleSelect(p)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 transition-colors flex items-center gap-3 group",
                                        isSelected 
                                            ? "bg-primary/10 border-l-4 border-l-primary" 
                                            : "hover:bg-primary/5 border-l-4 border-l-transparent"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                        isSelected 
                                            ? "bg-primary text-white" 
                                            : "bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white"
                                    )}>
                                        <Package size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p 
                                            className={cn(
                                                "text-sm font-semibold transition-colors",
                                                isSelected ? "text-primary" : "text-slate-700 group-hover:text-primary"
                                            )}
                                            title={p.name}
                                        >
                                            {p.name}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {p.sku && (
                                                <p className="text-[10px] text-slate-400">SKU: {p.sku}</p>
                                            )}
                                            {p.category?.name && (
                                                <p className="text-[10px] text-slate-300">•</p>
                                            )}
                                            {p.category?.name && (
                                                <p className="text-[10px] text-slate-400">{p.category.name}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={cn(
                                            "text-sm font-bold",
                                            isSelected ? "text-primary" : "text-primary/70"
                                        )}>
                                            ${Number(p.price).toLocaleString("es-DO")}
                                        </span>
                                        {isSelected && (
                                            <span className="block text-[10px] text-primary font-bold">✓</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
