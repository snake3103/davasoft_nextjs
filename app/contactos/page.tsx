"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Plus, Search, Filter, UserCircle, Mail, Phone, MoreHorizontal, UserCheck, X, Edit, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { useClients, useDeleteClient } from "@/hooks/useDatabase";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function ContactosPage() {
  const { data: contacts = [], isLoading, refetch } = useClients();
  const deleteClient = useDeleteClient();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  
  // Modal de eliminación
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; contact: any }>({ open: false, contact: null });

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact: any) => {
      const matchesSearch =
        contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === "Todos" ||
        (typeFilter === "Cliente" && contact.type === "CLIENT") ||
        (typeFilter === "Proveedor" && contact.type === "PROVIDER") ||
        (typeFilter === "Ambos" && contact.type === "BOTH");

      return matchesSearch && matchesType;
    });
  }, [contacts, searchQuery, typeFilter]);

  const handleDeleteClick = (contact: any) => {
    setDeleteModal({ open: true, contact });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.contact) return;
    try {
      await deleteClient.mutateAsync(deleteModal.contact.id);
      showToast("success", "Contacto eliminado exitosamente");
      setDeleteModal({ open: false, contact: null });
      refetch();
    } catch (error: any) {
      showToast("error", error.message || "Error al eliminar");
    }
  };

  const types = ["Todos", "Cliente", "Proveedor", "Ambos"];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Contactos</h1>
            <p className="text-slate-500 mt-1">Administra tus clientes, proveedores y prospectos.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/contactos/nuevo"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20"
            >
              <Plus size={18} className="mr-2" />
              Nuevo Contacto
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full bg-white p-1 rounded-xl border border-border flex items-center shadow-sm">
            <div className="flex items-center px-4 space-x-2 border-r border-border mr-2 min-w-[120px]">
              <select
                className="bg-transparent text-xs font-bold text-slate-400 uppercase outline-none cursor-pointer w-full"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <Search className="text-slate-400 ml-2" size={18} />
            <input
              type="text"
              placeholder="Buscar contactos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none py-2.5 px-3 text-sm focus:ring-0 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mr-3 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button className="w-full lg:w-auto px-6 py-3 bg-white border border-border rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm">
            <Filter size={18} className="mr-2" />
            Más Filtros
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 italic">Cargando contactos...</div>
        ) : filteredContacts.length > 0 ? (
          <Table headers={["Nombre / Razón Social", "Contacto", "Ciudad", "Tipo", "Saldo", "Acciones"]}>
            {filteredContacts.map((contact: any) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mr-3">
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <Link href={`/contactos/${contact.id}`} className="font-bold text-slate-800 hover:text-primary transition-colors cursor-pointer text-sm">
                        {contact.name}
                      </Link>
                      <div className="mt-0.5">
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                          contact.type === "CLIENT" ? "bg-blue-50 text-blue-600" :
                            contact.type === "PROVIDER" ? "bg-amber-50 text-amber-600" :
                              "bg-purple-50 text-purple-600"
                        )}>
                          {contact.type === "CLIENT" ? "Cliente" : contact.type === "PROVIDER" ? "Proveedor" : "Ambos"}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-slate-500 text-xs">
                      <Mail size={12} className="mr-2" /> {contact.email || "-"}
                    </div>
                    <div className="flex items-center text-slate-500 text-xs text-nowrap">
                      <Phone size={12} className="mr-2" /> {contact.phone || "-"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{contact.address || "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <UserCheck size={16} className="text-emerald-500 mr-2" />
                    <span className="text-slate-600 text-sm">Activo</span>
                  </div>
                </TableCell>
                <TableCell className={cn("font-bold text-sm", contact.balance > 0 ? "text-rose-600" : contact.balance < 0 ? "text-emerald-600" : "text-slate-600")}>
                  {formatCurrency(contact.balance)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href={`/contactos/${contact.id}/editar`}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(contact)}
                      className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <UserCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No se encontraron contactos</h3>
            <p className="text-slate-500 mt-1">Prueba con otros términos o cambia el filtro de tipo.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        title="Eliminar Contacto"
        description={`¿Estás seguro de que deseas eliminar el contacto "${deleteModal.contact?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={handleConfirmDelete}
        loading={deleteClient.isPending}
      />
    </AppLayout>
  );
}
