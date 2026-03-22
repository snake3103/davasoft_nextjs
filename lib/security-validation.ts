/**
 * Utilidades de validación de seguridad
 */

// Sanitizar strings para prevenir XSS e inyección
export function sanitizeString(input: unknown, maxLength = 255): string {
  if (typeof input !== "string") return "";
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>'"&]/g, ""); // Remover caracteres potencialmente peligrosos
}

// Sanitizar IDs (solo alphanumeric, dash, underscore)
export function sanitizeId(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/[^a-zA-Z0-9_-]/g, "");
}

// Sanitizar email
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== "string") return "";
  const email = input.trim().toLowerCase();
  // Validar formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? email : "";
}

// Sanitizar números
export function sanitizeNumber(input: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  const num = Number(input);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
}

// Sanitizar enum values
export function sanitizeEnum<T extends string>(
  input: unknown, 
  allowedValues: T[]
): T | null {
  if (typeof input !== "string") return null;
  const upper = input.toUpperCase();
  return allowedValues.includes(upper as T) ? (upper as T) : null;
}

// Validar que un string no esté vacío
export function isNotEmpty(input: unknown): input is string {
  return typeof input === "string" && input.trim().length > 0;
}

// Validar longitud
export function hasValidLength(input: unknown, min: number, max: number): boolean {
  if (typeof input !== "string") return false;
  const len = input.trim().length;
  return len >= min && len <= max;
}

// Validar URL
export function isValidUrl(input: unknown): boolean {
  if (typeof input !== "string") return false;
  try {
    const url = new URL(input);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

// Tipos para validaciones
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateInput(
  validations: Array<{ value: unknown; rules: string }>
): ValidationResult {
  const errors: string[] = [];
  
  for (const { value, rules } of validations) {
    const ruleList = rules.split("|");
    
    for (const rule of ruleList) {
      const [ruleName, ruleParam] = rule.split(":");
      
      switch (ruleName) {
        case "required":
          if (!isNotEmpty(value)) {
            errors.push("Este campo es requerido");
          }
          break;
          
        case "min":
          if (!hasValidLength(value, parseInt(ruleParam), Infinity)) {
            errors.push(`Debe tener al menos ${ruleParam} caracteres`);
          }
          break;
          
        case "max":
          if (!hasValidLength(value, 0, parseInt(ruleParam))) {
            errors.push(`Debe tener máximo ${ruleParam} caracteres`);
          }
          break;
          
        case "email":
          if (isNotEmpty(value) && !sanitizeEmail(value)) {
            errors.push("Formato de email inválido");
          }
          break;
          
        case "url":
          if (isNotEmpty(value) && !isValidUrl(value)) {
            errors.push("Formato de URL inválido");
          }
          break;
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
