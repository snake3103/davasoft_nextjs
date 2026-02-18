"use client";

import { useState } from "react";
import { X, User, Mail, Phone, MapPin, Building2, Briefcase } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: any) => void;
  initialData?: any;
}

export function ContactModal({ isOpen, onClose, onSave, initialData }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    type: initialData?.type || "Cliente",
    city: initialData?.city || "",
    address: initialData?.address || "",
    nit: initialData?.nit || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "El nombre es obligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{initialData ? "Editar Contacto" : "Nuevo Contacto"}</h2>
            <p className="text-sm text-slate-500">Registra un nuevo cliente o proveedor.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700">Tipo de contacto</label>
            <div className="flex space-x-4">
              {["Cliente", "Proveedor", "Empleado"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, type })}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all ${formData.type === type
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                    : "bg-slate-50 border-border text-slate-500 hover:bg-slate-100"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <User size={14} className="mr-2 text-primary" /> Nombre / Razón Social
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Tech Solutions S.A.S"
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <Building2 size={14} className="mr-2 text-primary" /> NIT / Identificación
              </label>
              <input
                type="text"
                value={formData.nit}
                onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                placeholder="Ej: 900.123.456-7"
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <Mail size={14} className="mr-2 text-primary" /> Correo electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ejemplo@correo.com"
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <Phone size={14} className="mr-2 text-primary" /> Teléfono
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+57 300 000 0000"
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <MapPin size={14} className="mr-2 text-primary" /> Ciudad
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ej: Bogotá"
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <Briefcase size={14} className="mr-2 text-primary" /> Dirección
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ej: Calle 123 #45-67"
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-border flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            {initialData ? "Guardar Cambios" : "Guardar Contacto"}
          </button>
        </div>
      </div>
    </div>
  );
}
