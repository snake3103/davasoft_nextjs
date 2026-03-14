"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  BookOpen, 
  ChevronRight, 
  Search, 
  MessageCircle, 
  Mail, 
  Phone,
  FileText,
  ShoppingCart,
  Receipt,
  Users,
  Package,
  BarChart3,
  Calculator,
  CreditCard,
  Settings,
  HelpCircle,
  Video,
  ExternalLink,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const modules = [
  {
    id: "ventas",
    title: "Ventas y Facturación",
    description: "Crear facturas, cotizaciones y gestionar ventas",
    icon: Receipt,
    color: "bg-blue-500",
    topics: [
      { title: "Crear una factura", content: "Para crear una factura: 1. Ve a Ventas → Nueva, 2. Selecciona el cliente, 3. Agrega los productos, 4. Elige el tipo de factura y guarda." },
      { title: "Tipos de facturas", content: "Puedes crear facturas de tipo: Contado (pagada inmediatamente), Crédito (pendiente de pago), o cotizaciones que luego se convierten en facturas." },
      { title: "Ver facturas", content: "En el listado de Ventas puedes ver todas las facturas, filtrar por estado (borrador, enviada, pagada, cancelada) y buscar por número." },
    ]
  },
  {
    id: "pos",
    title: "Punto de Venta (POS)",
    description: "Ventas rápidas con terminal de punto de venta",
    icon: ShoppingCart,
    color: "bg-emerald-500",
    topics: [
      { title: "Iniciar una venta", content: "1. Ve al módulo POS, 2. Busca productos por nombre o código SKU, 3. Haz click para agregar al carrito, 4. Click en Cobrar." },
      { title: "Métodos de pago", content: "En POS puedes接受 Efectivo, Tarjeta de crédito/débito, o Transferencia bancaria. También puedes usar pago mixto." },
      { title: "Impresión del ticket", content: "Al completar una venta, el ticket se imprime automáticamente. Configura tu impresora en la opción de impresión." },
    ]
  },
  {
    id: "inventario",
    title: "Inventario",
    description: "Control de productos y stock",
    icon: Package,
    color: "bg-purple-500",
    topics: [
      { title: "Agregar productos", content: "Ve a Inventario → Nuevo. Completa: nombre, precio, SKU, categoría y stock inicial. También puedes configurar stock mínimo." },
      { title: "Movimientos de inventario", content: "Registra entradas y salidas: Compras (aumenta stock), Ventas (disminuye stock), Ajustes, Devoluciones, etc." },
      { title: "Kárdex", content: "El kárdex muestra el historial de movimientos de cada producto. Accede en Inventario → Movimientos." },
      { title: "Valoración de inventario", content: "Calcula el valor total del inventario usando método promedio o FIFO. Ver en la pestaña de valoración." },
    ]
  },
  {
    id: "contactos",
    title: "Contactos",
    description: "Clientes y proveedores",
    icon: Users,
    color: "bg-amber-500",
    topics: [
      { title: "Agregar clientes", content: "Ve a Contactos → Nuevo. Selecciona tipo Cliente. Completa: nombre, email, teléfono, RNC/Cédula y dirección." },
      { title: "Agregar proveedores", content: "Same proceso pero selecciona tipo Proveedor. Los proveedores se usan en el módulo de compras/gastos." },
    ]
  },
  {
    id: "contabilidad",
    title: "Contabilidad",
    description: "Asientos, plan de cuentas y reportes",
    icon: Calculator,
    color: "bg-rose-500",
    topics: [
      { title: "Asientos contables", content: "Los asientos se generan automáticamente al crear facturas o gastos. También puedes crear asientos manuales en Contabilidad → Asientos." },
      { title: "Plan de cuentas", content: "El plan de cuentas está basado en NIIF para RD. Incluye: Activos, Pasivos, Patrimonio, Ingresos y Gastos." },
      { title: "Reportes", content: "En Contabilidad → Reportes puedes ver: Balance de Prueba, Balance General y Estado de Resultados. Filtra por fecha." },
    ]
  },
  {
    id: "reportes",
    title: "Reportes",
    description: "Estados financieros y análisis",
    icon: BarChart3,
    color: "bg-cyan-500",
    topics: [
      { title: "Dashboard", content: "El dashboard muestra KPIs: ventas totales, gastos, margen neto, cuentas por cobrar y más." },
      { title: "Estado de resultados", content: "Muestra ingresos, gastos y utilidad neta en un período. Accede desde Contabilidad → Reportes." },
    ]
  }
];

