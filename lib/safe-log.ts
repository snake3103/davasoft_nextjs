/**
 * Utilidad de logging seguro para producción
 * Solo muestra logs en desarrollo, nunca en producción
 */

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Log solo visible en desarrollo
 */
export function devLog(...args: unknown[]) {
  if (isDevelopment) {
    console.log(...args);
  }
}

/**
 * Log de error solo visible en desarrollo
 */
export function devError(...args: unknown[]) {
  if (isDevelopment) {
    console.error(...args);
  }
}

/**
 * Log de warning solo visible en desarrollo
 */
export function devWarn(...args: unknown[]) {
  if (isDevelopment) {
    console.warn(...args);
  }
}

/**
 * Log de información segura (sin datos sensibles)
 * En producción solo loguea en archivo, nunca en consola
 */
export function safeLog(action: string, metadata?: Record<string, unknown>) {
  if (isDevelopment) {
    console.log(`[${action}]`, metadata);
  }
  // En producción, podrías enviar a un servicio de logs como Datadog, Sentry, etc.
  // Sentry ya está configurado en el proyecto
}

/**
 * Sanitiza objetos para logging (remueve datos sensibles)
 */
export function sanitizeForLog(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = [
    "password", "token", "secret", "apiKey", "accessToken", 
    "refreshToken", "authorization", "cookie", "session",
    "creditCard", "cardNumber", "cvv", "ssn"
  ];
  
  const sanitized = { ...obj };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  }
  
  return sanitized;
}
