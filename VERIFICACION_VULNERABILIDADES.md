# Plan de Verificación de Vulnerabilidades del Sistema

## Objetivo
Identificar y documentar las vulnerabilidades de seguridad del sistema ERP para mitigar riesgos antes de producción.

---

## 1. Autenticación y Autorización

### 1.1 Autenticación
- [ ] Verificar que NextAuth esté configurado con providers seguros
- [ ] Confirmar que las contraseñas usen bcrypt con salt adecuado
- [ ] Verificar que las sesiones expiren correctamente
- [ ] Revisar tokens de sesión ( HttpOnly, Secure, SameSite )
- [ ] Probar intentos de login con credenciales inválidas
- [ ] Verificar rate limiting en login

### 1.2 Autorización
- [ ] Verificar que cada ruta protegida valide la sesión
- [ ] Confirmar que usuarios no puedan acceder a datos de otras organizaciones (multi-tenant)
- [ ] Probar acceso a rutas `/admin` con usuario normal
- [ ] Verificar permisos por rol (ADMIN, CONTADOR, VENDEDOR, USER)

### 1.3 Multi-Tenant
- [ ] Confirmar que todas las queries incluyan `organizationId`
- [ ] Probar acceso a recursos de otra organización via ID guessing
- [ ] Verificar que el middleware valide `organizationId` del usuario

---

## 2. Inyección SQL y Consultas a Base de Datos

### 2.1 Prisma/ORM
- [ ] Revisar que no se usen concatenación de strings en queries
- [ ] Confirmar uso de Prisma Client con parámetros seguros
- [ ] Verificar que `getScopedPrisma()` se use en todas las queries

### 2.2 Consultas Dinámicas
- [ ] Revisar filtros de búsqueda (`contains`, `mode: "insensitive"`)
- [ ] Verificar sanitización de inputs en queries dinámicas
- [ ] Probar SQL injection en campos de búsqueda

---

## 3. Validación de Datos (Zod)

- [ ] Confirmar que todos los formularios usen validación Zod
- [ ] Verificar que los schemas tengan tipos correctos
- [ ] Probar envío de datos inválidos a cada endpoint
- [ ] Confirmar sanitización de HTML en campos de texto

---

## 4. API Endpoints

### 4.1 Rate Limiting
- [ ] Verificar que exista rate limiting en endpoints públicos
- [ ] Probar DDoS básico (múltiples requests rápidos)
- [ ] Confirmar límites por IP y por usuario

### 4.2 CORS
- [ ] Verificar configuración CORS en server.js
- [ ] Confirmar que solo orígenes permitidos accedan a la API

### 4.3 Headers de Seguridad
- [ ] CSP (Content Security Policy)
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Referrer-Policy
- [ ] Strict-Transport-Security (HSTS)

---

## 5. Datos Sensibles

### 5.1 Variables de Entorno
- [ ] Confirmar que `.env` no esté en git
- [ ] Verificar que secrets no estén hardcodeados
- [ ] Revisar que DATABASE_URL no sea pública

### 5.2 Contraseñas
- [ ] Verificar hashing con bcrypt (12 rounds mínimo)
- [ ] Confirmar que contraseñas no se almacenen en texto plano
- [ ] Probar recuperación de contraseña

### 5.3 Información Financiera
- [ ] Verificar encriptación de datos financieros
- [ ] Confirmar que totales y cálculos se validen en servidor
- [ ] Revisar logs de transacciones financieras

---

## 6. Carga de Archivos

- [ ] Verificar tipos MIME permitidos
- [ ] Confirmar límites de tamaño de archivo
- [ ] Probar subida de archivos maliciosos (.php, .exe, .sh)
- [ ] Verificar que archivos se guarden en ubicación segura

---

## 7. Sesiones y Tokens

### 7.1 JWT/NextAuth
- [ ] Verificar que tokens expire adecuadamente
- [ ] Confirmar que refresh tokens funcionen correctamente
- [ ] Probar acceso con token expirado

### 7.2 Cookies
- [ ] Verificar flags HttpOnly, Secure, SameSite
- [ ] Confirmar que cookies no sean accesibles via JavaScript

---

## 8. WebSocket/Socket.io

