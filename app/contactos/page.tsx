"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Plus, Search, Filter, UserCircle, Mail, Phone, MoreHorizontal, UserCheck, X, Edit, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContactModal } from "@/components/modals/ContactModal";

import { useClients } from "@/hooks/useDatabase";

export default function ContactosPage() {
  const { data: contacts, isLoading } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);

  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    return contacts.filter((contact: any) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === "Todos" ||
        (typeFilter === "Cliente" && contact.type === "CLIENT") || // Adjust labels
        (typeFilter === "Proveedor" && contact.type === "PROVIDER");

      return matchesSearch && matchesType;
    });
  }, [contacts, searchQuery, typeFilter]);

  const handleSaveContact = async (formData: any) => {
    console.log("Saving contact:", formData);
    setIsModalOpen(false);
  };

  const handleEdit = (contact: any) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este contacto?")) {
      // Deletion logic
    }
  };

  const types = ["Todos", "Cliente", "Proveedor", "Empleado"];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Contactos</h1>
            <p className="text-slate-500 mt-1">Administra tus clientes, proveedores y prospectos.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => { setEditingContact(null); setIsModalOpen(true); }}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20"
            >
              <Plus size={18} className="mr-2" />
              Nuevo Contacto
            </button>
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
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase">
                          {contact.type === "CLIENT" ? "Cliente" : "Proveedor"}
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
                <TableCell className="font-bold text-slate-600 text-sm">$0.00</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="p-1.5 hover:bg-blue-50 hover:text-primary rounded-lg text-slate-400 transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
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

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContact}
        initialData={editingContact}
      />
    </AppLayout>
  );
}
