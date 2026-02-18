"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Building, Mail, Phone, MapPin, Globe, Camera, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PerfilConfigPage() {
  const [formData, setFormData] = useState({
    name: "Mi Empresa S.A.S",
    nit: "900.123.456-7",
    email: "admin@miempresa.com",
    phone: "+57 300 123 4567",
    website: "www.miempresa.com",
    address: "Calle 123 #45-67, Edificio Horizonte",
    city: "Bogotá, Colombia",
  });

  const handleSave = () => {
    alert("Configuración guardada correctamente");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl border-r border-border min-h-screen pr-8 pb-20">
        <div className="mb-8 flex items-center space-x-4">
           <Link href="/configuracion" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
              <ArrowLeft size={20} />
           </Link>
           <div>
              <h1 className="text-2xl font-bold text-slate-800">Perfil de la empresa</h1>
              <p className="text-slate-500 text-sm">Gestiona la información legal y de contacto de tu negocio.</p>
           </div>
        </div>

        <div className="space-y-8">
          {/* Logo Section */}
          <div className="flex items-center space-x-6 bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
             <div className="relative group cursor-pointer">
                <div className="h-24 w-24 bg-white rounded-2xl flex items-center justify-center text-slate-300 border border-border overflow-hidden">
                   <Building size={40} />
                </div>
                <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                   <Camera size={24} className="text-white" />
                </div>
             </div>
             <div>
                <h3 className="font-bold text-slate-800">Logo de la empresa</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Usa una imagen de al menos 400x400px en formato PNG o JPG.</p>
                <button className="mt-3 text-xs font-bold text-primary hover:underline">Subir nueva imagen</button>
             </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-medium">
             <div className="space-y-2">
                <label className="text-sm text-slate-600">Nombre / Razón Social</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
             </div>
             <div className="space-y-2">
                <label className="text-sm text-slate-600">NIT / Identificación Fiscal</label>
                <input 
                  type="text" 
                  value={formData.nit}
                  onChange={(e) => setFormData({...formData, nit: e.target.value})}
                  className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
             </div>
             <div className="space-y-2">
                <label className="text-sm text-slate-600">Correo de contacto</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
             </div>
             <div className="space-y-2">
                <label className="text-sm text-slate-600">Teléfono</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
             </div>
             <div className="md:col-span-2 space-y-2">
                <label className="text-sm text-slate-600">Sitio Web</label>
                <input 
                  type="text" 
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
             </div>
          </div>

          {/* Location */}
          <div className="pt-6 border-t border-border">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Ubicación</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm text-slate-600">Dirección</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">Ciudad y País</label>
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
             </div>
          </div>

          <div className="pt-8 flex justify-end">
             <button 
              onClick={handleSave}
              className="px-10 py-3 bg-primary text-white rounded-2xl font-bold flex items-center shadow-lg shadow-primary/25 hover:opacity-90 transition-all"
             >
                <Save size={18} className="mr-2" /> Guardar Perfil
             </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
