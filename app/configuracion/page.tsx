"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import Link from "next/link";
import { 
  Settings, 
  Building, 
  ShieldCheck, 
  Bell, 
  Users, 
  CreditCard,
  FileText,
  ChevronRight,
  Globe,
  Mail
} from "lucide-react";

const sections = [
  {
    title: "Empresa",
    icon: Building,
    items: [
      { id: "profile", name: "Perfil de la empresa", desc: "Información legal, dirección y contacto", icon: Building, href: "/configuracion/perfil" },
      { id: "taxes", name: "Impuestos", desc: "Configura el IVA, Retenciones y otros", icon: ShieldCheck, href: "/configuracion/impuestos" },
      { id: "currency", name: "Moneda", desc: "Cambia la moneda base y multimoneda", icon: Globe, href: "/configuracion/moneda" },
    ]
  },
  {
    title: "Documentos",
    icon: FileText,
    items: [
      { id: "invoicing", name: "Numeraciones", desc: "Resoluciones de facturación y formatos", icon: FileText, href: "/configuracion/numeraciones" },
      { id: "branding", name: "Logo y Plantillas", desc: "Personaliza tus facturas y cotizaciones", icon: CreditCard, href: "/configuracion/plantillas" },
      { id: "notifications", name: "Correos electrónicos", desc: "Configura el envío de facturas", icon: Mail, href: "/configuracion/correos" },
    ]
  },
  {
    title: "Usuarios y Acceso",
    icon: Users,
    items: [
      { id: "users", name: "Usuarios", desc: "Gestiona quién tiene acceso a tu cuenta", icon: Users, href: "/configuracion/usuarios" },
      { id: "roles", name: "Roles y Permisos", desc: "Define qué puede hacer cada colaborador", icon: ShieldCheck, href: "/configuracion/roles" },
    ]
  }
];

export default function ConfiguracionPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-slate-800">Configuración</h1>
          <p className="text-slate-500 mt-1">Personaliza tu experiencia y ajusta los detalles de tu negocio.</p>
        </div>

        <div className="space-y-12 pb-20">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center space-x-2 mb-6">
                 <section.icon size={20} className="text-slate-400" />
                 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{section.title}</h2>
              </div>
              <div className="grid grid-cols-1 bg-white rounded-3xl border border-border overflow-hidden shadow-sm divide-y divide-border">
                {section.items.map((item) => (
                  <Link 
                    key={item.id} 
                    href={item.href}
                    className="p-6 flex items-center justify-between hover:bg-slate-50 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                       <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          <item.icon size={24} />
                       </div>
                       <div>
                          <p className="font-bold text-slate-800 text-lg">{item.name}</p>
                          <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start space-x-4">
           <div className="p-2 bg-blue-600 rounded-lg text-white">
              <ShieldCheck size={20} />
           </div>
           <div>
              <p className="font-bold text-blue-900">Tu cuenta está protegida</p>
              <p className="text-sm text-blue-700 mt-1">Hemos verificado tu identidad y configurado la autenticación de dos factores para tu seguridad. <span className="font-bold cursor-pointer hover:underline underline-offset-4">Saber más</span></p>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
