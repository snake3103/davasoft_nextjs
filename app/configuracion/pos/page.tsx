"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Zap, 
  Save, 
  ArrowLeft, 
  Printer, 
  Layout,
  Users,
  Percent,
  Check,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useClients } from "@/hooks/useDatabase";
import { ContactSearch } from "@/components/ui/Autocomplete";
import { cn } from "@/lib/utils";

type POSType = "STANDARD" | "SPLIT";
type POSPrintFormat = "TICKET" | "HALF_LETTER" | "LETTER";

interface POSConfig {
  id?: string;
  posType: POSType;
  printFormat: POSPrintFormat;
  printCopies: number;
  autoPrint: boolean;
  showLogo: boolean;
  defaultClientId?: string;
  defaultTaxRate: number;
  taxIncluded: boolean;
  isActive: boolean;
}

export default function POSConfigPage() {
  const { data: clients } = useClients();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [config, setConfig] = useState<POSConfig>({
    posType: "STANDARD",
    printFormat: "TICKET",
    printCopies: 1,
    autoPrint: false,
    showLogo: true,
    defaultTaxRate: 18,
    taxIncluded: true,
    isActive: true,
  });

  const [selectedClientName, setSelectedClientName] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/pos/config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        if (data.defaultClientId && clients) {
          const client = clients.find((c: any) => c.id === data.defaultClientId);
          if (client) setSelectedClientName(client.name);
        }
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/pos/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        throw new Error("Error guardando configuración");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const clientsOnly = clients?.filter((c: any) => c.type === "CLIENT" || c.type === "BOTH") || [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/configuracion" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Zap className="text-primary" size={28} />
                Configuración del POS
              </h1>
              <p className="text-slate-500 text-sm">Personaliza el comportamiento y apariencia del punto de venta.</p>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700">
            <Check size={20} />
            <span className="font-medium">Configuración guardada correctamente</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Tipo de POS */}
          <div className="bg-white rounded-3xl border border-border p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Layout size={20} className="text-primary" />
              Tipo de Punto de Venta
            </h2>
            <p className="text-sm text-slate-500 mb-6">Selecciona cómo funcionará tu caja.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setConfig({ ...config, posType: "STANDARD" })}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all",
                  config.posType === "STANDARD"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    config.posType === "STANDARD" ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    <Zap size={20} />
                  </div>
                  <span className="font-bold text-slate-800">Caja Normal</span>
                </div>
                <p className="text-sm text-slate-500">Facturación y cobro en el mismo lugar.</p>
              </button>

              <button
                onClick={() => setConfig({ ...config, posType: "SPLIT" })}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all",
                  config.posType === "SPLIT"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    config.posType === "SPLIT" ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    <Layout size={20} />
                  </div>
                  <span className="font-bold text-slate-800">Facturar y Cobrar</span>
                </div>
                <p className="text-sm text-slate-500">Facturación en un lado, cobro en otro.</p>
              </button>
            </div>
          </div>

          {/* Configuración de Impresión */}
          <div className="bg-white rounded-3xl border border-border p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Printer size={20} className="text-primary" />
              Configuración de Impresión
            </h2>
            <p className="text-sm text-slate-500 mb-6">Elige el formato de ticket o factura.</p>
            
            <div className="space-y-6">
              {/* Formato de impresión */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Formato de Impresión</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "TICKET", label: "Tirilla", desc: "80mm - Receipt" },
                    { id: "HALF_LETTER", label: "Media Carta", desc: "148mm" },
                    { id: "LETTER", label: "Carta", desc: "216mm" },
                  ].map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setConfig({ ...config, printFormat: format.id as POSPrintFormat })}
                      className={cn(
                        "p-3 rounded-xl border-2 text-center transition-all",
                        config.printFormat === format.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="block font-bold text-slate-800 text-sm">{format.label}</span>
                      <span className="text-xs text-slate-500">{format.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Copias */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Copias a Imprimir</label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setConfig({ ...config, printCopies: num })}
                      className={cn(
                        "w-12 h-12 rounded-xl border-2 font-bold transition-all",
                        config.printCopies === num
                          ? "border-primary bg-primary text-white"
                          : "border-border text-slate-600 hover:border-primary/50"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opciones adicionales */}
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800">Auto-impresión</span>
                    <p className="text-sm text-slate-500">Imprimir automáticamente después de cada venta</p>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, autoPrint: !config.autoPrint })}
                    className={cn(
                      "w-12 h-7 rounded-full transition-all relative",
                      config.autoPrint ? "bg-primary" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full absolute top-1 transition-all",
                      config.autoPrint ? "left-6" : "left-1"
                    )} />
                  </button>
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800">Mostrar Logo</span>
                    <p className="text-sm text-slate-500">Incluir logo de la empresa en el ticket</p>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, showLogo: !config.showLogo })}
                    className={cn(
                      "w-12 h-7 rounded-full transition-all relative",
                      config.showLogo ? "bg-primary" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full absolute top-1 transition-all",
                      config.showLogo ? "left-6" : "left-1"
                    )} />
                  </button>
                </label>
              </div>
            </div>
          </div>

          {/* Configuración de Cliente */}
          <div className="bg-white rounded-3xl border border-border p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-primary" />
              Cliente Predeterminado
            </h2>
            <p className="text-sm text-slate-500 mb-6">Selecciona el cliente que aparecerá por defecto.</p>
            
            <div>
              <ContactSearch
                value={selectedClientName}
                contacts={clientsOnly}
                onChange={(val: string) => {
                  setSelectedClientName(val);
                  if (!val) setConfig({ ...config, defaultClientId: undefined });
                }}
                onSelect={(client: any) => {
                  setSelectedClientName(client.name);
                  setConfig({ ...config, defaultClientId: client.id });
                }}
                placeholder="Buscar cliente..."
              />
              <p className="text-xs text-slate-400 mt-2">Deja en blanco para seleccionar cliente en cada venta.</p>
            </div>
          </div>

          {/* Configuración de Impuestos */}
          <div className="bg-white rounded-3xl border border-border p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Percent size={20} className="text-primary" />
              Configuración de Impuestos
            </h2>
            <p className="text-sm text-slate-500 mb-6">Configure el IVA/tax por defecto.</p>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tasa de Impuesto (%)</label>
                  <input
                    type="number"
                    value={config.defaultTaxRate}
                    onChange={(e) => setConfig({ ...config, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                </div>
              </div>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800">Impuesto Incluido</span>
                  <p className="text-sm text-slate-500">Los precios incluyen el impuesto</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, taxIncluded: !config.taxIncluded })}
                  className={cn(
                    "w-12 h-7 rounded-full transition-all relative",
                    config.taxIncluded ? "bg-primary" : "bg-slate-300"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-1 transition-all",
                    config.taxIncluded ? "left-6" : "left-1"
                  )} />
                </button>
              </label>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Guardar Configuración
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
