"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, CreditCard, Building2, ChevronDown, Package } from "lucide-react";
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
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setQuery(value); }, [value]);

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
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
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
                            filtered.map((c: any) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onMouseDown={() => {
                                        setQuery(c.name);
                                        onSelect(c);
                                        setOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-4 group"
                                >
                                    <div className="w-11 h-11 bg-white border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:border-primary/20 group-hover:text-primary transition-colors">
                                        <User size={22} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-700 truncate group-hover:text-primary transition-colors">{c.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <CreditCard size={12} className="text-slate-300" />
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{c.idNumber || "Sin NIT / CC"}</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <span className={cn(
                                            "text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-tighter border",
                                            c.type === "CLIENT" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                c.type === "PROVIDER" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                    "bg-purple-50 text-purple-600 border-purple-100"
                                        )}>
                                            {c.type === "CLIENT" ? "Cliente" : c.type === "PROVIDER" ? "Prov" : "Ambos"}
                                        </span>
                                    </div>
                                </button>
                            ))
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
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setQuery(value); }, [value]);

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
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
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
                            filtered.map((c: any) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onMouseDown={() => {
                                        setQuery(c.name);
                                        onSelect(c);
                                        setOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-3 group"
                                >
                                    <div className="w-9 h-9 bg-white border border-slate-100 text-slate-400 rounded-xl flex items-center justify-center shrink-0 group-hover:text-primary transition-colors">
                                        <Building2 size={18} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-700 truncate group-hover:text-primary transition-colors">{c.name}</p>
                                    </div>
                                </button>
                            ))
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
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setQuery(value); }, [value]);

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
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={handleOpen}
                    className={cn(
                        "w-full bg-white border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all",
                        error && "border-rose-400 bg-rose-50"
                    )}
                />
            </div>
            {open && (
                <div
                    style={dropdownStyle}
                    className="bg-white border border-border rounded-xl shadow-2xl max-h-56 overflow-y-auto z-[9999]"
                >
                    {filtered.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-slate-400 italic text-center">Sin resultados</div>
                    ) : (
                        filtered.map((p: any) => (
                            <button
                                key={p.id}
                                type="button"
                                onMouseDown={() => {
                                    setQuery(p.name);
                                    onSelect({ name: p.name, price: Number(p.price), id: p.id });
                                    setOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors flex items-center gap-3 group"
                            >
                                <div className="w-7 h-7 bg-blue-50 text-primary rounded-lg flex items-center justify-center shrink-0">
                                    <Package size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">{p.name}</p>
                                    {p.sku && <p className="text-[10px] text-slate-400">SKU: {p.sku}</p>}
                                </div>
                                <span className="text-sm font-bold text-primary shrink-0">
                                    ${Number(p.price).toLocaleString("es-CO")}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
