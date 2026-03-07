"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArrowLeft, Shield, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { createRole } from "@/app/actions/roles";
import { MODULE_PERMISSIONS } from "@/lib/permissions";

export default function NuevoRolPage() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(createRole, null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    useEffect(() => {
        if (state?.success) {
            router.push("/configuracion/roles");
        }
    }, [state, router]);

    function togglePermission(permId: string) {
        setSelectedPermissions(prev =>
            prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
        );
    }

    function toggleModule(modulePerms: string[]) {
        const allSelected = modulePerms.every(p => selectedPermissions.includes(p));
        if (allSelected) {
            setSelectedPermissions(prev => prev.filter(p => !modulePerms.includes(p)));
        } else {
            setSelectedPermissions(prev => [...new Set([...prev, ...modulePerms])]);
        }
    }

    function toggleAll() {
        const allPerms = MODULE_PERMISSIONS.flatMap(m => m.permissions.map(p => p.id));
        if (selectedPermissions.length === allPerms.length) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions(allPerms);
        }
    }

    const allPerms = MODULE_PERMISSIONS.flatMap(m => m.permissions.map(p => p.id));

    return (
        <AppLayout>
            <div className="max-w-3xl space-y-8 pb-20">
                <div className="flex items-center space-x-4">
                    <Link href="/configuracion/roles" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Crear Nuevo Rol</h1>
                        <p className="text-slate-500 text-sm">Define un perfil de acceso personalizado para tu equipo.</p>
                    </div>
                </div>

                <form action={formAction}>
                    <input type="hidden" name="permissions" value={selectedPermissions.join(",")} />

                    {state?.error && (
                        <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold border border-rose-100/50 flex items-center mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2" />
                            {state.error}
                        </div>
                    )}

                    <div className="bg-white rounded-3xl border border-border p-8 shadow-sm space-y-6">
                        {/* Nombre y Descripción */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-1.5 block">Nombre del Rol *</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                    placeholder="Ej. Vendedor, Contador, Cajero"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-1.5 block">Descripción</label>
                                <input
                                    name="description"
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                    placeholder="Breve descripción del rol"
                                />
                            </div>
                        </div>

                        {/* Selector de todos */}
                        <div className="flex items-center justify-between pt-4 pb-2 border-t border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Permisos del Rol</h2>
                                <p className="text-xs text-slate-500 font-medium">
                                    {selectedPermissions.length} de {allPerms.length} permisos seleccionados
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={toggleAll}
                                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                            >
                                {selectedPermissions.length === allPerms.length ? "Deseleccionar Todos" : "Seleccionar Todos"}
                            </button>
                        </div>

                        {/* Matriz de Permisos por Módulo */}
                        <div className="space-y-4">
                            {MODULE_PERMISSIONS.map((mod) => {
                                const modPermIds = mod.permissions.map(p => p.id);
                                const allModSelected = modPermIds.every(p => selectedPermissions.includes(p));
                                const someModSelected = modPermIds.some(p => selectedPermissions.includes(p));

                                return (
                                    <div key={mod.module} className="border border-slate-100 rounded-2xl overflow-hidden">
                                        {/* Header del Módulo */}
                                        <div
                                            className="flex items-center justify-between px-5 py-3.5 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                                            onClick={() => toggleModule(modPermIds)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${allModSelected
                                                        ? "bg-primary border-primary"
                                                        : someModSelected
                                                            ? "bg-primary/30 border-primary/50"
                                                            : "border-slate-300"
                                                    }`}>
                                                    {(allModSelected || someModSelected) && <Check size={12} className="text-white" />}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-sm text-slate-800">{mod.module}</span>
                                                    <span className="text-xs text-slate-500 ml-2 hidden sm:inline">{mod.description}</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                                                {modPermIds.filter(p => selectedPermissions.includes(p)).length}/{modPermIds.length}
                                            </span>
                                        </div>
                                        {/* Lista de permisos individuales */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y divide-slate-100">
                                            {mod.permissions.map((perm) => {
                                                const isChecked = selectedPermissions.includes(perm.id);
                                                return (
                                                    <label
                                                        key={perm.id}
                                                        className="flex items-center space-x-2.5 px-4 py-3 hover:bg-primary/5 cursor-pointer transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => togglePermission(perm.id)}
                                                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                                                        />
                                                        <span className={`text-xs font-medium ${isChecked ? "text-slate-800" : "text-slate-500"}`}>
                                                            {perm.label}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Botón de Guardar */}
                    <div className="flex items-center justify-between mt-8">
                        <Link href="/configuracion/roles" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm flex items-center shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Shield size={16} className="mr-2" />
                                    Crear Rol
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
