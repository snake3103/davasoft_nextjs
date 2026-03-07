import { AppLayout } from "@/components/layout/AppLayout";
import { Shield, ChevronRight, CheckCircle2, ArrowLeft, Lock, Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function RolesConfigPage() {
   const session = await auth();
   if (!session?.user?.organizationId) {
      redirect("/login");
   }

   // Obtener roles de la organización y contar cuántos usuarios (memberships) lo tienen asignado
   // @ts-ignore - Prisma types cache may be stale after schema update
   const dbRoles = await (prisma as any).role.findMany({
      where: { organizationId: session.user.organizationId },
      include: {
         _count: {
            select: { memberships: true }
         }
      },
      orderBy: { createdAt: "asc" }
   });

   return (
      <AppLayout>
         <div className="max-w-4xl space-y-8 pb-20">
            <div className="flex items-center space-x-4">
               <Link href="/configuracion" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                  <ArrowLeft size={20} />
               </Link>
               <div>
                  <h1 className="text-2xl font-bold text-slate-800">Roles y Permisos</h1>
                  <p className="text-slate-500 text-sm">Define los perfiles de acceso para tus colaboradores.</p>
               </div>
            </div>

            <div className="flex justify-end">
               <Link href="/configuracion/roles/nuevo" className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors">
                  <Plus size={18} className="mr-2" /> Nuevo Rol
               </Link>
            </div>

            <div className="space-y-4">
               {dbRoles.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                     <Shield className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                     <h3 className="text-lg font-bold text-slate-800">No hay roles personalizados</h3>
                     <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Comienza creando roles para restringir qué pueden ver y editar los miembros de tu equipo.</p>
                  </div>
               ) : (
                  dbRoles.map((role: any) => (
                     <Link href={`/configuracion/roles/${role.id}/editar`} key={role.id} className="bg-white rounded-3xl border border-border p-6 flex items-center justify-between hover:border-primary/30 transition-all cursor-pointer group shadow-sm block">
                        <div className="flex items-center space-x-6">
                           <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                              <Shield size={28} />
                           </div>
                           <div>
                              <div className="flex items-center space-x-3">
                                 <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{role.name}</h3>
                                 <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">{role._count.memberships} Usuarios</span>
                              </div>
                              <p className="text-sm text-slate-500 mt-1 max-w-lg truncate">{role.description || "Sin descripción"}</p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-6">
                           <div className="hidden lg:flex flex-col items-end">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nivel de Acceso</p>
                              <div className="flex items-center text-emerald-600 font-bold text-sm mt-1">
                                 <CheckCircle2 size={14} className="mr-1" />
                                 {role.permissions.includes("*") ? "Acceso Total" : `${role.permissions.length} Permisos`}
                              </div>
                           </div>
                           <ChevronRight size={20} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                     </Link>
                  ))
               )}
            </div>

            <div className="mt-12 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
               <div className="relative z-10">
                  <Lock size={48} className="text-primary mb-6" />
                  <h2 className="text-2xl font-black mb-4">Seguridad Avanzada</h2>
                  <p className="text-slate-400 max-w-xl leading-relaxed">
                     Todos los cambios en roles y permisos quedan registrados internamente para tu seguridad.
                     Solo los administradores principales pueden modificar estos perfiles.
                  </p>
               </div>
               {/* Decorative elements */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-16 -mb-16"></div>
            </div>
         </div>
      </AppLayout>
   );
}