const faqs = [
  {
    question: "¿Cómo configuro mi empresa?",
    answer: "Ve a Configuración (en el menú lateral) para agregar: nombre de la empresa, NIT, dirección, teléfono y logo."
  },
  {
    question: "¿Cómo cambio el logo de mi empresa?",
    answer: "En Configuración → Empresa puedes subir tu logo. Se recomienda formato PNG con fondo transparente."
  },
  {
    question: "¿Puedo exportar datos a Excel?",
    answer: "Sí, en cada módulo hay opciones de exportación. También puedes usar los reportes para obtener datos en formato tabular."
  },
  {
    question: "¿El sistema genera comprobantes fiscales?",
    answer: "El sistema está preparado para NCF (Números de Comprobante Fiscal) para República Dominicana. Configura los prefix en Configuración → Fiscal."
  },
  {
    question: "¿Cómo hago una devolución?",
    answer: "Para devoluciones, crea un gasto tipo 'Devolución' y selecciona el producto. Esto automáticamente reduce el stock."
  },
  {
    question: "¿El ITBIS es automático?",
    answer: "Sí, el sistema calcula automáticamente el 18% de ITBIS para República Dominicana en todas las facturas y ventas."
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredModules = modules.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.topics.some(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const rateHelpful = (helpful: boolean) => {
    alert(helpful ? "¡Gracias por tu feedback! 😊" : "Lamentamos no haber ayudado. Contáctanos para más asistencia.");
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle size={40} />
            </div>
            <h1 className="text-3xl font-black mb-4">Centro de Ayuda Davasoft</h1>
            <p className="text-lg text-white/80 mb-8">
              Encuentra guías, tutoriales y respuestas a preguntas frecuentes
            </p>
            
            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar ayuda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-slate-800 shadow-lg focus:ring-4 focus:ring-white/30 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Quick Links */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <a href="#modulos" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-center group">
              <BookOpen size={32} className="mx-auto mb-3 text-primary" />
              <p className="font-bold text-slate-800">Guía de Módulos</p>
              <p className="text-xs text-slate-500">Aprende a usar cada sección</p>
            </a>
            <a href="#faq" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-center group">
              <MessageCircle size={32} className="mx-auto mb-3 text-amber-500" />
              <p className="font-bold text-slate-800">Preguntas Frecuentes</p>
              <p className="text-xs text-slate-500">Respuestas rápidas</p>
            </a>
            <a href="#contacto" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-center group">
              <Mail size={32} className="mx-auto mb-3 text-emerald-500" />
              <p className="font-bold text-slate-800">Contacto</p>
              <p className="text-xs text-slate-500">¿Necesitas más ayuda?</p>
            </a>
          </div>

          {/* Modules */}
          <div id="modulos" className="mb-12">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <BookOpen className="text-primary" />
              Guía por Módulos
            </h2>
            
            <div className="space-y-4">
              {filteredModules.map((module) => (
                <div key={module.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                    className="w-full p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", module.color)}>
                      <module.icon size={24} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-slate-800">{module.title}</h3>
                      <p className="text-sm text-slate-500">{module.description}</p>
                    </div>
                    <ChevronRight 
                      size={24} 
                      className={cn(
                        "text-slate-400 transition-transform",
                        expandedModule === module.id && "rotate-90"
                      )} 
                    />
                  </button>
                  
                  {expandedModule === module.id && (
                    <div className="px-6 pb-6 border-t border-slate-100">
                      <div className="py-4 space-y-4">
                        {module.topics.map((topic, idx) => (
                          <div key={idx} className="bg-slate-50 rounded-xl p-4">
                            <h4 className="font-bold text-slate-800 mb-2">{topic.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{topic.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div id="faq" className="mb-12">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <MessageCircle className="text-amber-500" />
              Preguntas Frecuentes
            </h2>
            
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-slate-800 text-left">{faq.question}</span>
                    <ChevronRight 
                      size={20} 
                      className={cn(
                        "text-slate-400 transition-transform flex-shrink-0 ml-2",
                        expandedFaq === idx && "rotate-90"
                      )} 
                    />
                  </button>
                  
                  {expandedFaq === idx && (
                    <div className="px-4 pb-4 border-t border-slate-100">
                      <p className="text-sm text-slate-600 py-3">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div id="contacto" className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8">
            <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">
              ¿Necesitas más ayuda?
            </h2>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="text-primary" size={24} />
                </div>
                <p className="font-bold text-slate-800">Email</p>
                <p className="text-sm text-slate-500">soporte@davasoft.com</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="text-primary" size={24} />
                </div>
                <p className="font-bold text-slate-800">Teléfono</p>
                <p className="text-sm text-slate-500">(809) 555-1234</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="text-primary" size={24} />
                </div>
                <p className="font-bold text-slate-800">Chat</p>
                <p className="text-sm text-slate-500">Lunes a Viernes 8am-6pm</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-primary/20 text-center">
              <p className="text-sm text-slate-500 mb-4">¿Esta guía te fue útil?</p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => rateHelpful(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-600 transition-colors"
                >
                  <Star size={18} /> Sí, me ayudó
                </button>
                <button 
                  onClick={() => rateHelpful(false)}
                  className="flex items-center gap-2 px-6 py-2 bg-slate-200 text-slate-600 rounded-full font-medium hover:bg-slate-300 transition-colors"
                >
                  <Star size={18} /> No, necesito más ayuda
                </button>
              </div>
            </div>
          </div>

          {/* Version */}
          <div className="text-center mt-12 text-sm text-slate-400">
            <p>Versión 1.0.0 • Davasoft ERP</p>
            <p className="mt-1">© 2026 Davasoft S.A.S • Todos los derechos reservados</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
