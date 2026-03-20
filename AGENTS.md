# AGENTS.md - Guía para Agentes

Este documento proporciona las reglas y comandos para agentes que operan en este proyecto Next.js ERP.

## Proyecto

- **Framework**: Next.js 16 con App Router
- **Lenguaje**: TypeScript (strict mode)
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js v5
- **Testing**: Vitest + React Testing Library + Playwright
- **Estilos**: Tailwind CSS v4
- **Validación**: Zod
- **Estado**: Zustand (cliente) + React Query (servidor)

---

# SISTEMA MULTI-AGENTE (Antigravity)

Este proyecto usa el sistema de equipo multi-agente de Antigravity para coordinar múltiples agentes IA.

## Configuración del Entorno

El equipo comunica a través de carpeta oculta:
- `.antigravity/team/tasks.json` → Tareas, estados y dependencias
- `.antigravity/team/mailbox/` → Mensajes entre agentes
- `.antigravity/team/broadcast.msg` → Mensajes globales
- `.antigravity/team/locks/` → Bloqueos de archivos

## Roles del Equipo

| Rol | ID | Responsabilidad |
|-----|-----|-----------------|
| **Director** | director | Líder. Asigna tareas, aprueba planes |
| **Arquitecto** | arquitecto | Estructura, tipos TypeScript, patrones |
| **Frontend** | frontend | Componentes React, Zustand, Tailwind |
| **Backend** | backend | API, Server Actions, Prisma |
| **Investigador** | investigador | Documentación, research |
| **QA** | qa | Tests, seguridad, bugs |

## Protocolo

### 1. Tareas y Dependencias
- Las tareas tienen estados: `PENDING`, `IN_PROGRESS`, `COMPLETED`
- No iniciar tarea si sus `dependencies` no están `COMPLETED`
- Actualizar `tasks.json` al cambiar estado

### 2. Bloqueos de Archivos
- **NUNCA** editar archivo con `.lock` activo en `.antigravity/team/locks/`
- Crear lock antes de editar, liberar al terminar

### 3. Comunicación
- **Mensaje directo**: Escribir en `.antigravity/team/mailbox/{agente}.msg`
- **Broadcast**: Escribir en `.antigravity/team/broadcast.msg`

### 4. Aprobación de Planes
- Antes de cambios significativos, agent debe enviar Plan al Director
- Esperar `APPROVED` antes de ejecutar

---

# Comandos

## Desarrollo
```bash
npm run dev          # Servidor desarrollo (localhost:3000)
npm run build        # Build producción
npm run start        # Servidor producción
```

## Linting y TypeScript
```bash
npm run lint         # ESLint
npm run lint:ci     # ESLint CI (más memoria)
npm run typecheck   # TypeScript
```

## Testing
```bash
npm run test        # Tests watch mode
npm run test:ci     # Tests una vez
npm run test:coverage # Coverage

# Un solo test
npx vitest run __tests__/utils.test.ts
npx vitest run -t "nombre del test"
```

## Base de Datos
```bash
npx prisma generate    # Generar cliente
npx prisma db push    # Push schema
npx prisma migrate    # Migraciones
npm run db:seed       # Seed
```

---

# Convenciones de Código

## TypeScript
- Usar **strict mode**, evitar `any`
- Tipar parámetros y retornos de funciones
- Preferir interfaces para objetos

## Imports
- Usar alias `@/` para rutas absolutas
- Orden: externos → internos → componentes → utils

```typescript
// Bien
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

// Mal
import React from "react";
import { formatMoney } from "../../lib/utils"
```

## Nomenclatura
- **Componentes**: PascalCase (`InvoiceForm.tsx`)
- **Utilidades**: kebab-case
- **Funciones**: camelCase
- **Types/Interfaces**: PascalCase
- **Zod Schemas**: termina en `Schema` (`InvoiceSchema`)

## React
- Usar `"use client"` solo cuando es necesario
- Preferir Server Components
- React Query para estado servidor, Zustand para cliente
- Extraer lógica reusable a hooks

## Errores
- Validar env vars con Zod en `lib/env.ts`
- Usar Zod schemas para validación de formularios
- Usar Next.js error boundaries (`app/error.tsx`)

## Prisma
- Usar `getScopedPrisma(organizationId)` para multi-tenant
- El cliente es singleton en desarrollo

```typescript
import { getScopedPrisma } from "@/lib/prisma";

export async function getInvoices(organizationId: string) {
  const prisma = getScopedPrisma(organizationId);
  return prisma.invoice.findMany();
}
```

## Estilos
- Tailwind CSS con `cn()` para clases condicionales

```typescript
import { cn } from "@/lib/utils";

<Button className={cn("flex items-center", isActive && "bg-primary")}>
```

## Testing
- Tests en `__tests__/`
- Vitest + React Testing Library
- Nombrar: `{modulo}.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { formatMoney } from "@/lib/utils";

describe("formatMoney", () => {
  it("should format with 2 decimals", () => {
    expect(formatMoney(1234.56)).toBe("1,234.56");
  });
});
```

## Estructura de Archivos
```
app/              # Next.js App Router
  [route]/page.tsx
  layout.tsx
  error.tsx
components/
  ui/             # Componentes reutilizables
  forms/          # Formularios
  layout/         # Sidebar, Header
lib/
  schemas/        # Zod schemas
  utils.ts        # Helpers (cn, formatMoney)
hooks/            # Custom hooks
store/           # Zustand
prisma/          # Schema y migraciones
__tests__/       # Tests unitarios
tests/           # E2E (Playwright)
```

---

# Reglas de Commit

Antes de commitear:
1. `npm run lint`
2. `npm run typecheck`
3. `npm run test:ci`
4. `npm run build`

Usar conventional commits: `feat:`, `fix:`, `chore:`, `docs:`

---

# Variables de Entorno

Required (ver `.env.example`):
- `DATABASE_URL` - PostgreSQL
- `AUTH_SECRET` - NextAuth (min 32 chars)
- `NEXT_PUBLIC_APP_URL` - URL app (default: http://localhost:3000)

---

# Recursos Extra

- [SEGURIDAD_MULTI_EMPRESA.md](./SEGURIDAD_MULTI_EMPRESA.md) - Seguridad multi-tenant
