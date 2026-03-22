"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { initSocket, onConnectionChange, onSocketEvent, emitSocket } from "@/lib/socket-manager";
import { devLog } from "@/lib/safe-log";

interface SocketContextType {
  socket: unknown;
  isConnected: boolean;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  emit: () => {},
  on: () => { return () => {}; },
});

export function useSocket() {
  return useContext(SocketContext);
}

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    devLog("[SocketProvider] Initializing...");
    
    // Inicializar socket
    initSocket().then(() => {
      devLog("[SocketProvider] Socket initialized");
      setIsInitialized(true);
    });

    // Escuchar cambios de conexión
    const unsubscribe = onConnectionChange((connected) => {
      devLog("[SocketProvider] Connection changed:", connected);
      setIsConnected(connected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    emitSocket(event, data);
  }, []);

  const on = useCallback((event: string, callback: (...args: unknown[]) => void) => {
    return onSocketEvent(event, callback);
  }, []);

  return (
    <SocketContext.Provider value={{ socket: null, isConnected, emit, on }}>
      {children}
    </SocketContext.Provider>
  );
}
