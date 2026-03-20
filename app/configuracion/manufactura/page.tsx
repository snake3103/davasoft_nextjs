"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Zap, 
  Save, 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  FileText, 
  Calculator,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  Settings
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProductAttribute {
  id: string;
  name: string;
  code: string;
  type: string;
  unit?: string;
  defaultValue?: string;
  options?: string;
  isRequired: boolean;
  isGlobal: boolean;
}

interface BoMItem {
  id: string;
  componentId: string;
  component: {
    id: string;
    name: string;
    sku: string;
    stock: number;
  };
  quantity: number;
  quantityFormula?: string;
  isOptional: boolean;
  scrapPercent: number;
}

interface BillOfMaterials {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  version: string;
  isActive: boolean;
  isDefault: boolean;
  totalCost: number;
  boMItems: BoMItem[];
}

export default function ManufacturaConfigPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"attributes" | "bom">("attributes");
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [showBomModal, setShowBomModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<ProductAttribute | null>(null);
  const [editingBom, setEditingBom] = useState<BillOfMaterials | null>(null);

  // Fetch attributes
  const { data: attributes = [], isLoading: loadingAttributes } = useQuery({
    queryKey: ["product-attributes"],
    queryFn: async () => {
      const res = await fetch("/api/products/attributes");
      return res.json();
    },
  });

  // Fetch BoMs
  const { data: boms = [], isLoading: loadingBoms } = useQuery({
    queryKey: ["boms"],
    queryFn: async () => {
      const res = await fetch("/api/products/bom");
      return res.json();
    },
  });

  // Fetch products for BoM
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      return res.json();
    },
  });

  // Create/Update attribute
  const saveAttribute = async (data: Partial<ProductAttribute>) => {
    const method = editingAttribute ? "PUT" : "POST";
    const url = editingAttribute 
      ? `/api/products/attributes/${editingAttribute.id}`
      : "/api/products/attributes";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error guardando atributo");
    return res.json();
  };

  // Delete attribute
  const deleteAttribute = async (id: string) => {
    const res = await fetch(`/api/products/attributes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Error eliminando atributo");
  };

  // Create/Update BoM
  const saveBom = async (data: any) => {
    const res = await fetch("/api/products/bom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error guardando BoM");
    return res.json();
  };

  // Delete BoM
  const deleteBom = async (id: string) => {
    const res = await fetch(`/api/products/bom/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Error eliminando BoM");
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/configuracion" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Settings className="text-primary" size={28} />
                Manufactura
            </h1>
            <p className="text-slate-500 text-sm">Configura atributos y listas de materiales (BoM).</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-border p-2 mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab("attributes")}
          className={cn(
            "flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
            activeTab === "attributes"
              ? "bg-primary text-white"
              : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <Package size={20} />
          Atributos
        </button>
        <button
          onClick={() => setActiveTab("bom")}
          className={cn(
            "flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
            activeTab === "bom"
              ? "bg-primary text-white"
              : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <FileText size={20} />
          Listas de Materiales (BoM)
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-border p-6">
        {activeTab === "attributes" ? (
          <AttributesTab
            attributes={attributes}
            isLoading={loadingAttributes}
            onAdd={() => {
              setEditingAttribute(null);
              setShowAttributeModal(true);
            }}
            onEdit={(attr) => {
              setEditingAttribute(attr);
              setShowAttributeModal(true);
            }}
            onDelete={deleteAttribute}
          />
        ) : (
          <BomTab
            boms={boms}
            products={products}
            isLoading={loadingBoms}
            onAdd={() => {
              setEditingBom(null);
              setShowBomModal(true);
            }}
            onEdit={(bom) => {
              setEditingBom(bom);
              setShowBomModal(true);
            }}
            onDelete={deleteBom}
          />
        )}
      </div>

      {/* Attribute Modal */}
      {showAttributeModal && (
        <AttributeModal
          attribute={editingAttribute}
          onClose={() => setShowAttributeModal(false)}
          onSave={async (data) => {
            await saveAttribute(data);
            queryClient.invalidateQueries({ queryKey: ["product-attributes"] });
            setShowAttributeModal(false);
          }}
        />
      )}

      {/* BoM Modal */}
      {showBomModal && (
        <BomModal
          bom={editingBom}
          products={products}
          onClose={() => setShowBomModal(false)}
          onSave={async (data) => {
            await saveBom(data);
            queryClient.invalidateQueries({ queryKey: ["boms"] });
            setShowBomModal(false);
          }}
        />
      )}
    </div>
    </AppLayout>
  );
}

// Attributes Tab Component
function AttributesTab({ 
  attributes, 
  isLoading, 
  onAdd, 
  onEdit, 
  onDelete 
}: {
  attributes: ProductAttribute[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (attr: ProductAttribute) => void;
  onDelete: (id: string) => void;
}) {
  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Atributos de Producto</h2>
          <p className="text-sm text-slate-500">Define atributos como ancho, alto, material, etc.</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-primary text-white rounded-xl font-semibold flex items-center gap-2 hover:opacity-90"
        >
          <Plus size={20} />
          Nuevo Atributo
        </button>
      </div>

      {attributes.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Package size={48} className="mx-auto mb-4 opacity-50" />
          <p>No hay atributos configurados</p>
          <p className="text-sm">Crea atributos para productos manufactureros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attributes.map((attr) => (
            <div key={attr.id} className="bg-slate-50 rounded-xl p-4 border border-border">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-800">{attr.name}</h3>
                  <code className="text-xs text-slate-500">{'{'}{attr.code}{'}'}</code>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-lg text-xs font-medium",
                  attr.type === "number" ? "bg-blue-100 text-blue-700" :
                  attr.type === "select" ? "bg-purple-100 text-purple-700" :
                  "bg-slate-100 text-slate-600"
                )}>
                  {attr.type}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onEdit(attr)}
                  className="flex-1 py-2 text-sm bg-white border border-border rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1"
                >
                  <Edit size={14} />
                  Editar
                </button>
                <button
                  onClick={() => onDelete(attr.id)}
                  className="flex-1 py-2 text-sm bg-white border border-border rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// BoM Tab Component
function BomTab({ 
  boms, 
  products,
  isLoading, 
  onAdd, 
  onEdit, 
  onDelete 
}: {
  boms: BillOfMaterials[];
  products: any[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (bom: BillOfMaterials) => void;
  onDelete: (id: string) => void;
}) {
  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Listas de Materiales (BoM)</h2>
          <p className="text-sm text-slate-500">Define qué materiales se necesitan para fabricar cada producto.</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-primary text-white rounded-xl font-semibold flex items-center gap-2 hover:opacity-90"
        >
          <Plus size={20} />
          Nueva BoM
        </button>
      </div>

      {boms.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p>No hay listas de materiales</p>
          <p className="text-sm">Crea BoMs para productos manufactureros</p>
        </div>
      ) : (
        <div className="space-y-4">
          {boms.map((bom) => (
            <div key={bom.id} className="bg-slate-50 rounded-xl p-4 border border-border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-800">{bom.product.name}</h3>
                  <p className="text-sm text-slate-500">Versión: {bom.version}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-xs font-medium",
                    bom.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  )}>
                    {bom.isActive ? "Activo" : "Inactivo"}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    ${Number(bom.totalCost).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-slate-500 mb-2">Materiales:</p>
                <div className="flex flex-wrap gap-2">
                  {bom.boMItems?.slice(0, 5).map((item) => (
                    <span key={item.id} className="px-2 py-1 bg-slate-100 rounded text-xs">
                      {item.component.name} ({item.quantity})
                    </span>
                  ))}
                  {bom.boMItems?.length > 5 && (
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-500">
                      +{bom.boMItems.length - 5} más
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(bom)}
                  className="flex-1 py-2 text-sm bg-white border border-border rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1"
                >
                  <Edit size={14} />
                  Editar
                </button>
                <button
                  onClick={() => onDelete(bom.id)}
                  className="flex-1 py-2 text-sm bg-white border border-border rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Attribute Modal
function AttributeModal({ 
  attribute, 
  onClose, 
  onSave 
}: { 
  attribute: ProductAttribute | null; 
  onClose: () => void; 
  onSave: (data: Partial<ProductAttribute>) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    name: attribute?.name || "",
    code: attribute?.code || "",
    type: attribute?.type || "number",
    unit: attribute?.unit || "",
    defaultValue: attribute?.defaultValue || "",
    options: attribute?.options || "",
    isRequired: attribute?.isRequired || false,
    isGlobal: attribute?.isGlobal ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
              await onSave({
                ...formData,
                options: formData.type === "select" ? formData.options.split(",").map(s => s.trim()).join(",") : undefined,
              });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-slate-800">
              {attribute ? "Editar Atributo" : "Nuevo Atributo"}
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-xl"
                placeholder="Ancho"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código (variable)</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s/g, "_") })}
                className="w-full px-4 py-2 border border-border rounded-xl"
                placeholder="width"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Usa este código en las fórmulas: {'{'}code{'}'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-xl"
              >
                <option value="number">Número</option>
                <option value="text">Texto</option>
                <option value="select">Selección</option>
                <option value="boolean">Sí/No</option>
              </select>
            </div>

            {formData.type === "number" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-xl"
                  placeholder="m, cm, kg, etc."
                />
              </div>
            )}

            {formData.type === "select" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Opciones (separadas por coma)</label>
                <input
                  type="text"
                  value={formData.options}
                  onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-xl"
                  placeholder="Opción 1, Opción 2, Opción 3"
                />
              </div>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isRequired}
                onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700">Requerido</span>
            </label>
          </div>

          <div className="px-6 py-4 border-t border-border flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-border rounded-xl hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// BoM Modal
function BomModal({ 
  bom, 
  products,
  onClose, 
  onSave 
}: { 
  bom: BillOfMaterials | null; 
  products: any[];
  onClose: () => void; 
  onSave: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    productId: bom?.productId || "",
    version: bom?.version || "1.0",
    isActive: bom?.isActive ?? true,
    isDefault: bom?.isDefault ?? false,
    items: bom?.boMItems?.map(item => ({
      componentId: item.componentId,
      quantity: item.quantity,
      quantityFormula: item.quantityFormula || "",
      isOptional: item.isOptional,
      scrapPercent: item.scrapPercent,
    })) || [],
  });

  const [saving, setSaving] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [newItem, setNewItem] = useState({
    componentId: "",
    quantity: 1,
    quantityFormula: "",
    isOptional: false,
    scrapPercent: 0,
  });

  const addItem = () => {
    if (!newItem.componentId) return;
    setFormData({
      ...formData,
      items: [...formData.items, { ...newItem }],
    });
    setNewItem({
      componentId: "",
      quantity: 1,
      quantityFormula: "",
      isOptional: false,
      scrapPercent: 0,
    });
    setShowItemForm(false);
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || formData.items.length === 0) return;
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const finishedProducts = products.filter((p: any) => p.productType === "FINISHED" || p.productType === "CONFIGURABLE");
  const rawMaterials = products.filter((p: any) => p.productType === "RAW");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-slate-800">
              {bom ? "Editar BoM" : "Nueva Lista de Materiales"}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Producto a Fabricar</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-xl"
                required
              >
                <option value="">Seleccionar producto...</option>
                {finishedProducts.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Versión</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-xl"
                  placeholder="1.0"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Activo</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Por defecto</span>
                </label>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-slate-800">Materiales</h3>
                <button
                  type="button"
                  onClick={() => setShowItemForm(true)}
                  className="text-sm text-primary hover:underline"
                >
                  + Agregar material
                </button>
              </div>

              {showItemForm && (
                <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3">
                  <select
                    value={newItem.componentId}
                    onChange={(e) => setNewItem({ ...newItem, componentId: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-xl"
                  >
                    <option value="">Seleccionar material...</option>
                    {rawMaterials.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                  
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Cantidad (o fórmula)</label>
                    <input
                      type="text"
                      value={newItem.quantityFormula || ""}
                      onChange={(e) => setNewItem({ 
                        ...newItem, 
                        quantityFormula: e.target.value,
                        quantity: e.target.value ? 0 : newItem.quantity 
                      })}
                      className="w-full px-4 py-2 border border-border rounded-xl"
                      placeholder="{width} * {height} / 10000"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Deja vacío para cantidad fija, o usa fórmulas como: {'{'}width{'}'} * {'{'}height{'}'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex-1 py-2 bg-primary text-white rounded-lg text-sm"
                    >
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowItemForm(false)}
                      className="py-2 px-4 border border-border rounded-lg text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {formData.items.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No hay materiales agregados</p>
              ) : (
                <div className="space-y-2">
                  {formData.items.map((item, index) => {
                    const product = products.find((p: any) => p.id === item.componentId);
                    return (
                      <div key={index} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                        <div>
                          <p className="font-medium text-slate-800">{product?.name || item.componentId}</p>
                          <p className="text-sm text-slate-500">
                            {item.quantityFormula ? (
                              <span className="font-mono text-blue-600">{item.quantityFormula}</span>
                            ) : (
                              <span>Cantidad: {item.quantity}</span>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-border rounded-xl hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !formData.productId || formData.items.length === 0}
              className="flex-1 py-2 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar BoM"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
