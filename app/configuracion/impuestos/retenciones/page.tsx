"use client";

import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { cn, formatMoney, formatCurrency } from "@/lib/utils";
import {
  Plus,
  FileText,
  Search,
  RefreshCw,
  Download,
  X,
  AlertCircle,
  Receipt,
  Calculator,
  Building2,
  User,
  Calendar,
  ReceiptText,
  Filter,
  Trash2,
  Edit,
  Eye
} from "lucide-react";
import {
  getRetentions,
  getRetentionCertificates,
  createRetention,
  updateRetention,
  deleteRetention,
  createRetentionCertificate,
  generateCertificateNumber,
  getCertificateStats,
  RETENTION_TYPES,
  RetentionType,
  ApplyTo,
} from "@/app/actions/retentions";

// ============================================
// Modal de Retención
// ============================================
function RetentionModal({
  isOpen,
  onClose,
  onSaved,
  retention,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  retention?: any;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "ISR_RETENTION" as RetentionType,
    percentage: 0,
    description: "",
    appliesTo: "BOTH" as ApplyTo,
  });

  useEffect(() => {
    if (isOpen) {
      if (retention) {
        setFormData({
          name: retention.name,
          type: retention.type,
          percentage: Number(retention.percentage),
          description: retention.description || "",
          appliesTo: retention.appliesTo,
        });
      } else {
        setFormData({
          name: "",
          type: "ISR_RETENTION",
          percentage: 0,
          description: "",
          appliesTo: "BOTH",
        });
      }
      setError(null);
    }
  }, [isOpen, retention]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        type: formData.type,
        percentage: formData.percentage,
        description: formData.description || undefined,
        appliesTo: formData.appliesTo,
      };

      if (retention) {
        await updateRetention(retention.id, data);
      } else {
        await createRetention("default-org", data);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: RetentionType) => RETENTION_TYPES[type]?.label || type;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt size={20} className="text-primary" />
            {retention ? "Editar Retención" : "Nueva Retención"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">
              Nombre *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ISR Servicios Profesionales"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">
              Tipo de Retención *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as RetentionType })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            >
              {Object.entries(RETENTION_TYPES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">
              Porcentaje (%) *
            </label>
            <Input
              type="number"
              step="0.01"
              min={0}
              max={100}
              value={formData.percentage}
              onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
              placeholder="10.00"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">
              Aplica a
            </label>
            <select
              value={formData.appliesTo}
              onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value as ApplyTo })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="BOTH">Ventas y Compras</option>
              <option value="SALES">Solo Ventas</option>
              <option value="PURCHASES">Solo Compras</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción de la retención..."
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : retention ? "Actualizar" : "Crear Retención"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Modal de Certificado de Retención
// ============================================
function CertificateModal({
  isOpen,
  onClose,
  onSaved,
  retentions,
  mode,
  certificate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  retentions: any[];
  mode: "create" | "view";
  certificate?: any;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    retentionId: "",
    certificateNumber: "",
    date: new Date().toISOString().split("T")[0],
    agentName: "",
    agentTaxId: "",
    agentAddress: "",
    beneficiaryName: "",
    beneficiaryTaxId: "",
    beneficiaryAddress: "",
    totalAmount: 0,
    concept: "",
    period: new Date().toISOString().slice(0, 7),
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === "view" && certificate) {
        setFormData({
          retentionId: certificate.retentionId,
          certificateNumber: certificate.certificateNumber,
          date: new Date(certificate.date).toISOString().split("T")[0],
          agentName: certificate.agentName,
          agentTaxId: certificate.agentTaxId,
          agentAddress: certificate.agentAddress,
          beneficiaryName: certificate.beneficiaryName,
          beneficiaryTaxId: certificate.beneficiaryTaxId,
          beneficiaryAddress: certificate.beneficiaryAddress,
          totalAmount: Number(certificate.totalAmount),
          concept: certificate.concept,
          period: certificate.period,
        });
      } else {
        generateCertificateNumber("default-org").then((num) => {
          setFormData((prev) => ({ ...prev, certificateNumber: num }));
        });
        setFormData((prev) => ({
          ...prev,
          retentionId: retentions[0]?.id || "",
          agentName: "Empresa Demo SRL",
          agentTaxId: "123456789",
          agentAddress: "Av. Principal #123, Santo Domingo",
        }));
      }
      setError(null);
    }
  }, [isOpen, mode, certificate, retentions]);

  const selectedRetention = retentions.find((r) => r.id === formData.retentionId);
  const calculatedRetained = formData.totalAmount * ((selectedRetention?.percentage || 0) / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createRetentionCertificate("default-org", {
        retentionId: formData.retentionId,
        certificateNumber: formData.certificateNumber,
        date: new Date(formData.date),
        agentName: formData.agentName,
        agentTaxId: formData.agentTaxId,
        agentAddress: formData.agentAddress,
        beneficiaryName: formData.beneficiaryName,
        beneficiaryTaxId: formData.beneficiaryTaxId,
        beneficiaryAddress: formData.beneficiaryAddress,
        totalAmount: formData.totalAmount,
        concept: formData.concept,
        period: formData.period,
      });

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // Aquí se generaría el PDF
    alert("Generando PDF del certificado...");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ReceiptText size={20} className="text-primary" />
            {mode === "view" ? "Certificado de Retención" : "Nuevo Certificado"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={mode === "create" ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Número y Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">
                Número de Certificado
              </label>
              <Input
                value={formData.certificateNumber}
                onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                placeholder="RET-2026-0001"
                disabled={mode === "view"}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">
                Fecha
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={mode === "view"}
                required
              />
            </div>
          </div>

          {/* Tipo de Retención */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">
                Tipo de Retención
              </label>
              <select
                value={formData.retentionId}
                onChange={(e) => setFormData({ ...formData, retentionId: e.target.value })}
                disabled={mode === "view"}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50"
                required
              >
                <option value="">Seleccionar...</option>
                {retentions.map((ret) => (
                  <option key={ret.id} value={ret.id}>
                    {RETENTION_TYPES[ret.type as RetentionType]?.label} - {ret.percentage}%
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">
                Período
              </label>
              <Input
                type="month"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                disabled={mode === "view"}
                required
              />
            </div>
          </div>

          {/* Agente de Retención */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Building2 size={16} />
              Agente de Retención
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Nombre</label>
                <Input
                  value={formData.agentName}
                  onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                  placeholder="Nombre de la empresa"
                  disabled={mode === "view"}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">RNC</label>
                <Input
                  value={formData.agentTaxId}
                  onChange={(e) => setFormData({ ...formData, agentTaxId: e.target.value })}
                  placeholder="123456789"
                  disabled={mode === "view"}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500 block mb-1">Dirección</label>
                <Input
                  value={formData.agentAddress}
                  onChange={(e) => setFormData({ ...formData, agentAddress: e.target.value })}
                  placeholder="Dirección fiscal"
                  disabled={mode === "view"}
                />
              </div>
            </div>
          </div>

          {/* Beneficiario */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User size={16} />
              Beneficiario
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Nombre</label>
                <Input
                  value={formData.beneficiaryName}
                  onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                  placeholder="Nombre del beneficiario"
                  disabled={mode === "view"}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">RNC/Cédula</label>
                <Input
                  value={formData.beneficiaryTaxId}
                  onChange={(e) => setFormData({ ...formData, beneficiaryTaxId: e.target.value })}
                  placeholder="123456789"
                  disabled={mode === "view"}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500 block mb-1">Dirección</label>
                <Input
                  value={formData.beneficiaryAddress}
                  onChange={(e) => setFormData({ ...formData, beneficiaryAddress: e.target.value })}
                  placeholder="Dirección del beneficiario"
                  disabled={mode === "view"}
                />
              </div>
            </div>
          </div>

          {/* Montos */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calculator size={16} />
              Cálculo de Retención
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Monto Total</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                  disabled={mode === "view"}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">% Retención</label>
                <Input
                  value={selectedRetention ? Number(selectedRetention.percentage).toFixed(2) : "0.00"}
                  disabled
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Monto Retenido</label>
                <Input
                  value={formatCurrency(certificate ? Number(certificate.retainedAmount) : calculatedRetained)}
                  disabled
                  className="bg-primary/10 border-primary/30 text-primary font-bold"
                />
              </div>
            </div>
          </div>

          {/* Concepto */}
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">
              Concepto de la Retención
            </label>
            <textarea
              value={formData.concept}
              onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              placeholder="Descripción del concepto de retención..."
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none disabled:bg-slate-50"
              rows={3}
              disabled={mode === "view"}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === "view" ? "Cerrar" : "Cancelar"}
            </Button>
            {mode === "view" ? (
              <Button onClick={handleDownloadPDF}>
                <Download size={16} />
                Descargar PDF
              </Button>
            ) : (
              <Button type="submit" disabled={loading} isLoading={loading}>
                <Receipt size={16} />
                Generar Certificado
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Modal de Confirmación de Eliminación
// ============================================
function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  loading: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-slate-600">
            ¿Está seguro que desea eliminar la retención{" "}
            <strong>{itemName}</strong>? Esta acción no se puede deshacer.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={loading}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Página Principal
// ============================================
export default function RetencionesPage() {
  const [retentions, setRetentions] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalCertificates: 0,
    totalRetained: 0,
    totalAmount: 0,
    byType: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"retentions" | "certificates">("retentions");
  const [searchCert, setSearchCert] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString());

  // Modales
  const [showRetentionModal, setShowRetentionModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRetention, setEditingRetention] = useState<any>(null);
  const [viewingCertificate, setViewingCertificate] = useState<any>(null);
  const [deletingRetention, setDeletingRetention] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [retentionsData, certificatesData, statsData] = await Promise.all([
        getRetentions("default-org"),
        getRetentionCertificates("default-org", {
          search: searchCert || undefined,
          type: typeFilter !== "all" ? (typeFilter as RetentionType) : undefined,
          year: yearFilter ? parseInt(yearFilter) : undefined,
        }),
        getCertificateStats("default-org"),
      ]);
      setRetentions(retentionsData);
      setCertificates(certificatesData);
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchCert, typeFilter, yearFilter]);

  const handleCreateRetention = () => {
    setEditingRetention(null);
    setShowRetentionModal(true);
  };

  const handleEditRetention = (retention: any) => {
    setEditingRetention(retention);
    setShowRetentionModal(true);
  };

  const handleDeleteRetention = (retention: any) => {
    setDeletingRetention(retention);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingRetention) return;
    setDeleteLoading(true);
    try {
      await deleteRetention(deletingRetention.id);
      setShowDeleteModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateCertificate = () => {
    setViewingCertificate(null);
    setShowCertificateModal(true);
  };

  const handleViewCertificate = (cert: any) => {
    setViewingCertificate(cert);
    setShowCertificateModal(true);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTypeLabel = (type: string) => RETENTION_TYPES[type as RetentionType]?.label || type;

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2].map(String);
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <Receipt className="text-primary" size={28} />
              Certificados de Retención
            </h1>
            <p className="text-slate-500 mt-1">
              Configuración de retenciones e impresión de certificados
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleCreateCertificate}>
              <ReceiptText size={18} />
              Generar Certificado
            </Button>
            <Button onClick={handleCreateRetention}>
              <Plus size={18} />
              Nueva Retención
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Certificados ({yearFilter})
            </p>
            <p className="text-2xl font-black text-slate-800">{stats.totalCertificates}</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Total Retenido
            </p>
            <p className="text-2xl font-black text-rose-600">{formatCurrency(stats.totalRetained)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Base Imponible
            </p>
            <p className="text-2xl font-black text-slate-800">{formatCurrency(stats.totalAmount)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-border">
          <button
            onClick={() => setActiveTab("retentions")}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "retentions"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            Retenciones Configuradas
          </button>
          <button
            onClick={() => setActiveTab("certificates")}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "certificates"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            Certificados Generados
          </button>
        </div>

        {activeTab === "retentions" ? (
          // Tabla de Retenciones
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw size={32} className="animate-spin mx-auto mb-4" />
                <p>Cargando...</p>
              </div>
            ) : retentions.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt size={40} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No hay retenciones</h3>
                <p className="text-slate-500 mt-2 mb-4">Configure sus retenciones para comenzar.</p>
                <Button onClick={handleCreateRetention}>
                  <Plus size={18} />
                  Nueva Retención
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                        Porcentaje
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Aplica a
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {retentions.map((ret) => (
                      <tr key={ret.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-800">{ret.name}</div>
                          {ret.description && (
                            <div className="text-xs text-slate-400">{ret.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                            {getTypeLabel(ret.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                          {Number(ret.percentage).toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {ret.appliesTo === "BOTH"
                            ? "Ventas y Compras"
                            : ret.appliesTo === "SALES"
                            ? "Ventas"
                            : "Compras"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRetention(ret)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRetention(ret)}
                              title="Eliminar"
                              className="text-rose-500 hover:text-rose-600"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          // Tabla de Certificados
          <>
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full bg-white px-4 py-2.5 rounded-xl border border-border flex items-center shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Search className="text-slate-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por número o beneficiario..."
                  value={searchCert}
                  onChange={(e) => setSearchCert(e.target.value)}
                  className="flex-1 bg-transparent border-none py-1 text-sm focus:ring-0 outline-none"
                />
                {searchCert && (
                  <button
                    onClick={() => setSearchCert("")}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm"
              >
                <option value="all">Todos los tipos</option>
                {Object.entries(RETENTION_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw size={16} />
              </Button>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-12 text-center text-slate-400">
                  <RefreshCw size={32} className="animate-spin mx-auto mb-4" />
                  <p>Cargando certificados...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-rose-600">
                  <AlertCircle size={32} className="mx-auto mb-4" />
                  <p>{error}</p>
                  <Button variant="outline" className="mt-4" onClick={loadData}>
                    Reintentar
                  </Button>
                </div>
              ) : certificates.length === 0 ? (
                <div className="p-12 text-center">
                  <ReceiptText size={40} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700">No hay certificados</h3>
                  <p className="text-slate-500 mt-2 mb-4">
                    Genere su primer certificado de retención.
                  </p>
                  <Button onClick={handleCreateCertificate}>
                    <Plus size={18} />
                    Generar Certificado
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-border">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Número
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Fecha
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Beneficiario
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Tipo
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                          Monto
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                          Retenido
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {certificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-mono text-sm font-medium text-slate-800">
                            {cert.certificateNumber}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {formatDate(cert.date)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-800">
                              {cert.beneficiaryName}
                            </div>
                            <div className="text-xs text-slate-400">
                              {cert.beneficiaryTaxId}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                              {getTypeLabel(cert.retention.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-medium text-slate-800">
                            {formatCurrency(Number(cert.totalAmount))}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-bold text-rose-600">
                            {formatCurrency(Number(cert.retainedAmount))}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewCertificate(cert)}
                                title="Ver"
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Descargar PDF"
                                onClick={() => alert("Descargando PDF...")}
                              >
                                <Download size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      <RetentionModal
        isOpen={showRetentionModal}
        onClose={() => setShowRetentionModal(false)}
        onSaved={loadData}
        retention={editingRetention}
      />

      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        onSaved={loadData}
        retentions={retentions}
        mode={viewingCertificate ? "view" : "create"}
        certificate={viewingCertificate}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={deletingRetention?.name || ""}
        loading={deleteLoading}
      />
    </AppLayout>
  );
}
