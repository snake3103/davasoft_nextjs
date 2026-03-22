import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda de República Dominicana
 * Ejemplo: 1234567.89 → "1.234.567,89"
 */
export function formatMoney(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "0,00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0,00";
  return num.toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formatea un número como moneda de República Dominicana con símbolo
 * Ejemplo: 1234567.89 → "$1.234.567,89"
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "$0,00";
  return `$${formatMoney(amount)}`;
}

/**
 * Formatea un número entero con separador de miles de RD
 * Ejemplo: 1234567 → "1.234.567"
 */
export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return "0";
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n)) return "0";
  return n.toLocaleString("es-DO");
}

/**
 * Formatea distancia de tiempo relativa
 * Ejemplo: hace 5 minutos, hace 2 horas, hace 3 días
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return "hace un momento";
  } else if (diffMins < 60) {
    return `hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`;
  } else if (diffHours < 24) {
    return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
  } else if (diffDays < 7) {
    return `hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`;
  } else {
    return date.toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "short",
    });
  }
}

/**
 * Formatea bytes a unidad legible
 * Ejemplo: 1024 → "1 KB", 1048576 → "1 MB"
 */
export function formatBytes(bytes: number | string | null | undefined): string {
  if (bytes === null || bytes === undefined) return "0 B";
  const num = typeof bytes === "string" ? parseFloat(bytes) : bytes;
  if (isNaN(num)) return "0 B";
  
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let value = num;
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

/**
 * Formatea fecha ISO a formato local
 * Ejemplo: 2024-01-15T10:30:00 → "15/01/2024 10:30"
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "";
  
  return date.toLocaleString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
