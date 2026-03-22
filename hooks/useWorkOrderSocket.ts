"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { onConnectionChange, emitSocket, onSocketEvent, isSocketConnected } from "@/lib/socket-manager";
import { devLog } from "@/lib/safe-log";

interface WorkOrderEvent {
  organizationId: string;
  workOrderId: string;
  status?: string;
  workOrder?: unknown;
  type?: 'added' | 'removed' | 'changed';
}

export function useWorkOrderSocket(organizationId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<WorkOrderEvent | null>(null);
  const hasJoined = useRef(false);
  const orgIdRef = useRef<string>(organizationId);
  const lastUpdateRef = useRef<WorkOrderEvent | null>(null);

  useEffect(() => {
    orgIdRef.current = organizationId;
  }, [organizationId]);

  useEffect(() => {
    devLog("[useWorkOrderSocket] Registering workOrder-changed listener");
    
    const unsubscribe = onSocketEvent("workOrder-changed", (...args: unknown[]) => {
      const data = args[0] as WorkOrderEvent;
      devLog("[useWorkOrderSocket] workOrder-changed received");
      
      if (lastUpdateRef.current?.workOrderId === data.workOrderId && 
          lastUpdateRef.current?.status === data.status) {
        devLog("[useWorkOrderSocket] Ignoring duplicate event");
        return;
      }
      
      lastUpdateRef.current = data;
      setLastUpdate({ ...data, type: 'changed' as const });
    });

    return () => {
      devLog("[useWorkOrderSocket] Unregistering workOrder-changed listener");
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!organizationId) {
      devLog("[useWorkOrderSocket] No organizationId, skipping");
      return;
    }

    devLog("[useWorkOrderSocket] Setting up connection listener for org:", organizationId);

    const unsubscribe = onConnectionChange((connected) => {
      devLog("[useWorkOrderSocket] Connection changed:", connected);
      setIsConnected(connected);
      
      if (connected && !hasJoined.current) {
        hasJoined.current = true;
        devLog("[useWorkOrderSocket] Joining organization:", organizationId);
        emitSocket("join-organization", organizationId);
      }
      
      if (!connected) {
        hasJoined.current = false;
      }
    });

    if (isSocketConnected() && !hasJoined.current) {
      hasJoined.current = true;
      devLog("[useWorkOrderSocket] Already connected, joining:", organizationId);
      emitSocket("join-organization", organizationId);
    }

    return unsubscribe;
  }, [organizationId]);

  const notifyChange = useCallback((workOrderId: string, status?: string) => {
    const currentOrgId = orgIdRef.current;
    const connected = isSocketConnected();
    devLog("[useWorkOrderSocket] notifyChange called:", { currentOrgId, workOrderId, status, connected });
    emitSocket("workOrder-updated", { 
      organizationId: currentOrgId, 
      workOrderId, 
      status 
    });
  }, []);

  return {
    isConnected,
    lastUpdate,
    notifyChange,
  };
}
