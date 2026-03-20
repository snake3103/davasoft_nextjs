"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useClients, useVehicles, useCreateWorkOrder } from "@/hooks/useDatabase";
import { ArrowLeft, Save, Plus, Trash2, Car, CheckCircle2, Circle } from "lucide-react";

interface WorkItem {
  description: string;
  cost: number;
  completed: boolean;
}

interface ChecklistItem {
  id: string;
  label: string;
}

const VERIFICATION_CHECKLIST: ChecklistItem[] = [
  { id: "lights", label: "Luces" },
  { id: "tires", label: "Llantas" },
  { id: "plates", label: "Placas" },
  { id: "mirrors", label: "Espejos" },
  { id: "windshield", label: "Parabrisas" },
  { id: "windows", label: "Vidrios" },
  { id: "radio", label: "Radio" },
  { id: "extinguisher", label: "Extintor" },
  { id: "triangles", label: "Triángulos" },
  { id: "jack", label: "Gato" },
  { id: "tools", label: "Herramientas" },
  { id: "spareTire", label: "Rueda de repuesto" },
];

const PRE_EXISTING_DAMAGE: ChecklistItem[] = [
  { id: "bumperFront", label: "Parachoque Delantero" },
  { id: "bumperRear", label: "Parachoque Trasero" },
  { id: "hood", label: "Capó" },
  { id: "trunk", label: "Baúl" },
  { id: "roof", label: "Techo" },
  { id: "doorLeft", label: "Puerta Izquierda" },
  { id: "doorRight", label: "Puerta Derecha" },
  { id: "fenderLeft", label: "Guardabarros Izquierdo" },
  { id: "fenderRight", label: "Guardabarros Derecho" },
  { id: "windshieldFront", label: "Parabrisas Delantero" },
  { id: "windshieldRear", label: "Parabrisas Trasero" },
  { id: "mirrorLeft", label: "Espejo Izquierdo" },
  { id: "mirrorRight", label: "Espejo Derecho" },
  { id: "headlightLeft", label: "Faro Izquierdo" },
  { id: "headlightRight", label: "Faro Derecho" },
  { id: "taillightLeft", label: "Stop Izquierdo" },
  { id: "taillightRight", label: "Stop Derecho" },
];

export default function NewWorkOrderPage() {
  const router = useRouter();
  const { data: clients = [] } = useClients();
  const { data: vehicles = [] } = useVehicles();
  const createWorkOrder = useCreateWorkOrder();

const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [formData, setFormData] = useState({
    fuelLevel: 50,
    cameWithTow: false,
    description: "",
    notes: "",
    inventory: {
      odometro: true,
      radio: true,
      ruedaRepuesto: true,
      gato: true,
      herramientas: false,
      documentos: true,
    },
    verificationChecklist: {} as Record<string, boolean>,
    preExistingDamage: {} as Record<string, boolean>,
  });

  const inventoryLabels: Record<string, string> = {
    odometro: "Odómetro",
    radio: "Radio",
    ruedaRepuesto: "Rueda de Repuesto",
    gato: "Gato",
    herramientas: "Herramientas",
    documentos: "Documentos",
  };
  
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientVehicles = vehicles.filter((v: any) => v.clientId === selectedClientId);

  const addWorkItem = () => {
    setWorkItems([...workItems, { description: "", cost: 0, completed: false }]);
  };

  const removeWorkItem = (index: number) => {
    setWorkItems(workItems.filter((_, i) => i !== index));
  };

  const updateWorkItem = (index: number, field: keyof WorkItem, value: any) => {
    const updated = [...workItems];
    updated[index] = { ...updated[index], [field]: value };
    setWorkItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClientId || !selectedVehicleId) {
      alert("Selecciona un cliente y un vehículo");
      return;
    }

    setIsSubmitting(true);

    try {
      await createWorkOrder.mutateAsync({
        clientId: selectedClientId,
        vehicleId: selectedVehicleId,
        fuelLevel: formData.fuelLevel,
        cameWithTow: formData.cameWithTow,
        description: formData.description || null,
        notes: formData.notes || null,
        workItems: workItems.filter(w => w.description),
        inventory: { ...formData.inventory, ...formData.verificationChecklist },
        preExistingDamage: formData.preExistingDamage,
      });
      router.push("/ordenes-servicio");
    } catch (error: any) {
      alert("Error al crear: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Nueva Orden de Servicio</h1>
            <p className="text-slate-500">Recepción de vehículo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Car className="w-5 h-5" />
              Datos del Cliente y Vehículo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cliente *
                </label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    setSelectedVehicleId("");
                  }}
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vehículo *
                </label>
                <select
                  required
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  disabled={!selectedClientId}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-100"
                >
                  <option value="">Seleccionar vehículo</option>
                  {clientVehicles.map((vehicle: any) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} {vehicle.plates ? `(${vehicle.plates})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-lg font-semibold text-slate-800">
              Estado del Vehículo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nivel de Gasolina
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.fuelLevel}
                    onChange={(e) => setFormData({ ...formData, fuelLevel: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-slate-700 w-12">
                    {formData.fuelLevel}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-6">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Inventario del Vehículo
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(formData.inventory).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setFormData({
                        ...formData,
                        inventory: { ...formData.inventory, [key]: e.target.checked }
                      })}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700">
                      {inventoryLabels[key] || key}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Verificación de Estado del Vehículo
            </h2>
            <p className="text-sm text-slate-500">
              Marque los elementos que están en buen estado al recibir el vehículo
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {VERIFICATION_CHECKLIST.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.verificationChecklist[item.id]
                      ? "bg-green-50 border-green-300"
                      : "bg-slate-50 border-border hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.verificationChecklist[item.id] || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      verificationChecklist: { ...formData.verificationChecklist, [item.id]: e.target.checked }
                    })}
                    className="w-4 h-4 text-green-600 border-border rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-slate-700 font-medium">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Circle className="w-5 h-5" />
              Daños Preexistentes
            </h2>
            <p className="text-sm text-slate-500">
              Marque los elementos que presentan daños o rayones
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRE_EXISTING_DAMAGE.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.preExistingDamage[item.id]
                      ? "bg-red-50 border-red-300"
                      : "bg-slate-50 border-border hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.preExistingDamage[item.id] || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      preExistingDamage: { ...formData.preExistingDamage, [item.id]: e.target.checked }
                    })}
                    className="w-4 h-4 text-red-600 border-border rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-slate-700 font-medium">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Trabajos a Realizar
              </h2>
              <button
                type="button"
                onClick={addWorkItem}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>

            {workItems.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No hay trabajos agregados. Haz clic en "Agregar" para añadir.
              </p>
            ) : (
              <div className="space-y-3">
                {workItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Descripción del trabajo"
                      value={item.description}
                      onChange={(e) => updateWorkItem(index, "description", e.target.value)}
                      className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Costo"
                      value={item.cost}
                      onChange={(e) => updateWorkItem(index, "cost", parseFloat(e.target.value) || 0)}
                      className="w-24 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeWorkItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción General
              </label>
              <textarea
                rows={3}
                placeholder="Describe el trabajo a realizar..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                rows={2}
                placeholder="Observaciones adicionales..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
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
              {isSubmitting ? "Guardando..." : "Crear Orden"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}