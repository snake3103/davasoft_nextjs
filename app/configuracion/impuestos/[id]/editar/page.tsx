"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ShieldCheck, Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { cn, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Select } from "@/components/ui/Select";

interface Tax {
  id: string;
  name: string;
  shortName: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
}

export default function EditarImpuestoPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    value: 18,
    description: "",
    isDefault: false,
    isActive: true,
  });

  // Cargar datos del impuesto
  useEffect(() => {
    const loadTax = async () => {
      try {
        const res = await fetch(`/api/taxes/${params.id}`);
        if (res.ok) {
          const tax: Tax = await res.json();
          setFormData({
            name: tax.name,
            shortName: tax.shortName || "",
            type: tax.type,
            value: tax.value,
            description: tax.description || "",
            isDefault: tax.isDefault,
            isActive: tax.isActive,
          });
        } else {
          showToast("error", "Impuesto no encontrado");
          router.push("/configuracion/impuestos");
        }
      } catch (err) {
        console.error("Error loading tax:", err);
        showToast("error", "Error al cargar el impuesto");
      } finally {
        setLoading(false);
      }
    };

    loadTax();
  }, [params.id, router, showToast]);

  // Guardar cambios
  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("El nombre del impuesto es requerido");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/taxes/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast("success", "Impuesto actualizado exitosamente");
        router.push("/configuracion/impuestos");
      } else {
        const data = await res.json();
        setError(data.error || "Error al guardar");
        showToast("error", data.error || "Error al guardar");
      }
    } catch (err) {
      setError("Error de conexión");
      showToast("error", "Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/configuracion/impuestos" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">Editar Impuesto</h1>
            <p className="text-slate-500 text-sm">Modifica los datos del impuesto.</p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          {/* Preview Card */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-8 py-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-white">
                <ShieldCheck size={28} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-xl">
                  {formData.name || "Nombre del impuesto"}
                </p>
                {formData.shortName && (
                  <p className="text-sm text-slate-500">{formData.shortName}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-primary">
                  {formData.type === "PERCENTAGE" 
                    ? `${formData.value}%` 
                    : formatMoney(formData.value)
                  }
                </p>
                <p className="text-sm text-slate-500">
                  {formData.type === "PERCENTAGE" ? "Porcentaje" : "Monto fijo"}
                </p>
              </div>
            </div>
            {formData.isDefault && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold bg-primary text-white px-3 py-1 rounded-full">
                  IMPUESTO POR DEFECTO
                </span>
              </div>
            )}
          </div>

          {/* Campos */}
          <div className="p-8 space-y-6">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm flex items-center gap-2">
                <span className="text-rose-500">⚠</span>
                {error}
              </div>
            )}

            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Nombre del impuesto *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: ITBIS 18%"
                className="w-full"
                required
              />
              <p className="text-xs text-slate-400">
                Nombre que aparecerá en facturas y documentos
              </p>
            </div>

            {/* Nombre corto */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Nombre corto
              </label>
              <Input
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                placeholder="Ej: ITBIS"
                className="w-full"
              />
            </div>

            {/* Tipo y Valor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Tipo de impuesto
                </label>
                <Select
                  value={formData.type}
                  onChange={(val) => setFormData({ ...formData, type: val as "PERCENTAGE" | "FIXED" })}
                  options={[
                    { value: "PERCENTAGE", label: "% Porcentaje", description: "Se calcula como porcentaje del monto" },
                    { value: "FIXED", label: "$ Monto fijo", description: "Es un valor fijo independientemente del monto" },
                  ]}
                  placeholder="Seleccionar tipo..."
                />
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Valor {formData.type === "PERCENTAGE" ? "(%)" : "($)"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                    {formData.type === "PERCENTAGE" ? "%" : "$"}
                  </span>
                  <Input
                    type="number"
                    step={formData.type === "PERCENTAGE" ? "0.01" : "0.01"}
                    min={0}
                    max={formData.type === "PERCENTAGE" ? 100 : undefined}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 text-lg font-semibold"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional para referencia interna..."
                className="w-full px-4 py-3 border border-border rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                rows={3}
              />
            </div>

            {/* Opciones */}
            <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opciones</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Default Toggle */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Impuesto por defecto</p>
                    <p className="text-xs text-slate-400">Se aplicará automáticamente en nuevas facturas</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                    className={cn(
                      "relative w-12 h-7 rounded-full transition-colors duration-200",
                      formData.isDefault ? "bg-primary" : "bg-slate-300"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                        formData.isDefault ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Impuesto activo</p>
                    <p className="text-xs text-slate-400">Los impuestos inactivos no se muestran en facturas</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={cn(
                      "relative w-12 h-7 rounded-full transition-colors duration-200",
                      formData.isActive ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                        formData.isActive ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
              <Link href="/configuracion/impuestos">
                <Button variant="outline" className="px-8">
                  Cancelar
                </Button>
              </Link>
              <Button onClick={handleSave} disabled={saving} className="px-8">
                {saving ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Actualizar Impuesto
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
