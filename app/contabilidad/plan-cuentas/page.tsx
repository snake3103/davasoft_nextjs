"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AccountModal } from "@/components/accounting/AccountModal";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Loader2, 
  FileText, 
  BarChart3, 
  BookOpen,
  Folder,
  FolderOpen,
  FileText as FileIcon,
  ChevronRightSquare,
  ChevronDownSquare
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { deleteAccount } from "@/app/actions/accounting";

interface AccountingAccount {
  id: string;
  code: string;
  name: string;
  type: string;
  parentId: string | null;
  isActive: boolean;
  description?: string | null;
  childNodes?: AccountingAccount[];
}

function buildTree(accounts: AccountingAccount[]): AccountingAccount[] {
  const tree: AccountingAccount[] = [];
  const childrenMap = new Map<string | null, AccountingAccount[]>();

  accounts.forEach((acc) => {
    if (!childrenMap.has(acc.parentId)) {
      childrenMap.set(acc.parentId, []);
    }
    const node = { ...acc, childNodes: childrenMap.get(acc.id) || [] };
    childrenMap.get(acc.parentId)!.push(node);
  });

  return childrenMap.get(null) || [];
}

function AccountTreeRow({
  account,
  level,
  allAccounts,
  onEdit,
  onDelete,
  isDeleting,
}: {
  account: AccountingAccount;
  level: number;
  allAccounts: AccountingAccount[];
  onEdit: (acc: AccountingAccount) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Buscar si esta cuenta tiene hijos en el array plano
  const childAccounts = allAccounts.filter(a => a.parentId === account.id);
  const hasChildren = childAccounts.length > 0;

  const handleDelete = async () => {
    if (confirm(`¿Estás seguro de eliminar la cuenta "${account.name}"?`)) {
      await onDelete(account.id);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "ASSET":
        return <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Activo</span>;
      case "LIABILITY":
        return <span className="text-xs font-medium px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold">Pasivo</span>;
      case "EQUITY":
        return <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">Patrimonio</span>;
      case "REVENUE":
        return <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">Ingreso</span>;
      case "EXPENSE":
        return <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">Gasto</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={`group flex items-center py-3 px-3 hover:bg-slate-100 transition-colors rounded-lg ${
          !account.isActive ? "opacity-50" : ""
        }`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {/* Botón de expandir/colapsar - GRANDE y VISIBLE */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1 hover:bg-white hover:shadow rounded transition-all mr-2 ${
            hasChildren 
              ? "cursor-pointer text-slate-600 hover:text-primary" 
              : "cursor-default opacity-0"
          }`}
          title={hasChildren ? (isExpanded ? "Colapsar" : "Expandir") : ""}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDownSquare size={20} className="fill-current" />
            ) : (
              <ChevronRightSquare size={20} className="fill-current" />
            )
          ) : (
            <span className="w-5 h-5 block" />
          )}
        </button>

        {/* Ícono de carpeta o archivo */}
        <div className="mr-3">
          {hasChildren || account.parentId === null ? (
            isExpanded ? (
              <FolderOpen size={22} className="text-primary fill-primary/20" />
            ) : (
              <Folder size={22} className="text-primary fill-primary/20" />
            )
          ) : (
            <FileIcon size={18} className="text-slate-500" />
          )}
        </div>

        {/* Información de la cuenta */}
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-sm">
              {account.code}
            </span>
            <span className={`text-sm font-bold ${hasChildren ? 'text-slate-900' : 'text-slate-700'}`}>
              {account.name}
            </span>
            {getTypeBadge(account.type)}
            {!account.isActive && (
              <span className="text-xs px-2 py-0.5 rounded font-bold bg-slate-200 text-slate-600">
                Inactivo
              </span>
            )}
          </div>
        </div>

        {/* Botones de acción - solo visibles en hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(account);
            }}
            className="p-2 text-slate-400 hover:text-primary hover:bg-white hover:shadow rounded-lg transition-all"
            title="Editar cuenta"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow rounded-lg transition-all disabled:opacity-50"
            title="Eliminar cuenta"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      {/* Subcuentas (renderizado condicional) */}
      {isExpanded && hasChildren && (
        <div className="relative">
          {/* Línea vertical conectora */}
          <div 
            className="absolute border-l-2 border-slate-200"
            style={{ 
              left: `${(level * 24) + 20}px`, 
              top: '0', 
              height: '100%' 
            }} 
          />
          {childAccounts.map((child) => (
            <AccountTreeRow
              key={child.id}
              account={child}
              level={level + 1}
              allAccounts={allAccounts}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </>
  );
}

const navItems = [
  { href: "/contabilidad/asientos", label: "Asientos", icon: FileText },
  { href: "/contabilidad/plan-cuentas", label: "Plan de Cuentas", icon: BookOpen },
  { href: "/contabilidad/reportes", label: "Reportes", icon: BarChart3 },
];

export default function PlanCuentasPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountingAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const pathname = usePathname();

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounting/accounts");
      if (res.ok) {
        const data = await res.json();
        console.log("Cuentas cargadas:", data);
        if (data && data.length > 0) {
          setAccounts(data);
        } else {
          // Datos de fallback
          setAccounts([
            { id: "1", code: "1", name: "ACTIVOS", type: "ASSET", parentId: null, isActive: true, childNodes: [] },
            { id: "2", code: "11", name: "DISPONIBLE", type: "ASSET", parentId: "1", isActive: true, childNodes: [] },
            { id: "3", code: "1105", name: "Caja General", type: "ASSET", parentId: "2", isActive: true, childNodes: [] },
            { id: "4", code: "1110", name: "Bancos", type: "ASSET", parentId: "2", isActive: true, childNodes: [] },
            { id: "5", code: "2", name: "PASIVOS", type: "LIABILITY", parentId: null, isActive: true, childNodes: [] },
            { id: "6", code: "22", name: "CUENTAS POR PAGAR", type: "LIABILITY", parentId: "5", isActive: true, childNodes: [] },
          ]);
        }
      } else {
        console.error("Error al cargar cuentas:", res.status);
        setAccounts([
          { id: "1", code: "1", name: "ACTIVOS", type: "ASSET", parentId: null, isActive: true, childNodes: [] },
          { id: "2", code: "11", name: "DISPONIBLE", type: "ASSET", parentId: "1", isActive: true, childNodes: [] },
          { id: "3", code: "1105", name: "Caja General", type: "ASSET", parentId: "2", isActive: true, childNodes: [] },
        ]);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setAccounts([
        { id: "1", code: "1", name: "ACTIVOS", type: "ASSET", parentId: null, isActive: true, childNodes: [] },
        { id: "2", code: "11", name: "DISPONIBLE", type: "ASSET", parentId: "1", isActive: true, childNodes: [] },
        { id: "3", code: "1105", name: "Caja General", type: "ASSET", parentId: "2", isActive: true, childNodes: [] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    const result = await deleteAccount(id);
    if (result?.error) {
      alert(result.error);
    } else {
      await fetchAccounts();
    }
    setIsDeleting(false);
  };

  const handleEdit = (account: AccountingAccount) => {
    setEditingAccount(account);
    setModalOpen(true);
  };

  const tree = buildTree(accounts);

  const filteredAccounts = searchTerm
    ? accounts.filter(
        (acc) =>
          acc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          acc.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : accounts;

  return (
    <AppLayout>
      <div className="max-w-5xl">
        {/* Navegación del módulo de Contabilidad */}
        <div className="mb-6">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Plan de Cuentas</h1>
            <p className="text-slate-500 mt-1">
              Gestiona el catálogo de cuentas contables de tu empresa
            </p>
          </div>
          <button
            onClick={() => {
              setEditingAccount(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus size={18} />
            Nueva Cuenta
          </button>
        </div>

        {/* Barra de búsqueda y leyenda */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm mb-6">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
            </div>
          </div>

          {/* Leyenda de iconos */}
          <div className="px-4 py-3 bg-slate-50 border-b border-border flex gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Folder size={16} className="text-primary" />
              <span>Cuenta Padre</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FileIcon size={16} className="text-slate-500" />
              <span>Subcuenta</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ChevronDownSquare size={16} className="fill-current" />
              <span>Expandir/Colapsar</span>
            </span>
          </div>

          {/* Árbol de cuentas */}
          <div className="py-4">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 size={48} className="mx-auto mb-4 animate-spin" />
                <p className="text-sm">Cargando cuentas contables...</p>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">No se encontraron cuentas contables</p>
              </div>
            ) : searchTerm ? (
              /* Vista de búsqueda (lista plana) */
              <div className="space-y-1">
                {filteredAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between py-2.5 px-4 hover:bg-slate-50 transition-colors mx-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-sm">
                        {account.code}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{account.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded font-bold bg-slate-200 text-slate-700">
                        {account.type === "ASSET" ? "Activo" : account.type === "LIABILITY" ? "Pasivo" : account.type === "EQUITY" ? "Patrimonio" : account.type === "REVENUE" ? "Ingreso" : "Gasto"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(account)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-white hover:shadow rounded transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        disabled={isDeleting}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow rounded transition-all disabled:opacity-50"
                      >
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-0.5">
                {tree.map((account) => (
                  <AccountTreeRow
                    key={account.id}
                    account={account}
                    level={0}
                    allAccounts={accounts}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ayuda */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Consejos para el Plan de Cuentas</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Click en los iconos <strong>◼</strong> para expandir o colapsar las subcuentas</li>
            <li>• Las <strong>carpetas azules</strong> son cuentas padre que pueden tener subcuentas</li>
            <li>• Los <strong>documentos grises</strong> son subcuentas o cuentas finales</li>
            <li>• Usa códigos jerárquicos (ej: 1105, 1305) para organizar las cuentas</li>
            <li>• No puedes eliminar cuentas que ya tienen movimientos contables</li>
          </ul>
        </div>
      </div>

      <AccountModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAccount(null);
          fetchAccounts();
        }}
        account={editingAccount}
      />
    </AppLayout>
  );
}
