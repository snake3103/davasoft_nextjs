"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useClients } from "@/hooks/useDatabase";
import { useCreateVehicle } from "@/hooks/useDatabase";
import { ArrowLeft, Save } from "lucide-react";
import { vehicleBrands, vehicleColors, getModelsForBrand } from "@/lib/vehicle-catalog";

export default function NewVehiclePage() {
  const router = useRouter();
  const { data: clients = [] } = useClients();
  const createVehicle = useCreateVehicle();

  const [formData, setFormData] = useState({
    clientId: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    plates: "",
    vin: "",
    mileage: "0",
    cameWithTow: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableModels = useMemo(() => {
    return getModelsForBrand(formData.brand);
  }, [formData.brand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const brandLabel = vehicleBrands.find(b => b.value === formData.brand)?.label || formData.brand;
      const modelLabel = availableModels.find(m => m.value === formData.model)?.label || formData.model;
      const colorLabel = vehicleColors.find(c => c.value === formData.color)?.label || formData.color;

      await createVehicle.mutateAsync({
        clientId: formData.clientId,
        brand: brandLabel,
        model: modelLabel,
        year: formData.year ? parseInt(formData.year) : undefined,
        color: colorLabel || null,
        plates: formData.plates || null,
        vin: formData.vin || null,
        mileage: parseInt(formData.mileage) || 0,
        cameWithTow: formData.cameWithTow,
      });
      router.push("/vehiculos");
    } catch (error: any) {
      alert("Error al crear: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Nuevo Vehículo</h1>
            <p className="text-slate-500">Registrar un nuevo vehículo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cliente *
            </label>
            <select
              required
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((client: any) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Marca *
              </label>
              <select
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: "" })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Seleccionar marca</option>
                {vehicleBrands.map((brand) => (
                  <option key={brand.value} value={brand.value}>
                    {brand.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Modelo *
              </label>
              <select
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                disabled={!formData.brand}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-100"
              >
                <option value="">Seleccionar modelo</option>
                {availableModels.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Año
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Seleccionar año</option>
                {Array.from({ length: 30 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Color
              </label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Seleccionar color</option>
                {vehicleColors.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Kilometraje
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Placas
              </label>
              <input
                type="text"
                placeholder="ABC-123"
                value={formData.plates}
                onChange={(e) => setFormData({ ...formData, plates: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                VIN (Número de serie)
              </label>
              <input
                type="text"
                placeholder="1HGBH41JXMN109186"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cameWithTow"
              checked={formData.cameWithTow}
              onChange={(e) => setFormData({ ...formData, cameWithTow: e.target.checked })}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <label htmlFor="cameWithTow" className="text-sm text-slate-700">
              Vino en grúa
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-border rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}