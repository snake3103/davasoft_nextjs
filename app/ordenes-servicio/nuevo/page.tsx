"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AppLayout } from "@/components/layout/AppLayout";
import { useClients, useCreateWorkOrder, useWorkOrders } from "@/hooks/useDatabase";
import { 
    ArrowLeft, Save, Plus, Trash2, Car, User, Phone, Mail, 
    Calendar, MapPin, Package, AlertTriangle, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkItem {
    description: string;
    cost: number;
    completed: boolean;
}

interface InventoryItem {
    id: string;
    label: string;
}

const INVENTORY_ITEMS: InventoryItem[] = [
    { id: "espejos", label: "Espejos" },
    { id: "faroDelantero", label: "Faro Delantero" },
    { id: "asientos", label: "Asientos" },
    { id: "bateria", label: "Batería" },
    { id: "gato", label: "Gato / Herramientas" },
    { id: "antena", label: "Antena" },
    { id: "radio", label: "Radio / CD" },
    { id: "repuestoGoma", label: "Rueda de Repuesto" },
    { id: "encendedor", label: "Encendedor" },
    { id: "alfombras", label: "Alfombras" },
    { id: "tapabocinas", label: "Tapabocinas" },
    { id: "botiquin", label: "Botiquín" },
];

const DAMAGE_AREAS = [
    { id: "frente", label: "Frente" },
    { id: "atras", label: "Detrás" },
    { id: "ladoDer", label: "Lado Der." },
    { id: "ladoIzq", label: "Lado Izq." },
];

export default function NewWorkOrderPage() {
    const router = useRouter();
    const { data: clients = [] } = useClients();
    const { data: workOrders = [] } = useWorkOrders();
    const createWorkOrder = useCreateWorkOrder();

    // Calcular siguiente folio (solo para la empresa actual - ya filtrado en la API)
    const nextFolio = (() => {
        if (!workOrders || !Array.isArray(workOrders) || workOrders.length === 0) {
            return "0001";
        }
        const numbers = workOrders
            .map((o: any) => {
                const num = parseInt(o?.number?.replace(/\D/g, "") || "0", 10);
                return isNaN(num) ? 0 : num;
            })
            .filter((n: number) => n > 0);
        
        if (numbers.length === 0) return "0001";
        return String(Math.max(...numbers) + 1).padStart(4, "0");
    })();

    const [formData, setFormData] = useState({
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        vehicleBrand: "",
        vehicleModel: "",
        vehicleColor: "",
        vehiclePlates: "",
        entryDate: new Date().toISOString().split("T")[0],
        exitDate: "",
        notes: "",
        fuelLevel: 50,
    });

    const [workItems, setWorkItems] = useState<WorkItem[]>([]);
    const [inventory, setInventory] = useState<Record<string, boolean>>(
        Object.fromEntries(INVENTORY_ITEMS.map(item => [item.id, false]))
    );
    const [damageAreas, setDamageAreas] = useState<Record<string, boolean>>(
        Object.fromEntries(DAMAGE_AREAS.map(area => [area.id, false]))
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const toggleInventory = (id: string) => {
        setInventory(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleDamage = (id: string) => {
        setDamageAreas(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.clientName) {
            alert("Ingresa el nombre del cliente");
            return;
        }

        setIsSubmitting(true);

        try {
            let clientId: string;
            const existingClient = clients.find((c: any) =>
                c.name.toLowerCase() === formData.clientName.toLowerCase()
            );

            if (existingClient) {
                clientId = existingClient.id;
            } else {
                alert("Cliente no encontrado. Por favor crea el cliente primero.");
                setIsSubmitting(false);
                return;
            }

            await createWorkOrder.mutateAsync({
                clientId,
                fuelLevel: formData.fuelLevel,
                description: "",
                notes: formData.notes || null,
                workItems: workItems.filter(w => w.description),
                inventory,
                preExistingDamage: damageAreas,
                vehicleData: {
                    brand: formData.vehicleBrand,
                    model: formData.vehicleModel,
                    color: formData.vehicleColor,
                    plates: formData.vehiclePlates,
                },
            });

            router.push("/ordenes-servicio");
        } catch (error: any) {
            alert("Error al crear: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalAmount = workItems.reduce((sum, item) => sum + (item.cost || 0), 0);

    return (
        <AppLayout>
            <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Nueva Orden de Servicio</h1>
                            <p className="text-sm text-slate-500">Recepción de vehículo - Folio #{nextFolio}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 flex items-center disabled:opacity-50 hover:opacity-90 transition-all"
                        >
                            {isSubmitting ? (
                                <Loader2 size={18} className="mr-2 animate-spin" />
                            ) : (
                                <Save size={18} className="mr-2" />
                            )}
                            {isSubmitting ? "Guardando..." : "Guardar Orden"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vehicle & Client Info */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Vehicle Data */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <Car size={20} className="text-primary" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800">Datos del Vehículo</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marca</label>
                                                <input
                                                    type="text"
                                                    value={formData.vehicleBrand}
                                                    onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })}
                                                    placeholder="Toyota"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modelo</label>
                                                <input
                                                    type="text"
                                                    value={formData.vehicleModel}
                                                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                                                    placeholder="Corolla"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Color</label>
                                                <input
                                                    type="text"
                                                    value={formData.vehicleColor}
                                                    onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                                                    placeholder="Rojo"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Placa</label>
                                                <input
                                                    type="text"
                                                    value={formData.vehiclePlates}
                                                    onChange={(e) => setFormData({ ...formData, vehiclePlates: e.target.value })}
                                                    placeholder="G-123456"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Ingreso</label>
                                                <div className="relative">
                                                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="date"
                                                        value={formData.entryDate}
                                                        onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Salida</label>
                                                <div className="relative">
                                                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="date"
                                                        value={formData.exitDate}
                                                        onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Client Data */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <User size={20} className="text-primary" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800">Datos del Cliente</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre *</label>
                                            <div className="relative">
                                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={formData.clientName}
                                                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                                    placeholder="Nombre completo"
                                                    required
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</label>
                                            <div className="relative">
                                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    value={formData.clientPhone}
                                                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                                                    placeholder="(809) 123-4567"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correo</label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="email"
                                                    value={formData.clientEmail}
                                                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                                                    placeholder="cliente@correo.com"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Work Items Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Package size={20} className="text-primary" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-800">Trabajos a Realizar</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={addWorkItem}
                                    className="px-4 py-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Plus size={14} />
                                    Agregar
                                </button>
                            </div>

                            {workItems.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Package size={24} className="text-slate-300" />
                                    </div>
                                    <p className="text-sm text-slate-500">No hay trabajos agregados</p>
                                    <p className="text-xs text-slate-400 mt-1">Haz clic en "Agregar" para añadir trabajos</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-12">#</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Costo</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Importe</th>
                                                <th className="px-6 py-3 w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {workItems.map((item, index) => (
                                                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-3 text-sm text-slate-400 font-medium">{index + 1}</td>
                                                    <td className="px-6 py-3">
                                                        <input
                                                            type="text"
                                                            value={item.description}
                                                            onChange={(e) => updateWorkItem(index, "description", e.target.value)}
                                                            placeholder="Descripción del trabajo..."
                                                            className="w-full bg-transparent border-0 text-sm outline-none focus:ring-0 p-0"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <input
                                                            type="number"
                                                            value={item.cost || ""}
                                                            onChange={(e) => updateWorkItem(index, "cost", parseFloat(e.target.value) || 0)}
                                                            placeholder="0.00"
                                                            className="w-full bg-transparent border-0 text-sm outline-none focus:ring-0 p-0 text-right font-medium"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-3 text-sm font-bold text-slate-800 text-right">
                                                        ${(item.cost || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeWorkItem(index)}
                                                            className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50">
                                            <tr>
                                                <td colSpan={3} className="px-6 py-4 text-right">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total General</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-lg font-bold text-primary">${totalAmount.toFixed(2)}</span>
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Observations */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <label className="text-sm font-bold text-slate-700 mb-3 block">Observaciones</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Ingrese notas adicionales aquí..."
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Fuel Gauge */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 block">Nivel de Combustible</label>
                            
                            {/* Fuel Gauge Visual */}
                            <div className="relative flex flex-col items-center">
                                {/* Fuel Icon and Gauge */}
                                <div className="relative w-full flex justify-center mb-4">
                                    {/* Fuel Pump Icon */}
                                    <div className="relative">
                                        <svg width="80" height="100" viewBox="0 0 80 100" fill="none" className="drop-shadow-sm">
                                            {/* Pump Body */}
                                            <rect x="20" y="25" width="40" height="65" rx="4" fill={formData.fuelLevel > 0 ? "#10B981" : "#E5E7EB"} className="transition-all duration-300"/>
                                            <rect x="25" y="30" width="30" height="40" rx="2" fill={formData.fuelLevel > 25 ? "#059669" : "#F3F4F6"} className="transition-all duration-300"/>
                                            {/* Pump Top */}
                                            <rect x="15" y="15" width="50" height="15" rx="3" fill={formData.fuelLevel > 0 ? "#059669" : "#D1D5DB"}/>
                                            {/* Display */}
                                            <rect x="28" y="35" width="24" height="12" rx="1" fill="#1F2937"/>
                                            <text x="40" y="44" textAnchor="middle" fill="#10B981" fontSize="8" fontWeight="bold" fontFamily="monospace">
                                                {formData.fuelLevel}%
                                            </text>
                                            {/* Nozzle */}
                                            <rect x="60" y="35" width="15" height="8" rx="2" fill="#6B7280"/>
                                            <rect x="75" y="33" width="3" height="12" rx="1" fill="#4B5563"/>
                                            {/* Hose */}
                                            <path d="M 62 39 Q 70 50 65 65" stroke="#6B7280" strokeWidth="4" fill="none" strokeLinecap="round"/>
                                            {/* Fill indicator on side */}
                                            <rect x="10" y="30" width="6" height="55" rx="2" fill="#F3F4F6"/>
                                            <rect 
                                                x="10" 
                                                y={85 - (55 * formData.fuelLevel / 100)} 
                                                width="6" 
                                                height={55 * formData.fuelLevel / 100} 
                                                rx="2" 
                                                fill={formData.fuelLevel > 50 ? "#10B981" : formData.fuelLevel > 25 ? "#F59E0B" : "#EF4444"}
                                                className="transition-all duration-500"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                {/* Level Labels */}
                                <div className="w-full flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    <span>E</span>
                                    <span>½</span>
                                    <span>F</span>
                                </div>

                                {/* Gauge Bar */}
                                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden relative mb-3">
                                    <div 
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            formData.fuelLevel > 50 ? "bg-gradient-to-r from-green-400 to-green-500" :
                                            formData.fuelLevel > 25 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                                            "bg-gradient-to-r from-red-400 to-red-500"
                                        )}
                                        style={{ width: `${formData.fuelLevel}%` }}
                                    />
                                    {/* Tick marks */}
                                    <div className="absolute inset-0 flex justify-between px-1">
                                        <div className="w-px h-full bg-white/50" />
                                        <div className="w-px h-full bg-white/50" />
                                        <div className="w-px h-full bg-white/50" />
                                    </div>
                                </div>

                                {/* Slider */}
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={formData.fuelLevel}
                                    onChange={(e) => setFormData({ ...formData, fuelLevel: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-primary"
                                />

                                {/* Quick Select Buttons */}
                                <div className="flex gap-2 mt-4 w-full">
                                    {[0, 25, 50, 75, 100].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, fuelLevel: level })}
                                            className={cn(
                                                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                                formData.fuelLevel === level
                                                    ? "bg-primary text-white shadow-md"
                                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                            )}
                                        >
                                            {level === 0 ? "E" : level === 100 ? "F" : `${level}%`}
                                        </button>
                                    ))}
                                </div>

                                {/* Fuel Status Text */}
                                <p className={cn(
                                    "mt-3 text-xs font-bold uppercase tracking-wider",
                                    formData.fuelLevel > 50 ? "text-green-600" :
                                    formData.fuelLevel > 25 ? "text-amber-600" :
                                    "text-red-600"
                                )}>
                                    {formData.fuelLevel === 0 ? "Vacío" :
                                     formData.fuelLevel <= 25 ? "Muy Bajo" :
                                     formData.fuelLevel <= 50 ? "Mitad" :
                                     formData.fuelLevel <= 75 ? "Bueno" : "Lleno"}
                                </p>
                            </div>
                        </div>

                        {/* Inventory Checklist */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Inventario del Vehículo</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {INVENTORY_ITEMS.map((item) => (
                                    <label 
                                        key={item.id} 
                                        className={cn(
                                            "flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all text-xs font-medium",
                                            inventory[item.id]
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={inventory[item.id]}
                                            onChange={() => toggleInventory(item.id)}
                                            className="sr-only"
                                        />
                                        <span className={cn(
                                            "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                                            inventory[item.id]
                                                ? "bg-primary border-primary"
                                                : "border-slate-300"
                                        )}>
                                            {inventory[item.id] && (
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        {item.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Damage Map */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle size={16} className="text-amber-500" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Daños Preexistentes</h3>
                            </div>
                            
                            {/* Vehicle Views Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Frente */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => toggleDamage("frente")}
                                        className={cn(
                                            "w-full aspect-square rounded-xl transition-all relative overflow-hidden flex items-center justify-center",
                                            damageAreas.frente
                                                ? "ring-2 ring-rose-400 ring-offset-2"
                                                : "hover:ring-2 hover:ring-slate-300 hover:ring-offset-2"
                                        )}
                                    >
                                        <Image
                                            src="/images/vehiculos/autoFrontal.png"
                                            alt="Vista frontal del vehículo"
                                            fill
                                            className="object-contain"
                                        />
                                        {damageAreas.frente && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center animate-pulse z-10">
                                                <span className="text-white text-xs font-bold">!</span>
                                            </div>
                                        )}
                                    </button>
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded-full text-slate-500 shadow-sm">
                                        Frente
                                    </span>
                                </div>

                                {/* Detrás */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => toggleDamage("atras")}
                                        className={cn(
                                            "w-full aspect-square rounded-xl transition-all relative overflow-hidden flex items-center justify-center",
                                            damageAreas.atras
                                                ? "ring-2 ring-rose-400 ring-offset-2"
                                                : "hover:ring-2 hover:ring-slate-300 hover:ring-offset-2"
                                        )}
                                    >
                                        <Image
                                            src="/images/vehiculos/autoTrasera.png"
                                            alt="Vista trasera del vehículo"
                                            fill
                                            className="object-contain"
                                        />
                                        {damageAreas.atras && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center animate-pulse z-10">
                                                <span className="text-white text-xs font-bold">!</span>
                                            </div>
                                        )}
                                    </button>
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded-full text-slate-500 shadow-sm">
                                        Detrás
                                    </span>
                                </div>

                                {/* Lado Derecho */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => toggleDamage("ladoDer")}
                                        className={cn(
                                            "w-full aspect-square rounded-xl transition-all relative overflow-hidden flex items-center justify-center",
                                            damageAreas.ladoDer
                                                ? "ring-2 ring-rose-400 ring-offset-2"
                                                : "hover:ring-2 hover:ring-slate-300 hover:ring-offset-2"
                                        )}
                                    >
                                        <Image
                                            src="/images/vehiculos/autoDerecho.png"
                                            alt="Vista lado derecho del vehículo"
                                            fill
                                            className="object-contain"
                                        />
                                        {damageAreas.ladoDer && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center animate-pulse z-10">
                                                <span className="text-white text-xs font-bold">!</span>
                                            </div>
                                        )}
                                    </button>
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded-full text-slate-500 shadow-sm">
                                        Lado Der.
                                    </span>
                                </div>

                                {/* Lado Izquierdo */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => toggleDamage("ladoIzq")}
                                        className={cn(
                                            "w-full aspect-square rounded-xl transition-all relative overflow-hidden flex items-center justify-center",
                                            damageAreas.ladoIzq
                                                ? "ring-2 ring-rose-400 ring-offset-2"
                                                : "hover:ring-2 hover:ring-slate-300 hover:ring-offset-2"
                                        )}
                                    >
                                        <Image
                                            src="/images/vehiculos/autoIzquierda.png"
                                            alt="Vista lado izquierdo del vehículo"
                                            fill
                                            className="object-contain"
                                        />
                                        {damageAreas.ladoIzq && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center animate-pulse z-10">
                                                <span className="text-white text-xs font-bold">!</span>
                                            </div>
                                        )}
                                    </button>
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded-full text-slate-500 shadow-sm">
                                        Lado Izq.
                                    </span>
                                </div>
                            </div>
                            
                            <p className="text-[10px] text-slate-400 mt-6 text-center">
                                Toca la vista del vehículo donde hay daños
                            </p>
                        </div>

                        {/* Info Card */}
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/10">
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2">
                                Auto Aire y Repuestos Edwin
                            </h4>
                            <p className="text-[10px] text-slate-600 leading-relaxed">
                                Reparación de mangueras de alta y baja presión para aire acondicionado, dirección hidráulica y maquinarias pesadas.
                            </p>
                            <div className="mt-3 pt-3 border-t border-primary/10 flex items-center gap-2 text-[10px] text-slate-500">
                                <MapPin size={12} />
                                Av. Los Restauradores #17, Sto. Dgo.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Signatures - Mobile */}
                <div className="lg:hidden grid grid-cols-2 gap-8 mt-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
                        <div className="border-t-2 border-slate-200 mb-2 h-8"></div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Firma del Técnico</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
                        <div className="border-t-2 border-slate-200 mb-2 h-8"></div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Firma del Cliente</p>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
