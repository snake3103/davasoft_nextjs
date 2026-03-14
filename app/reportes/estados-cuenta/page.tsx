"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FileText, Download, Search, User, Building2, X, Printer, Calendar, DollarSign } from "lucide-react";
import { useClients } from "@/hooks/useDatabase";
import { ContactSearch } from "@/components/ui/Autocomplete";
import { generateClientStatementPDF, generateProviderStatementPDF } from "@/lib/pdf-reports";

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string | null;
  total: number;
  paid: number;
  balance: number;
  status: string;
}

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  idNumber?: string | null;
  address?: string | null;
}

interface Expense {
  id: string;
  number: string;
  date: string;
  total: number;
  paid: number;
  balance: number;
  status: string;
  category: string;
}

interface ProviderStatementData {
  provider: Client;
  expenses: Expense[];
  totals: {
    totalExpenses: number;
    totalPaid: number;
    totalBalance: number;
  };
  generatedAt: string;
}

interface StatementData {
  client: Client;
  invoices: Invoice[];
  totals: {
    totalInvoices: number;
    totalPaid: number;
    totalBalance: number;
  };
  agingTotals: {
    current: number;
    over_0: number;
    over_30: number;
    over_60: number;
    over_90: number;
  };
  generatedAt: string;
}

type StatementDataType = StatementData | ProviderStatementData;

