"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Users, 
  Mail, 
  Shield, 
  ArrowLeft, 
  UserPlus, 
  Trash2,
  Loader2,
  AlertCircle,
  X
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";

interface Member {
  id: string;
  userId: string;
  systemRole: string;
  roleId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  role: {
    id: string;
    name: string;
  } | null;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  _count: {
    memberships: number;
  };
}

export default function UsuariosConfigPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  
  // Modal de eliminación
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; member: Member | null }>({ open: false, member: null });

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await fetch("/api/memberships");
      return res.json();
    },
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await fetch("/api/roles");
      return res.json();
    },
  });

  useEffect(() => {
    fetch("/api/auth/session").then(res => res.json()).then(data => {
      if (data?.user?.email) {
        setCurrentUserEmail(data.user.email);
      }
    });
  }, []);

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; name: string; systemRole: string; password?: string; createAccount?: boolean }) => {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setShowInviteModal(false);
      showToast("success", "Usuario invitado exitosamente");
    },
    onError: (error: Error) => {
      showToast("error", error.message || "Error al invitar usuario");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/memberships/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      showToast("success", "Usuario eliminado exitosamente");
      setDeleteModal({ open: false, member: null });
    },
    onError: (error: Error) => {
      showToast("error", error.message || "Error al eliminar usuario");
    },
  });

  const handleDeleteClick = (member: Member) => {
    setDeleteModal({ open: true, member });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.member) {
      deleteMutation.mutate(deleteModal.member.id);
    }
  };

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, systemRole }: { id: string; systemRole: string }) => {
      const res = await fetch(`/api/memberships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemRole }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/configuracion" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
              <p className="text-slate-500 text-sm">Gestiona los colaboradores que tienen acceso a tu cuenta.</p>
            </div>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-xl font-semibold flex items-center gap-2 hover:opacity-90"
          >
            <UserPlus size={20} />
            Invitar usuario
          </button>
        </div>

      <div className="flex justify-between items-center bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900">Equipo actual</p>
            <p className="text-xs text-blue-700">{members.length} usuario(s) registrados en tu organización.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-border">
              <th className="px-8 py-4">Usuario</th>
              <th className="px-8 py-4">Rol del Sistema</th>
              <th className="px-8 py-4">Rol Personalizado</th>
              <th className="px-8 py-4 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => {
              const isCurrentUser = member.user.email === currentUserEmail;
              const initials = (member.user.name || member.user.email || "??")
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs shadow-inner">
                        {initials}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          {member.user.name || "Sin nombre"}
                          {isCurrentUser && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Tú</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center mt-0.5">
                          <Mail size={12} className="mr-1 opacity-60" /> {member.user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <Select
                      value={member.systemRole}
                      onChange={(val) => updateRoleMutation.mutate({ id: member.id, systemRole: val })}
                      disabled={isCurrentUser || updateRoleMutation.isPending}
                      options={[
                        { value: "ADMIN", label: "Administrador", description: "Acceso completo al sistema" },
                        { value: "CONTADOR", label: "Contador", description: "Gestión financiera" },
                        { value: "VENDEDOR", label: "Vendedor", description: "Ventas y clientes" },
                        { value: "USER", label: "Usuario", description: "Acceso básico" },
                      ]}
                      className="min-w-[160px]"
                    />
                  </td>
                  <td className="px-8 py-5">
                    <Select
                      value={member.roleId || ""}
                      onChange={async (val) => {
                        const res = await fetch(`/api/memberships/${member.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ roleId: val || null }),
                        });
                        if (res.ok) queryClient.invalidateQueries({ queryKey: ["members"] });
                      }}
                      options={[
                        { value: "", label: "— Sin rol —", description: "Sin permisos personalizados" },
                        ...roles.map((role) => ({ 
                          value: role.id, 
                          label: role.name,
                          description: role.description || undefined
                        })),
                      ]}
                      className="min-w-[160px]"
                    />
                  </td>
                  <td className="px-8 py-5">
                    {!isCurrentUser && (
                      <button
                        onClick={() => handleDeleteClick(member)}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {members.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">No hay usuarios en esta organización</p>
            <p className="text-sm text-slate-400">Invita a tu primer colaborador</p>
          </div>
        )}
      </div>

      {roles.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start space-x-4">
          <div className="p-2 bg-amber-500 rounded-lg text-white shrink-0">
            <Shield size={18} />
          </div>
          <div>
            <p className="font-bold text-amber-900 text-sm">No tienes roles personalizados</p>
            <p className="text-xs text-amber-700 mt-1">
              Para restringir el acceso de los usuarios, primero{" "}
              <Link href="/configuracion/roles/nuevo" className="font-bold underline underline-offset-2 hover:text-amber-900">
                crea un rol personalizado
              </Link>{" "}
              con los permisos que deseas.
            </p>
          </div>
        </div>
      )}

      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onInvite={(data) => inviteMutation.mutate(data)}
          isLoading={inviteMutation.isPending}
          error={inviteMutation.error?.message}
        />
      )}

      <ConfirmDialog
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, member: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar usuario"
        description={`¿Estás seguro de eliminar a ${deleteModal.member?.user.name || deleteModal.member?.user.email} de la organización? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
    </AppLayout>
  );
}

function InviteUserModal({ 
  onClose, 
  onInvite, 
  isLoading, 
  error 
}: { 
  onClose: () => void; 
  onInvite: (data: { email: string; name: string; systemRole: string; password?: string; createAccount?: boolean }) => void; 
  isLoading: boolean;
  error?: string;
}) {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [systemRole, setSystemRole] = useState("USER");
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createAccount && password !== confirmPassword) {
      showToast("error", "Las contraseñas no coinciden");
      return;
    }
    onInvite({ email, name, systemRole, password: createAccount ? password : undefined, createAccount });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              {createAccount ? "Crear usuario" : "Invitar usuario"}
            </h2>
            <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setCreateAccount(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  !createAccount ? "bg-white text-primary shadow-sm" : "text-slate-500"
                }`}
              >
                Invitar
              </button>
              <button
                type="button"
                onClick={() => setCreateAccount(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  createAccount ? "bg-white text-primary shadow-sm" : "text-slate-500"
                }`}
              >
                Crear usuario
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="juan@empresa.com"
                required
              />
            </div>

            {createAccount && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="••••••••"
                    required={createAccount}
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="••••••••"
                    required={createAccount}
                    minLength={6}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rol del sistema</label>
              <Select
                value={systemRole}
                onChange={(val) => setSystemRole(val)}
                options={[
                  { value: "ADMIN", label: "Administrador", description: "Acceso completo" },
                  { value: "CONTADOR", label: "Contador", description: "Gestión financiera" },
                  { value: "VENDEDOR", label: "Vendedor", description: "Ventas y clientes" },
                  { value: "USER", label: "Usuario", description: "Acceso básico" },
                ]}
                placeholder="Seleccionar rol..."
              />
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
              disabled={isLoading}
              className="flex-1 py-2 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  {createAccount ? "Crear" : "Invitar"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
