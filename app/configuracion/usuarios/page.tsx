"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Plus, Users, Mail, Shield, MoreVertical, Edit, Trash, ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const initialUsers = [
  { id: 1, name: "Admin Principal", email: "admin@miempresa.com", role: "Administrador", status: "Activo", avatar: "AP" },
  { id: 2, name: "Sandra Gómez", email: "sandra.g@miempresa.com", role: "Contador", status: "Activo", avatar: "SG" },
  { id: 3, name: "Carlos Ruiz", email: "carlos.r@miempresa.com", role: "Vendedor", status: "Invitación Pendiente", avatar: "CR" },
];

export default function UsuariosConfigPage() {
  const [users] = useState(initialUsers);

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-8 pb-20">
        <div className="flex items-center space-x-4">
           <Link href="/configuracion" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
              <ArrowLeft size={20} />
           </Link>
           <div>
              <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
              <p className="text-slate-500 text-sm">Gestiona los colaboradores que tienen acceso a tu cuenta.</p>
           </div>
        </div>

        <div className="flex justify-between items-center bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
           <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                 <Users size={24} />
              </div>
              <div>
                 <p className="text-sm font-bold text-blue-900">Plan actual: Pyme</p>
                 <p className="text-xs text-blue-700">Has usado 3 de 5 usuarios disponibles.</p>
              </div>
           </div>
           <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center shadow-lg shadow-primary/25 hover:opacity-90 transition-all">
              <UserPlus size={18} className="mr-2" /> Invitar Usuario
           </button>
        </div>

        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-border">
                    <th className="px-8 py-4">Usuario</th>
                    <th className="px-8 py-4">Rol</th>
                    <th className="px-8 py-4">Estado</th>
                    <th className="px-8 py-4 text-right">Acciones</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-border">
                 {users.map((user) => (
                   <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-5">
                         <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs shadow-inner">
                               {user.avatar}
                            </div>
                            <div>
                               <p className="font-bold text-slate-800">{user.name}</p>
                               <p className="text-xs text-slate-500 flex items-center mt-0.5">
                                  <Mail size={12} className="mr-1 opacity-60" /> {user.email}
                               </p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center text-sm font-medium text-slate-600">
                            <Shield size={14} className="mr-2 text-slate-400" /> {user.role}
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                            user.status === "Activo" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                         )}>
                            {user.status}
                         </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"><Edit size={16} /></button>
                            <button className="p-2 hover:bg-rose-100 rounded-lg text-rose-500 transition-colors"><Trash size={16} /></button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </AppLayout>
  );
}
