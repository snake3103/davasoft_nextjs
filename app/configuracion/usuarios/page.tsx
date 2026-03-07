import { AppLayout } from "@/components/layout/AppLayout";
import { Users, Mail, Shield, ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AssignRoleSelect } from "./AssignRoleSelect";

export default async function UsuariosConfigPage() {
   const session = await auth();
   if (!session?.user?.organizationId) {
      redirect("/login");
   }

   const orgId = session.user.organizationId;

   // Obtener miembros de la organización con sus datos de usuario y rol custom
   const members = await prisma.membership.findMany({
      where: { organizationId: orgId },
      include: {
         user: { select: { id: true, name: true, email: true, image: true } },
         // @ts-ignore
         role: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
   });

   // Obtener roles disponibles para asignar
   // @ts-ignore
   const availableRoles = await (prisma as any).role.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
   });

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
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                     {members.map((member: any) => {
                        const user = member.user;
                        const initials = (user.name || user.email || "??")
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
                                       <p className="font-bold text-slate-800">{user.name || "Sin nombre"}</p>
                                       <p className="text-xs text-slate-500 flex items-center mt-0.5">
                                          <Mail size={12} className="mr-1 opacity-60" /> {user.email}
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center text-sm font-medium text-slate-600">
                                    <Shield size={14} className="mr-2 text-slate-400" />
                                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${member.systemRole === "ADMIN"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-slate-100 text-slate-600"
                                       }`}>
                                       {member.systemRole}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <AssignRoleSelect
                                    membershipId={member.id}
                                    currentRoleId={member.roleId || ""}
                                    currentRoleName={member.role?.name || ""}
                                    availableRoles={availableRoles}
                                 />
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>

            {availableRoles.length === 0 && (
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
         </div>
      </AppLayout>
   );
}
