"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn, formatMoney } from "@/lib/utils";
import { 
  Truck, 
  Wrench, 
  CheckCircle, 
  Clock, 
  Package,
  Plus,
  User,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkOrderSocket } from "@/hooks/useWorkOrderSocket";
import { useSession } from "next-auth/react";

const COLUMNS = [
  { id: 'RECEIVED', label: 'Recibido', icon: Truck, color: 'bg-slate-500' },
  { id: 'DIAGNOSIS', label: 'Diagnóstico', icon: Clock, color: 'bg-amber-500' },
  { id: 'APPROVED', label: 'Aprobado', icon: CheckCircle, color: 'bg-blue-500' },
  { id: 'IN_PROGRESS', label: 'En Proceso', icon: Wrench, color: 'bg-orange-500' },
  { id: 'FINISHED', label: 'Terminado', icon: Package, color: 'bg-emerald-500' },
  { id: 'DELIVERED', label: 'Entregado', icon: CheckCircle, color: 'bg-green-500' },
] as const;

interface WorkOrder {
  id: string;
  number: string;
  status: string;
  total?: number;
  createdAt: string;
  vehicle?: {
    plate?: string;
    brand?: string;
    model?: string;
    client?: {
      name?: string;
    };
  };
  mechanic?: {
    name?: string;
  };
}

export default function WorkOrdersKanbanPage() {
  console.log("[Kanban] Component rendered");
  const [orders, setOrders] = useState<Record<string, WorkOrder[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId || "";
  console.log("[Kanban] organizationId:", organizationId);
  
  // Socket.io para tiempo real
  const { isConnected, lastUpdate, notifyChange } = useWorkOrderSocket(organizationId);

  // Refrescar cuando llega evento del socket
  useEffect(() => {
    console.log("[Kanban] lastUpdate changed:", lastUpdate);
    if (lastUpdate) {
      console.log("[Kanban] Refreshing due to socket event");
      fetchKanban();
    }
  }, [lastUpdate]);

  // Refrescar al montar
  useEffect(() => {
    fetchKanban();
  }, []);

  const fetchKanban = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/work-orders/kanban', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        // Fallback: fetch all and group by status
        const allRes = await fetch('/api/work-orders', { cache: 'no-store' });
        if (allRes.ok) {
          const allOrders = await allRes.json();
          const grouped: Record<string, WorkOrder[]> = {};
          COLUMNS.forEach(col => grouped[col.id] = []);
          allOrders.forEach((order: WorkOrder) => {
            const status = order.status || 'RECEIVED';
            if (!grouped[status]) grouped[status] = [];
            grouped[status].push(order);
          });
          setOrders(grouped);
        }
      }
    } catch (error) {
      console.error('Error fetching kanban:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (orderId: string, newStatus: string) => {
    // 1. Actualización OPTIMISTA - mover inmediatamente
    setOrders((prev) => {
      const newOrders = { ...prev };
      let movedOrder: WorkOrder | null = null;
      
      for (const status of Object.keys(newOrders)) {
        const index = newOrders[status].findIndex(o => o.id === orderId);
        if (index !== -1) {
          movedOrder = { ...newOrders[status][index], status: newStatus };
          newOrders[status] = newOrders[status].filter(o => o.id !== orderId);
          break;
        }
      }
      
      if (movedOrder) {
        newOrders[newStatus] = [...(newOrders[newStatus] || []), movedOrder];
      }
      
      return newOrders;
    });

    // 2. Enviar al servidor
    try {
      await fetch(`/api/work-orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      // Notificar via socket a otros clientes
      notifyChange(orderId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Órdenes de Servicio</h1>
            <p className="text-sm text-slate-500">Arrastra las tarjetas para cambiar el estado</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Indicador de conexión en tiempo real */}
            <div className="flex items-center gap-2 text-xs">
              <span className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500 animate-pulse" : "bg-slate-400"
              )} />
              <span className="text-slate-500">
                {isConnected ? "Tiempo real" : "Conectando..."}
              </span>
            </div>
            <Link href="/ordenes-servicio">
              <Button variant="outline" size="sm">
                Ver Lista
              </Button>
            </Link>
            <Link href="/ordenes-servicio/nuevo">
              <Button size="sm">
                <Plus size={16} className="mr-1" />
                Nueva Orden
              </Button>
            </Link>
          </div>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((column) => {
              const ColumnIcon = column.icon;
              const columnOrders = orders[column.id] || [];
              
              return (
                <div 
                  key={column.id}
                  className="flex-shrink-0 w-72 bg-slate-100 rounded-xl p-3 min-h-[400px]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const orderId = e.dataTransfer.getData('orderId');
                    if (orderId) handleDrop(orderId, column.id);
                  }}
                >
                  {/* Column Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <ColumnIcon size={16} className={cn("text-white p-1 rounded", column.color)} />
                    <span className="font-semibold text-sm text-slate-700">{column.label}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {columnOrders.length}
                    </Badge>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2 min-h-[340px]">
                    {columnOrders.map((order) => (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, order.id)}
                        onClick={() => router.push(`/ordenes-servicio/${order.id}`)}
                        className="bg-white rounded-lg p-3 shadow-sm cursor-move hover:shadow-md hover:border-primary/30 transition-all border border-slate-200 cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-xs font-semibold text-slate-600">
                            {order.number}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {order.vehicle?.plate || 'Sin placa'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm font-medium mb-1 text-slate-800 line-clamp-2">
                          {order.vehicle?.client?.name || 'Cliente sin nombre'}
                        </p>
                        
                        <p className="text-xs text-slate-500 mb-2">
                          {order.vehicle?.brand} {order.vehicle?.model}
                        </p>

                        {order.mechanic && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <User size={12} />
                            <span>{order.mechanic.name}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                          <span className="text-xs text-slate-400">
                            <Calendar size={12} className="inline mr-1" />
                            {new Date(order.createdAt).toLocaleDateString('es-DO')}
                          </span>
                          <span className="font-semibold text-sm text-primary">
                            {formatMoney(order.total || 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {columnOrders.length === 0 && (
                      <div className="h-24 flex items-center justify-center text-slate-400 text-sm">
                        Sin órdenes
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
