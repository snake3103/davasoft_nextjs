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