export default function EstadosCuentaPage() {
  const { data: clients = [] } = useClients();
  const [selectedType, setSelectedType] = useState<"CLIENT" | "PROVIDER">("CLIENT");
  const [selectedEntity, setSelectedEntity] = useState<Client | null>(null);
  const [statementData, setStatementData] = useState<StatementDataType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const providers = clients.filter((c: any) => c.type === "PROVIDER" || c.type === "BOTH");
  const clientsOnly = clients.filter((c: any) => c.type === "CLIENT" || c.type === "BOTH");

  const fetchStatement = async () => {
    if (!selectedEntity) return;

    setIsLoading(true);
    try {
      const endpoint = selectedType === "CLIENT" 
        ? `/api/reports/client-statement?clientId=${selectedEntity.id}`
        : `/api/reports/provider-statement?providerId=${selectedEntity.id}`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setStatementData(data);
      } else {
        alert("Error al cargar el estado de cuenta");
      }
    } catch (error) {
      console.error("Error fetching statement:", error);
      alert("Error al cargar el estado de cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = (printDirectly = false) => {
    if (!statementData) return;

    const blob = selectedType === "CLIENT"
      ? generateClientStatementPDF(statementData as StatementData)
      : generateProviderStatementPDF(statementData as ProviderStatementData);

    const url = URL.createObjectURL(blob);
    
    if (printDirectly) {
      // Abrir en nueva ventana e imprimir
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } else {
      // Descargar archivo
      const link = document.createElement("a");
      link.href = url;
      link.download = `Estado_Cuenta_${selectedEntity?.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      link.click();
    }
    
    URL.revokeObjectURL(url);
  };

  const clearSelection = () => {
    setSelectedEntity(null);
    setStatementData(null);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Estados de Cuenta</h1>
          <p className="text-slate-500 mt-1">Genera reportes de estado de cuenta para clientes y proveedores</p>
        </div>

        {/* Selector de Tipo */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            Seleccionar Tipo de Reporte
          </h2>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setSelectedType("CLIENT");
                setSelectedEntity(null);
                setStatementData(null);
              }}
              className={`flex-1 py-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${
                selectedType === "CLIENT"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-slate-600 hover:border-primary/50"
              }`}
            >
              <User size={24} />
              <span className="font-bold">Cliente</span>
            </button>
            <button
              onClick={() => {
                setSelectedType("PROVIDER");
                setSelectedEntity(null);
                setStatementData(null);
              }}
              className={`flex-1 py-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${
                selectedType === "PROVIDER"
                  ? "border-rose-500 bg-rose-50 text-rose-600"
                  : "border-border text-slate-600 hover:border-rose-500/50"
              }`}
            >
              <Building2 size={24} />
              <span className="font-bold">Proveedor</span>
            </button>
          </div>

          {/* Selector de Entidad */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {selectedType === "CLIENT" ? "Seleccionar Cliente" : "Seleccionar Proveedor"}
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <ContactSearch
                    value={selectedEntity?.name || ""}
                    contacts={selectedType === "CLIENT" ? clientsOnly : providers}
                    onChange={(val: string) => {
                      if (!val) setSelectedEntity(null);
                    }}
                    onSelect={(c: any) => setSelectedEntity(c)}
                    placeholder={`Buscar ${selectedType === "CLIENT" ? "cliente" : "proveedor"}...`}
                  />
                </div>
                {selectedEntity && (
                  <button
                    onClick={clearSelection}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={fetchStatement}
              disabled={!selectedEntity || isLoading}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search size={18} />
              {isLoading ? "Cargando..." : "Generar Estado de Cuenta"}
            </button>
          </div>
        </div>

        {/* Resultado del Reporte */}
        {statementData && (
          <>
            {/* Header del Reporte */}
            <div className="bg-white rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {selectedType === "CLIENT" ? "Estado de Cuenta - Cliente" : "Estado de Cuenta - Proveedor"}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Generado el {new Date(statementData.generatedAt).toLocaleString("es-DO")}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => downloadPDF(false)}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Download size={18} />
                    Descargar PDF
                  </button>
                  <button
                    onClick={() => downloadPDF(true)}
                    className="px-4 py-2 bg-white border border-border rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <Printer size={18} />
                    Imprimir PDF
                  </button>
                </div>
              </div>

              {/* Información de la Entidad */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                  {selectedType === "CLIENT" ? <User size={18} /> : <Building2 size={18} />}
                  Información
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Nombre:</span>
                    <p className="font-bold text-slate-800">
                      {selectedType === "CLIENT" 
                        ? (statementData as StatementData).client.name 
                        : (statementData as ProviderStatementData).provider.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">RNC/Cédula:</span>
                    <p className="font-bold text-slate-800">
                      {selectedType === "CLIENT" 
                        ? (statementData as StatementData).client.idNumber || "N/A" 
                        : (statementData as ProviderStatementData).provider.idNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Teléfono:</span>
                    <p className="font-bold text-slate-800">
                      {selectedType === "CLIENT" 
                        ? (statementData as StatementData).client.phone || "N/A" 
                        : (statementData as ProviderStatementData).provider.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <p className="font-bold text-slate-800">
                      {selectedType === "CLIENT" 
                        ? (statementData as StatementData).client.email || "N/A" 
                        : (statementData as ProviderStatementData).provider.email || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Totales */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={20} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-600">
                      {selectedType === "CLIENT" ? "Total Facturas" : "Total Compras"}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-blue-600">
                    ${(selectedType === "CLIENT" 
                      ? (statementData as StatementData).totals.totalInvoices 
                      : (statementData as ProviderStatementData).totals.totalExpenses
                    ).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={20} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-600">Total Pagado</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-600">
                    ${statementData.totals.totalPaid.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`rounded-xl p-4 border ${
                  statementData.totals.totalBalance > 0 
                    ? "bg-rose-50 border-rose-100" 
                    : "bg-emerald-50 border-emerald-100"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={20} className={
                      statementData.totals.totalBalance > 0 ? "text-rose-600" : "text-emerald-600"
                    } />
                    <span className={`text-sm font-bold ${
                      statementData.totals.totalBalance > 0 ? "text-rose-600" : "text-emerald-600"
                    }`}>Saldo Pendiente</span>
                  </div>
                  <p className={`text-2xl font-black ${
                    statementData.totals.totalBalance > 0 ? "text-rose-600" : "text-emerald-600"
                  }`}>
                    ${statementData.totals.totalBalance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Antigüedad de Saldos (solo para clientes) */}
              {selectedType === "CLIENT" && statementData.totals.totalBalance > 0 && (
                <div className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-lg mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-xl text-amber-900 flex items-center gap-2">
                      <Calendar size={24} className="text-amber-600" />
                      Antigüedad de Saldos (Aging)
                    </h3>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                      Análisis de vencimiento
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border-2 border-emerald-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <p className="text-xs font-black text-emerald-900">Al Corriente</p>
                      </div>
                      <p className="text-2xl font-black text-emerald-700">
                        ${(statementData as StatementData).agingTotals.current.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] font-bold text-emerald-600 mt-2">Sin vencer</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border-2 border-amber-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <p className="text-xs font-black text-amber-900">1-30 Días</p>
                      </div>
                      <p className="text-2xl font-black text-amber-700">
                        ${(statementData as StatementData).agingTotals.over_0.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] font-bold text-amber-600 mt-2">Vencido reciente</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <p className="text-xs font-black text-orange-900">31-60 Días</p>
                      </div>
                      <p className="text-2xl font-black text-orange-700">
                        ${(statementData as StatementData).agingTotals.over_30.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] font-bold text-orange-600 mt-2">Vencido medio</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <p className="text-xs font-black text-red-900">61-90 Días</p>
                      </div>
                      <p className="text-2xl font-black text-red-700">
                        ${(statementData as StatementData).agingTotals.over_60.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] font-bold text-red-600 mt-2">Vencido crítico</p>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border-2 border-rose-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-rose-600 rounded-full"></div>
                        <p className="text-xs font-black text-rose-900">+90 Días</p>
                      </div>
                      <p className="text-2xl font-black text-rose-700">
                        ${(statementData as StatementData).agingTotals.over_90.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] font-bold text-rose-600 mt-2">Muy vencido</p>
                    </div>
                  </div>
                  {/* Barra de progreso visual */}
                  <div className="mt-4 pt-4 border-t-2 border-slate-100">
                    <div className="flex h-6 rounded-full overflow-hidden">
                      {(() => {
                        const total = (statementData as StatementData).agingTotals.current + 
                                     (statementData as StatementData).agingTotals.over_0 + 
                                     (statementData as StatementData).agingTotals.over_30 + 
                                     (statementData as StatementData).agingTotals.over_60 + 
                                     (statementData as StatementData).agingTotals.over_90;
                        return total > 0 ? (
                          <>
                            <div style={{ width: `${((statementData as StatementData).agingTotals.current / total) * 100}%` }} className="bg-emerald-500"></div>
                            <div style={{ width: `${((statementData as StatementData).agingTotals.over_0 / total) * 100}%` }} className="bg-amber-500"></div>
                            <div style={{ width: `${((statementData as StatementData).agingTotals.over_30 / total) * 100}%` }} className="bg-orange-500"></div>
                            <div style={{ width: `${((statementData as StatementData).agingTotals.over_60 / total) * 100}%` }} className="bg-red-500"></div>
                            <div style={{ width: `${((statementData as StatementData).agingTotals.over_90 / total) * 100}%` }} className="bg-rose-600"></div>
                          </>
                        ) : null;
                      })()}
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-2 text-center">
                      Distribución visual del saldo pendiente
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tabla de Facturas/Compras */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold text-slate-800">
                  {selectedType === "CLIENT" ? "Detalle de Facturas" : "Detalle de Compras"}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-3">Número</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-3">Fecha</th>
                      {selectedType === "PROVIDER" ? (
                        <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-3">Categoría</th>
                      ) : (
                        <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-3">Vencimiento</th>
                      )}
                      {selectedType === "CLIENT" && (
                        <th className="text-center text-xs font-bold text-slate-500 uppercase px-6 py-3">Días Vencido</th>
                      )}
                      <th className="text-right text-xs font-bold text-slate-500 uppercase px-6 py-3">Total</th>
                      <th className="text-right text-xs font-bold text-slate-500 uppercase px-6 py-3">Pagado</th>
                      <th className="text-right text-xs font-bold text-slate-500 uppercase px-6 py-3">Saldo</th>
                      <th className="text-center text-xs font-bold text-slate-500 uppercase px-6 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {statementData && selectedType === "CLIENT" && (statementData as StatementData).invoices.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{item.number}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(item.date).toLocaleDateString("es-DO")}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.dueDate ? new Date(item.dueDate).toLocaleDateString("es-DO") : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.daysOverdue !== undefined && item.balance > 0 ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-xs font-black px-3 py-1.5 rounded-full border-2 ${
                                item.daysOverdue > 90 ? "bg-rose-100 text-rose-700 border-rose-300" :
                                item.daysOverdue > 60 ? "bg-red-100 text-red-700 border-red-300" :
                                item.daysOverdue > 30 ? "bg-orange-100 text-orange-700 border-orange-300" :
                                "bg-amber-100 text-amber-700 border-amber-300"
                              }`}>
                                {item.agingLabel || `${item.daysOverdue} días`}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {item.dueDate ? new Date(item.dueDate).toLocaleDateString("es-DO") : "N/A"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-black px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 border-2 border-emerald-300">
                                Al día
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {item.dueDate ? new Date(item.dueDate).toLocaleDateString("es-DO") : "N/A"}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-slate-800">
                          ${item.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600">
                          ${item.paid.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-rose-600">
                          ${item.balance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            item.status === "PAID"
                              ? "bg-emerald-100 text-emerald-600"
                              : item.status === "PARTIAL"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {item.status === "PAID" ? "Pagado" : item.status === "PARTIAL" ? "Parcial" : "Pendiente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {statementData && selectedType === "PROVIDER" && (statementData as ProviderStatementData).expenses.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{item.number}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(item.date).toLocaleDateString("es-DO")}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-slate-800">
                          ${item.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600">
                          ${item.paid.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-rose-600">
                          ${item.balance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            item.status === "PAID"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {item.status === "PAID" ? "Pagado" : "Pendiente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
