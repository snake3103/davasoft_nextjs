"use client";

import { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Plus, Search, Car, User, Phone, XCircle } from "lucide-react";
import { useVehicles, useDeleteVehicle } from "@/hooks/useDatabase";

export default function VehiclesPage() {
  const { data: vehicles = [], isLoading } = useVehicles();
  const deleteVehicle = useDeleteVehicle();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredVehicles = vehicles.filter((vehicle: any) => {
    const matchesSearch = 
      vehicle.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.plates?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.client?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este vehículo?")) {
      try {
        await deleteVehicle.mutateAsync(id);
      } catch (error: any) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Vehículos</h1>
            <p className="text-slate-500 mt-1">Gestión de vehículos de clientes.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/vehiculos/nuevo"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-primary/20"
            >
              <Plus size={18} className="mr-2" />
              Nuevo Vehículo
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full bg-white p-1 rounded-xl border border-border flex items-center shadow-sm">
            <Search className="text-slate-400 ml-4" size={18} />
            <input
              type="text"
              placeholder="Buscar por marca, modelo, placa o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-3 outline-none text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Cargando...</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Car className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No hay vehículos registrados</p>
          </div>
        ) : (
          <Table headers={["Cliente", "Vehículo", "Placas", "Año", "Kilometraje", "Acciones"]}>
            {filteredVehicles.map((vehicle: any) => (
              <TableRow key={vehicle.id} className="hover:bg-slate-50">
                <TableCell>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium">{vehicle.client?.name}</div>
                      <div className="text-xs text-slate-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {vehicle.client?.phone}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Car className="w-4 h-4 mr-2 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium">
                        {vehicle.brand} {vehicle.model}
                      </div>
                      {vehicle.color && (
                        <div className="text-xs text-slate-500">{vehicle.color}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                    {vehicle.plates || "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{vehicle.year || "—"}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{vehicle.mileage?.toLocaleString() || "0"} km</div>
                </TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}

        <div className="text-sm text-slate-500 text-center">
          Total: {filteredVehicles.length} vehículos
        </div>
      </div>
    </AppLayout>
  );
}