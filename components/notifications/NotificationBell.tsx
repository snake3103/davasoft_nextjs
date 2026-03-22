"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, X, FileText, ShoppingCart, Users, AlertCircle, Truck } from "lucide-react";
import { cn, formatDistanceToNow } from "@/lib/utils";
import { devLog } from "@/lib/safe-log";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
}

const notificationIcons: Record<string, React.ElementType> = {
  WORK_ORDER_CREATED: Truck,
  WORK_ORDER_STATUS_CHANGED: Truck,
  WORK_ORDER_ASSIGNED: Truck,
  INVOICE_CREATED: FileText,
  INVOICE_PAID: FileText,
  PAYMENT_RECEIVED: ShoppingCart,
  LOW_STOCK_ALERT: AlertCircle,
  DUE_DATE_REMINDER: AlertCircle,
  SYSTEM_MESSAGE: AlertCircle,
  USER_ASSIGNED: Users,
};

const priorityColors: Record<string, string> = {
  LOW: "text-slate-400",
  NORMAL: "text-blue-500",
  HIGH: "text-orange-500",
  URGENT: "text-red-500",
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cargar notificaciones
  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=10");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      devLog("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      devLog("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/notifications", { method: "POST" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      devLog("Error marking all as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      devLog("Error deleting notification:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={isLoading}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <CheckCheck size={14} />
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Bell size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell;
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "relative p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors",
                      !notification.isRead && "bg-blue-50/50"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn("mt-1", priorityColors[notification.priority] || priorityColors.NORMAL)}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm text-slate-800 truncate">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt))}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 hover:bg-slate-200 rounded"
                          title="Marcar como leída"
                        >
                          <Check size={12} className="text-slate-500" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 hover:bg-slate-200 rounded"
                        title="Eliminar"
                      >
                        <X size={12} className="text-slate-500" />
                      </button>
                    </div>

                    {/* Link */}
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="block mt-2 text-xs text-blue-600 hover:text-blue-700"
                        onClick={() => setIsOpen(false)}
                      >
                        Ver detalles →
                      </a>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
