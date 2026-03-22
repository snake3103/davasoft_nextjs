"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { User, Clock, Wrench } from "lucide-react";

interface Mechanic {
  id: string;
  name: string;
  email?: string;
}

interface AssignMechanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  currentMechanicId?: string;
  onAssigned?: () => void;
}

export function AssignMechanicModal({
  isOpen,
  onClose,
  orderId,
  currentMechanicId,
  onAssigned
}: AssignMechanicModalProps) {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState(currentMechanicId || '');
  const [task, setTask] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMechanics, setIsLoadingMechanics] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchMechanics();
      setSelectedMechanic(currentMechanicId || '');
    }
  }, [isOpen, currentMechanicId]);

  const fetchMechanics = async () => {
    setIsLoadingMechanics(true);
    try {
      const res = await fetch('/api/users?role=MECHANIC');
      if (res.ok) {
        const data = await res.json();
        setMechanics(data);
      }
    } catch (error) {
      console.error('Error fetching mechanics:', error);
    } finally {
      setIsLoadingMechanics(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedMechanic) {
      alert('Por favor selecciona un mecánico');
      return;
    }

    setIsLoading(true);
    try {
      // Asignar mecánico a la orden
      await fetch(`/api/work-orders/${orderId}/mechanic`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mechanicId: selectedMechanic })
      });
      
      // Si hay tarea y horas estimadas, crear asignación
      if (task && estimatedHours) {
        await fetch(`/api/work-orders/${orderId}/assignments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: selectedMechanic, 
            task, 
            estimatedHours: parseFloat(estimatedHours) 
          })
        });
      }
      
      onAssigned?.();
      onClose();
      
      // Limpiar formulario
      setTask('');
      setEstimatedHours('');
    } catch (error) {
      console.error('Error assigning mechanic:', error);
      alert('Error al asignar mecánico');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={20} className="text-primary" />
            Asignar Mecánico
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Selector de Mecánico */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Mecánico *
            </label>
            {isLoadingMechanics ? (
              <div className="flex items-center justify-center py-3">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <select
                value={selectedMechanic}
                onChange={(e) => setSelectedMechanic(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              >
                <option value="">Seleccionar mecánico...</option>
                {mechanics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Descripción del Trabajo */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              <Wrench size={14} className="inline mr-1" />
              Trabajo a realizar
            </label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Descripción del trabajo o reparación..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              rows={3}
            />
          </div>

          {/* Horas Estimadas */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              <Clock size={14} className="inline mr-1" />
              Horas estimadas
            </label>
            <input
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="0"
              min="0"
              step="0.5"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAssign} 
            isLoading={isLoading}
            disabled={!selectedMechanic}
          >
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
