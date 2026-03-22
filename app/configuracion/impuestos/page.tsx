"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Plus, ShieldCheck, Edit, Trash, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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

export default function ImpuestosConfigPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal de eliminación
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; tax: Tax | null }>({ open: false, tax: null });

  // Cargar impuestos
  const loadTaxes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/taxes");
      if (res.ok) {
        const data = await res.json();
        setTaxes(data);
      }
    } catch (err) {
      console.error("Error loading taxes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxes();
  }, []);

  // Eliminar
  const handleDeleteClick = (tax: Tax) => {
    setDeleteModal({ open: true, tax });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.tax) return;
    try {
      const res = await fetch(`/api/taxes/${deleteModal.tax.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("success", "Impuesto eliminado exitosamente");
        setDeleteModal({ open: false, tax: null });
        loadTaxes();
      } else {
        const data = await res.json();
        showToast("error", data.error || "Error al eliminar");
      }
    } catch (err) {
      showToast("error", "Error de conexión");
    }
  };

  // Alternar activo/inactivo
  const handleToggleActive = async (tax: Tax) => {
    try {
      const res = await fetch(`/api/taxes/${tax.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !tax.isActive }),
      });

      if (res.ok) {
        loadTaxes();
      }
    } catch (err) {
      showToast("error", "Error al cambiar estado");
    }
  };

  // Establecer como default
  const handleSetDefault = async (tax: Tax) => {
    try {
      const res = await fetch(`/api/taxes/${tax.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (res.ok) {
        showToast("success", `"${tax.name}" establecido como impuesto por defecto`);
        loadTaxes();
      }
    } catch (err) {
      showToast("error", "Error al establecer default");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/configuracion" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">Impuestos</h1>
            <p className="text-slate-500 text-sm">Configura los impuestos y retenciones aplicables a tus facturas.</p>
          </div>
          <Link href="/configuracion/impuestos/nuevo">
            <Button>
              <Plus size={18} className="mr-2" />
              Nuevo Impuesto
            </Button>
          </Link>
        </div>

        {/* Lista de impuestos */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            Cargando...
          </div>
        ) : taxes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border p-12 text-center">
            <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No hay impuestos configurados</h3>
            <p className="text-slate-500 mt-2 mb-4">Crea tu primer impuesto para comenzar.</p>
            <Link href="/configuracion/impuestos/nuevo">
              <Button>
                <Plus size={18} className="mr-2" />
                Crear Impuesto
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {taxes.map((tax) => (
              <div
                key={tax.id}
                className={cn(
                  "bg-white rounded-3xl border p-6 shadow-sm transition-all group",
                  tax.isActive ? "hover:shadow-md" : "opacity-60 border-dashed"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center",
                    tax.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                  )}>
                    <ShieldCheck size={24} />
                  </div>
                  <div className="flex space-x-1">
                    <Link
                      href={`/configuracion/impuestos/${tax.id}/editar`}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(tax)}
                      className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-slate-800 text-lg">{tax.name}</h3>
                  {tax.isDefault && (
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      DEFAULT
                    </span>
                  )}
                </div>
                {tax.shortName && (
                  <p className="text-xs text-slate-400">{tax.shortName}</p>
                )}

                <div className="mt-6 flex items-baseline justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Valor</p>
                    <p className="text-3xl font-black text-slate-900">
                      {tax.type === "PERCENTAGE" ? `${tax.value}%` : formatMoney(tax.value)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleToggleActive(tax)}
                      className={cn(
                        "text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-tighter transition-colors",
                        tax.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {tax.isActive ? "Activo" : "Inactivo"}
                    </button>
                    {!tax.isDefault && tax.isActive && (
                      <button
                        onClick={() => handleSetDefault(tax)}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Marcar como default
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 flex items-start space-x-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-md shadow-blue-200">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-blue-900">¿Necesitas ayuda con los impuestos?</h4>
            <p className="text-sm text-blue-700 mt-2 leading-relaxed">
              Las normativas tributarias pueden variar según tu región. Te recomendamos consultar con un profesional contable para asegurar que tus configuraciones de impuestos cumplan con los requisitos legales vigentes.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        title="Eliminar Impuesto"
        description={`¿Estás seguro de que deseas eliminar el impuesto "${deleteModal.tax?.name}"?`}
        confirmText="Eliminar"
        onConfirm={handleConfirmDelete}
      />
    </AppLayout>
  );
}