- [ ] Verificar autenticación en conexiones Socket.io
- [ ] Confirmar que usuarios solo reciban eventos de su organización
- [ ] Probar conexiones desde orígenes no autorizados
- [ ] Verificar rate limiting en eventos Socket.io

---

## 9. Auditoría y Logs

- [ ] Confirmar que todas las acciones敏感 se registren
- [ ] Verificar que logs no contengan contraseñas o secrets
- [ ] Confirmar integridad de logs (no-modificable)

---

## 10. Vulnerabilidades Web Comunes

### OWASP Top 10
- [ ] **A01: Broken Access Control** - Probar acceso no autorizado
- [ ] **A02: Cryptographic Failures** - Verificar cifrado de datos sensibles
- [ ] **A03: Injection** - Probar SQL injection, XSS
- [ ] **A04: Insecure Design** - Revisar arquitectura de seguridad
- [ ] **A05: Security Misconfiguration** - Verificar configs de seguridad
- [ ] **A06: Vulnerable Components** - Revisar dependencias con vulnerabilidades conocidas
- [ ] **A07: Auth Failures** - Probar bypass de autenticación
- [ ] **A08: Data Integrity** - Verificar integridad de datos
- [ ] **A09: Logging Failures** - Confirmar logs de seguridad
- [ ] **A10: SSRF** - Probar Server-Side Request Forgery

### XSS (Cross-Site Scripting)
- [ ] Probar `<script>alert(1)</script>` en campos de texto
- [ ] Verificar encoding de HTML en outputs
- [ ] Confirmar sanitización en formularios ricos

### CSRF (Cross-Site Request Forgery)
- [ ] Verificar tokens CSRF en formularios
- [ ] Probar acciones desde第三方网站

---

## 11. Configuración de Producción

- [ ] Verificar `NODE_ENV=production`
- [ ] Confirmar que errores no muestren stack traces
- [ ] Verificar logs de errores seguros
- [ ] Confirmar que `.next` no sea accesible públicamente

---

## 12. Herramientas de Verificación

### Automatizadas
```bash
# dependency-check
npm audit

# Security headers
npx security-checker

# Snyk
npx snyk test
```

### Testing Manual
- [ ] Burp Suite - Proxy de testing
- [ ] OWASP ZAP - Scanner de vulnerabilidades
- [ ] Postman - Testing de API

---

## 13. Checklist Final

| Categoría | Estado | Vulnerabilidades | Prioridad |
|----------|--------|------------------|-----------|
| Autenticación | ⬜ | - | - |
| Autorización | ⬜ | - | - |
| Inyección SQL | ⬜ | - | - |
| Validación | ⬜ | - | - |
| API Security | ⬜ | - | - |
| Datos Sensibles | ⬜ | - | - |
| Carga Archivos | ⬜ | - | - |
| WebSocket | ⬜ | - | - |
| OWASP Top 10 | ⬜ | - | - |
| Config Producción | ⬜ | - | - |

---

## 14. Plan de Acción

### Fase 1: Identificación (Día 1-2)
- [ ] Ejecutar herramientas automatizadas
- [ ] Revisar código fuente manualmente
- [ ] Documentar vulnerabilidades encontradas

### Fase 2: Evaluación (Día 3)
- [ ] Clasificar vulnerabilidades por severidad
- [ ] Priorizar correcciones
- [ ] Estimar esfuerzo de remediación

### Fase 3: Remediación (Día 4-5)
- [ ] Corregir vulnerabilidades críticas
- [ ] Corregir vulnerabilidades altas
- [ ] Corregir vulnerabilidades medias

### Fase 4: Verificación (Día 6)
- [ ] Re-test de vulnerabilidades corregidas
- [ ] Pruebas de regresión
- [ ] Validación final

---

## Formato de Reporte de Vulnerabilidades

```markdown
## Vulnerabilidad #[ID]
**Título:** 
**Severidad:** Crítica / Alta / Media / Baja
**Ubicación:** 
**Descripción:**
**Pasos para reproducir:**
**Impacto:**
**Recomendación:**
**Estado:** Abierta / En Progreso / Resuelta
```

---

*Documento creado: $(date)*
*Última actualización: $(date)*
*Responsable: Equipo de Seguridad*
