"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Image as ImageIcon, ArrowLeft, Palette, Layout, Save, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const templates = [
  { id: "classic", name: "Clásico", image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&h=280&fit=crop" },
  { id: "modern", name: "Moderno", image: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=200&h=280&fit=crop" },
  { id: "premium", name: "Premium", image: "https://images.unsplash.com/photo-1568231267597-4074ee945d8b?w=200&h=280&fit=crop" },
];

export default function PlantillasConfigPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [primaryColor, setPrimaryColor] = useState("#006CE0");

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-10 pb-20">
        <div className="flex items-center space-x-4">
           <Link href="/configuracion" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
              <ArrowLeft size={20} />
           </Link>
           <div>
              <h1 className="text-2xl font-bold text-slate-800">Logo y Plantillas</h1>
              <p className="text-slate-500 text-sm">Personaliza la imagen visual de tus documentos.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Left Column: Settings */}
           <div className="lg:col-span-1 space-y-8">
              <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                 <div className="flex items-center space-x-2 mb-6">
                    <Palette size={20} className="text-primary" />
                    <h3 className="font-bold text-slate-800">Colores</h3>
                 </div>
                 <div className="space-y-4">
                    <label className="text-sm text-slate-600 font-medium">Color institucional</label>
                    <div className="flex items-center space-x-3">
                       <input 
                         type="color" 
                         value={primaryColor}
                         onChange={(e) => setPrimaryColor(e.target.value)}
                         className="h-10 w-10 border-none rounded-lg cursor-pointer bg-transparent"
                       />
                       <input 
                         type="text" 
                         value={primaryColor}
                         onChange={(e) => setPrimaryColor(e.target.value)}
                         className="flex-1 bg-slate-50 border border-border rounded-xl px-4 py-2 text-sm font-mono outline-none"
                       />
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                 <div className="flex items-center space-x-2 mb-6">
                    <Layout size={20} className="text-primary" />
                    <h3 className="font-bold text-slate-800">Layout</h3>
                 </div>
                 <div className="space-y-4 font-medium">
                    <div className="flex items-center justify-between py-2">
                       <span className="text-sm text-slate-600">Mostrar logo</span>
                       <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                       </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                       <span className="text-sm text-slate-600">Firma electrónica</span>
                       <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                          <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                       </div>
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => alert("Cambios de diseño guardados")}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center shadow-lg shadow-primary/25 hover:opacity-90 transition-all"
              >
                 <Save size={20} className="mr-2" /> Guardar Diseño
              </button>
           </div>

           {/* Right Column: Template Selection */}
           <div className="lg:col-span-2 space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Selecciona una Plantilla</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                 {templates.map((tpl) => (
                   <div 
                     key={tpl.id}
                     onClick={() => setSelectedTemplate(tpl.id)}
                     className={cn(
                       "relative rounded-3xl border-2 transition-all cursor-pointer overflow-hidden aspect-[3/4]",
                       selectedTemplate === tpl.id ? "border-primary shadow-xl scale-105" : "border-transparent hover:border-slate-300"
                     )}
                   >
                      <img src={tpl.image} className="w-full h-full object-cover" alt={tpl.name} />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 to-transparent p-6">
                         <p className="text-white font-bold">{tpl.name}</p>
                      </div>
                      {selectedTemplate === tpl.id && (
                        <div className="absolute top-4 right-4 h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                           <Check size={18} />
                        </div>
                      )}
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
