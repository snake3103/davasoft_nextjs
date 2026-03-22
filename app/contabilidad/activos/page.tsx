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
  Eye,
  Pencil,
  Trash2,
  Calculator,
  Download,
  X,
  AlertCircle,
  TrendingDown,
  Building2,
  Wrench,
  Package
} from "lucide-react";
import {
  getFixedAssets,
  getAssetCategories,
  getAssetStats,
  createFixedAsset,
  updateFixedAsset,
  deleteFixedAsset,
  getFixedAsset,
  generateDepreciationEntries,
  DepreciationMethod,
  AssetStatus,
  AssetStats,
} from "@/app/actions/fixed-assets";

// ============================================
// Modal de Crear/Editar Activo
// ============================================
function AssetModal({
  isOpen,
  onClose,
  onSaved,
  asset,
  categories,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  asset?: any;
  categories: any[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    categoryId: "",
    location: "",
    acquisitionDate: new Date().toISOString().split("T")[0],
    acquisitionCost: 0,
    salvageValue: 0,
    usefulLifeYears: 5,
    depreciationMethod: "STRAIGHT_LINE" as DepreciationMethod,
    notes: "",
  });
  const [previewDepreciation, setPreviewDepreciation] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (asset) {
        setFormData({
          code: asset.code,
          name: asset.name,
          description: asset.description || "",
          categoryId: asset.categoryId,
          location: asset.location || "",
          acquisitionDate: new Date(asset.acquisitionDate).toISOString().split("T")[0],
          acquisitionCost: Number(asset.acquisitionCost),
          salvageValue: Number(asset.salvageValue),
          usefulLifeYears: asset.usefulLifeYears || 5,
          depreciationMethod: asset.depreciationMethod,
          notes: asset.notes || "",
        });
      } else {
        setFormData({
          code: "",
          name: "",
          description: "",
          categoryId: categories[0]?.id || "",
          location: "",
          acquisitionDate: new Date().toISOString().split("T")[0],
          acquisitionCost: 0,
          salvageValue: 0,
          usefulLifeYears: 5,
          depreciationMethod: "STRAIGHT_LINE",
          notes: "",
        });
      }
      setPreviewDepreciation(null);
      setError(null);
    }
  }, [isOpen, asset, categories]);

  const calculatePreview = () => {
    const depreciableAmount = formData.acquisitionCost - formData.salvageValue;
    const years = formData.usefulLifeYears || 1;
    let monthlyDep = 0;

    switch (formData.depreciationMethod) {
      case "STRAIGHT_LINE":
        monthlyDep = depreciableAmount / (years * 12);
        break;
      case "DECLINING_BALANCE":
        const rate = 2 / years;
        monthlyDep = formData.acquisitionCost * (rate / 12);
        break;
      case "SUM_OF_YEARS_DIGITS":
        const sumOfYears = (years * (years + 1)) / 2;
        monthlyDep = (depreciableAmount * years) / sumOfYears / 12;
        break;
    }

    setPreviewDepreciation(Math.max(0, monthlyDep));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = {
        code: formData.code,
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId,
        location: formData.location || undefined,
        acquisitionDate: new Date(formData.acquisitionDate),
        acquisitionCost: formData.acquisitionCost,
        salvageValue: formData.salvageValue,
        usefulLifeYears: formData.usefulLifeYears,
        depreciationMethod: formData.depreciationMethod,
        notes: formData.notes || undefined,
      };

      if (asset) {
        await updateFixedAsset(asset.id, data);
      } else {
        await createFixedAsset("default-org", data);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 size={20} className="text-primary" />
            {asset ? "Editar Activo Fijo" : "Nuevo Activo Fijo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Datos básicos */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Datos del Activo
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">
                  Código *
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="AF-001"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">
                  Nombre *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del activo"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">
                  Categoría *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">
                  Ubicación
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Oficina principal"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del activo..."
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Datos de adquisición */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Datos de Adquisición
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">
                  Fecha de Adquisición *
                </label>
                <Input
                  type="date"
                  value={formData.acquisitionDate}
                  onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">
                  Costo de Adquisición *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.acquisitionCost}
                  onChange={(e) => setFormData({ ...formData, acquisitionCost: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">
                  Valor Residual
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.salvageValue}
                  onChange={(e) => setFormData({ ...formData, salvageValue: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">
                  Vida Útil (años)
                </label>
                <Input
                  type="number"
                  value={formData.usefulLifeYears}
                  onChange={(e) => setFormData({ ...formData, usefulLifeYears: parseInt(e.target.value) || 1 })}
                  min={1}
                  max={100}
                />
              </div>
            </div>
          </div>

          {/* Método de depreciación */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Depreciación
            </h3>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">
                Método de Depreciación
              </label>
              <select
                value={formData.depreciationMethod}
                onChange={(e) => setFormData({ ...formData, depreciationMethod: e.target.value as DepreciationMethod })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="STRAIGHT_LINE">Línea Recta</option>
                <option value="SUM_OF_YEARS_DIGITS">Suma de Dígitos</option>
                <option value="DECLINING_BALANCE">Saldo Decreciente</option>
              </select>
            </div>

            {/* Preview de depreciación */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={calculatePreview} className="flex-1">
                <Calculator size={16} />
                Calcular Preview
              </Button>
            </div>

            {previewDepreciation !== null && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                  <TrendingDown size={16} className="text-primary" />
                  Depreciación Mensual Estimada
                </div>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(previewDepreciation)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Depreciación anual: {formatCurrency(previewDepreciation * 12)}
                </p>
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales..."
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : asset ? "Actualizar" : "Crear Activo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Modal de Reporte de Depreciación
// ============================================
function DepreciationReportModal({
  isOpen,
  onClose,
  assets,
}: {
  isOpen: boolean;
  onClose: () => void;
  assets: any[];
}) {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const calculateDepreciation = (asset: any) => {
    const depreciableAmount = Number(asset.acquisitionCost) - Number(asset.salvageValue);
    const years = asset.usefulLifeYears || asset.category.usefulLifeYears;
    let monthlyDep = 0;

    switch (asset.depreciationMethod) {
      case "STRAIGHT_LINE":
        monthlyDep = depreciableAmount / (years * 12);
        break;
      case "SUM_OF_YEARS_DIGITS":
        const sumOfYears = (years * (years + 1)) / 2;
        monthlyDep = (depreciableAmount * years) / sumOfYears / 12;
        break;
      case "DECLINING_BALANCE":
        const rate = 2 / years;
        monthlyDep = Number(asset.currentValue) * (rate / 12);
        break;
    }

    return monthlyDep;
  };

  const totalDepreciation = useMemo(() => {
    return assets
      .filter((a) => a.status === "ACTIVE")
      .reduce((sum, asset) => sum + calculateDepreciation(asset), 0);
  }, [assets]);

  const handleGenerateEntries = async () => {
    setLoading(true);
    try {
      await generateDepreciationEntries("default-org", period);
      alert("Asientos de depreciación generados exitosamente");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      STRAIGHT_LINE: "Línea Recta",
      SUM_OF_YEARS_DIGITS: "Suma de Dígitos",
      DECLINING_BALANCE: "Saldo Decreciente",
    };
    return labels[method] || method;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            Reporte de Depreciación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selector de período */}
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">
                Período
              </label>
              <Input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Total Depreciación Período
              </div>
              <p className="text-2xl font-bold text-rose-600">
                {formatCurrency(totalDepreciation)}
              </p>
            </div>
          </div>

          {/* Tabla de depreciación */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-border">
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Código
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Activo
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Método
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Valor Actual
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Dep. Mensual
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Dep. Acumulada
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Valor Neto
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assets
                    .filter((a) => a.status === "ACTIVE")
                    .map((asset) => {
                      const monthlyDep = calculateDepreciation(asset);
                      return (
                        <tr key={asset.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-sm">
                            {asset.code}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-slate-800">
                              {asset.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {asset.category.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {getMethodLabel(asset.depreciationMethod)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {formatCurrency(Number(asset.acquisitionCost))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-rose-600">
                            {formatCurrency(monthlyDep)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-rose-600">
                            {formatCurrency(Number(asset.accumulatedDepreciation))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                            {formatCurrency(Number(asset.currentValue))}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-border">
                    <td colSpan={4} className="px-4 py-3 text-sm font-bold text-slate-700">
                      TOTALES
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-rose-600 text-right">
                      {formatCurrency(totalDepreciation)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-rose-600 text-right">
                      {formatCurrency(
                        assets
                          .filter((a) => a.status === "ACTIVE")
                          .reduce(
                            (sum, a) => sum + Number(a.accumulatedDepreciation),
                            0
                          )
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                      {formatCurrency(
                        assets
                          .filter((a) => a.status === "ACTIVE")
                          .reduce((sum, a) => sum + Number(a.currentValue), 0)
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handleGenerateEntries} isLoading={loading}>
            <Calculator size={16} />
            Generar Asientos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Badge de Estado
// ============================================
function StatusBadge({ status }: { status: AssetStatus }) {
  const config: Record<AssetStatus, { label: string; color: string; icon: any }> = {
    ACTIVE: { label: "Activo", color: "bg-emerald-100 text-emerald-700", icon: Package },
    IN_REPAIR: { label: "En Reparación", color: "bg-amber-100 text-amber-700", icon: Wrench },
    IN_STORAGE: { label: "Almacenado", color: "bg-slate-100 text-slate-600", icon: Package },
    DISPOSED: { label: "Dado de Baja", color: "bg-rose-100 text-rose-600", icon: X },
    SOLD: { label: "Vendido", color: "bg-blue-100 text-blue-700", icon: FileText },
  };

  const { label, color, icon: Icon } = config[status];

  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit",
        color
      )}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

// ============================================
// Confirmación de eliminación
// ============================================
function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  assetName,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assetName: string;
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
            ¿Está seguro que desea eliminar el activo{" "}
            <strong>{assetName}</strong>? Esta acción no se puede deshacer.
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
export default function FixedAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<AssetStats>({
    totalAssets: 0,
    totalValue: 0,
    accumulatedDepreciation: 0,
    netValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [deletingAsset, setDeletingAsset] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetsData, categoriesData, statsData] = await Promise.all([
        getFixedAssets("default-org", {
          search: search || undefined,
          status: statusFilter,
          categoryId: categoryFilter || undefined,
        }),
        getAssetCategories("default-org"),
        getAssetStats("default-org"),
      ]);
      setAssets(assetsData);
      setCategories(categoriesData);
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
  }, [search, statusFilter, categoryFilter]);

  const handleCreate = () => {
    setEditingAsset(null);
    setShowModal(true);
  };

  const handleEdit = (asset: any) => {
    setEditingAsset(asset);
    setShowModal(true);
  };

  const handleDelete = (asset: any) => {
    setDeletingAsset(asset);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingAsset) return;
    setDeleteLoading(true);
    try {
      await deleteFixedAsset(deletingAsset.id);
      setShowDeleteModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <Building2 className="text-primary" size={28} />
              Activos Fijos
            </h1>
            <p className="text-slate-500 mt-1">Control y depreciación de activos</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowReportModal(true)}>
              <FileText size={18} />
              Reporte
            </Button>
            <Button onClick={handleCreate}>
              <Plus size={18} />
              Nuevo Activo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Total Activos
            </p>
            <p className="text-2xl font-black text-slate-800">{stats.totalAssets}</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Valor Total
            </p>
            <p className="text-2xl font-black text-slate-800">
              {formatCurrency(stats.totalValue)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Depreciación Acumulada
            </p>
            <p className="text-2xl font-black text-rose-600">
              {formatCurrency(stats.accumulatedDepreciation)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Valor Neto
            </p>
            <p className="text-2xl font-black text-emerald-600">
              {formatCurrency(stats.netValue)}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full bg-white px-4 py-2.5 rounded-xl border border-border flex items-center shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="text-slate-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none py-1 text-sm focus:ring-0 outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AssetStatus | "all")}
            className="bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="IN_REPAIR">En reparación</option>
            <option value="IN_STORAGE">Almacenados</option>
            <option value="DISPOSED">Dados de baja</option>
            <option value="SOLD">Vendidos</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw size={16} />
          </Button>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw size={32} className="animate-spin mx-auto mb-4" />
            <p>Cargando activos...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <AlertCircle size={32} className="text-rose-500 mx-auto mb-4" />
            <p className="text-rose-600 font-medium">{error}</p>
            <Button variant="outline" className="mt-4" onClick={loadData}>
              Reintentar
            </Button>
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-20 text-center">
            <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
              <Building2 size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No hay activos fijos</h3>
            <p className="text-slate-500 mt-2 mb-6">
              Comienza agregando tu primer activo fijo.
            </p>
            <Button onClick={handleCreate}>
              <Plus size={18} />
              Crear Activo
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-border">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Código
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Categoría
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Fecha Adquisición
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Costo
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Depreciación
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Valor Neto
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-sm font-medium text-slate-800">
                        {asset.code}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-800">
                          {asset.name}
                        </div>
                        {asset.location && (
                          <div className="text-xs text-slate-400">
                            {asset.location}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {asset.category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(asset.acquisitionDate)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-800 text-right">
                        {formatCurrency(Number(asset.acquisitionCost))}
                      </td>
                      <td className="px-6 py-4 text-sm text-rose-600 text-right">
                        {formatCurrency(Number(asset.accumulatedDepreciation))}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">
                        {formatCurrency(Number(asset.currentValue))}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={asset.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(asset)}
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(asset)}
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
          </div>
        )}
      </div>

      {/* Modales */}
      <AssetModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSaved={loadData}
        asset={editingAsset}
        categories={categories}
      />

      <DepreciationReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        assets={assets}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        assetName={deletingAsset?.name || ""}
        loading={deleteLoading}
      />
    </AppLayout>
  );
}
