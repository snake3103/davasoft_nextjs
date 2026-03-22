"use client";

// Sistema de Socket.io robusto con buffer de eventos
// Resuelve problemas de timing entre inicialización y listeners

import { devLog, devError } from "@/lib/safe-log";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SocketType = any;

interface EventListener {
  id: string;
  callback: (...args: unknown[]) => void;
}

// Usar window para persistir entre módulos en producción
declare global {
  interface Window {
    __SOCKET_MANAGER__?: SocketManager;
  }
}

class SocketManager {
  private socket: SocketType | null = null;
  private connectionListeners: Array<(connected: boolean) => void> = [];
  private eventListeners: Map<string, EventListener[]> = new Map();
  private eventBuffer: Map<string, unknown[]> = new Map();
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined' && window.__SOCKET_MANAGER__) {
      devLog("[SocketManager] Reusing existing instance");
    }
  }

  async init() {
    if (this.initialized && this.socket) {
      return this.socket;
    }

    devLog("[SocketManager] Initializing...");
    
    try {
      const socketIO = await import("socket.io-client");
      this.socket = (socketIO as any).io({
        path: "/api/socketio",
        addTrailingSlash: false,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      });

      this.socket.on("connect", () => {
        devLog("[SocketManager] Connected:", this.socket?.id);
        this.notifyConnectionChange(true);
        this.flushEventBuffer();
      });

      this.socket.on("disconnect", (reason: string) => {
        devLog("[SocketManager] Disconnected:", reason);
        this.notifyConnectionChange(false);
      });

      this.socket.on("connect_error", () => {
        devLog("[SocketManager] Connection error");
        this.notifyConnectionChange(false);
      });

      this.socket.onAny((event: string, ...args: unknown[]) => {
        this.handleEvent(event, args as unknown[]);
      });

      if (typeof window !== 'undefined') {
        window.__SOCKET_MANAGER__ = this;
      }

      this.initialized = true;
      devLog("[SocketManager] Initialized successfully");
      
      return this.socket;
    } catch (error) {
      devError("[SocketManager] Failed to initialize:", error);
      return null;
    }
  }

  private handleEvent(event: string, args: unknown[]) {
    devLog("[SocketManager] Event received:", event, args.length);
    
    const listeners = this.eventListeners.get(event) || [];
    const argsArray = args as unknown[];
    
    if (listeners.length === 0) {
      devLog("[SocketManager] No listeners, buffering event:", event);
      if (!this.eventBuffer.has(event)) {
        this.eventBuffer.set(event, []);
      }
      this.eventBuffer.get(event)!.push(argsArray);
    } else {
      listeners.forEach(listener => {
        try {
          (listener.callback as (...args: unknown[]) => void)(...argsArray);
        } catch (e) {
          devError("[SocketManager] Listener error:", e);
        }
      });
    }
  }

  private flushEventBuffer() {
    devLog("[SocketManager] Flushing event buffer...");
    this.eventBuffer.forEach((events, eventName) => {
      const listeners = this.eventListeners.get(eventName) || [];
      events.forEach(args => {
        const argsArray = args as unknown[];
        listeners.forEach(listener => {
          try {
            (listener.callback as (...args: unknown[]) => void)(...argsArray);
          } catch (e) {
            devError("[SocketManager] Buffered listener error:", e);
          }
        });
      });
    });
    this.eventBuffer.clear();
  }

  private notifyConnectionChange(connected: boolean) {
    this.connectionListeners.forEach(listener => {
      try {
        (listener as (connected: boolean) => void)(connected);
      } catch (e) {
        devError("[SocketManager] Connection listener error:", e);
      }
    });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.push(callback);
    callback(this.isConnected());
    
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== callback);
    };
  }

  on(event: string, callback: (...args: unknown[]) => void): () => void {
    const id = `${event}-${Date.now()}-${Math.random()}`;
    const listener: EventListener = { id, callback };
    
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
    
    devLog("[SocketManager] Listener registered for:", event);
    
    const bufferedEvents = this.eventBuffer.get(event) || [];
    if (bufferedEvents.length > 0) {
      devLog("[SocketManager] Delivering buffered events:", bufferedEvents.length);
      bufferedEvents.forEach(args => {
        try {
          const argsArray = args as unknown[];
          (callback as (...args: unknown[]) => void)(...argsArray);
        } catch (e) {
          devError("[SocketManager] Buffered callback error:", e);
        }
      });
      this.eventBuffer.set(event, []);
    }
    
    return () => {
      const listeners = this.eventListeners.get(event) || [];
      this.eventListeners.set(event, listeners.filter(l => l.id !== id));
    };
  }

  emit(event: string, data?: unknown) {
    if (this.socket?.connected) {
      devLog("[SocketManager] Emitting:", event);
      this.socket.emit(event, data);
    } else {
      devLog("[SocketManager] Cannot emit, not connected");
    }
  }
}

// Instancia singleton
let manager: SocketManager | null = null;

export function getSocketManager(): SocketManager {
  if (!manager) {
    manager = new SocketManager();
  }
  return manager;
}

export function isSocketConnected(): boolean {
  return getSocketManager().isConnected();
}

export function onConnectionChange(callback: (connected: boolean) => void): () => void {
  return getSocketManager().onConnectionChange(callback);
}

export function onSocketEvent(event: string, callback: (...args: unknown[]) => void): () => void {
  return getSocketManager().on(event, callback);
}

export function emitSocket(event: string, data?: unknown) {
  getSocketManager().emit(event, data);
}

export async function initSocket() {
  return await getSocketManager().init();
}
