# Auditoría Técnica y Estado del Proyecto - Alegra Clone

Este documento fue generado tras un proceso exhaustivo de depuración, optimización de seguridad y refactorización a un stack moderno con Next.js 16 (React 19).

**Última Actualización:** Marzo 2026.
**Objetivo del Documento:** Servir de mapa arquitectónico y de estado para cualquier agente de IA o desarrollador que asuma el mantenimiento y evolución de la aplicación.

---

## 🏗 Arquitectura y Stack Tecnológico

### 1. Framework Core
- **Next.js 16.1.6** usando App Router (`app/`).
- **React 19.2.3** con las últimas características de React como `useActionState` y Server Actions integradas nativamente en componentes asíncronos (`"use server"`).
- **Tailwind CSS v4** y `tailwind-merge` + `clsx` para utilidades de clases e interfaces.
- `lucide-react` para iconografía estándar.

### 2. Backend & Base de Datos
- **Prisma ORM** (@prisma/client v7.4.1) para interactuar con la base de datos relacional.
- **PostgreSQL** mediante `@prisma/adapter-pg` puro (Driver de Next.js `pg`), conectado a proveedor cloud (Supabase/Neon).
- Autenticación basada en **NextAuth.js (Auth.js Beta.30)** junto con el adaptador oficial `@auth/prisma-adapter`.
- **Middleware:** Next.js nativo para proteger las rutas privadas bajo `middleware.ts`. *(Cloudflare proxy fue descontinuado)*.

### 3. Estado y Fetching del lado del Cliente
- **React Query (@tanstack/react-query v5.90.21):** Manejo de peticiones in-browser y sincronizado manual de caché local (`queryClient.invalidateQueries()`) después de mutar la data mediante Server Actions.
- **Zustand v5.0.11:** Manejo de estado global liviano (útil en casos complejos que no requieran persistencia pos-recarga).

### 4. Validaciones en API / Acciones
- **Zod v4.3.6:** Definición de esquemas rigurosos en `lib/schemas/*.ts` que validan todas las entradas antes de inyectarlas vía Prisma, previniendo datos mal formadas y ataques de SQL Injection escondidos en las variables JS. (Aprovechamiento de validaciones y coerciones de tipos como `z.coerce.date()`).

### 5. Utilidades Adicionales
- **bcryptjs** para hash de contraseñas.
- **decimal.js** para cálculos precisos con decimales.
- **jspdf + jspdf-autotable** para generación de PDFs.
- **recharts** para gráficos y visualizaciones.
- **react-hook-form** para manejo de formularios.
- **next-intl** para internacionalización.

---

## 🗂 Estructura del Proyecto

El código está organizado bajo el directorio `app/` (para ruteo y controladores del lado del servidor) y carpetas periféricas para lógica y componentes:

```
/
├── app/                              # Ruteo principal (Pages, Layouts, Server Actions)
│   ├── actions/                      # Server Actions Puras ("use server")
│   │   ├── accounting.ts             # Acciones contables
│   │   ├── auth.ts                   # Acciones de autenticación
│   │   ├── clients.ts                # Gestión de clientes
│   │   ├── estimates.ts              # Cotizaciones
│   │   ├── invoices.ts               # Facturas
│   │   ├── inventory.ts              # Inventario y movimientos
│   │   ├── payments.ts               # Pagos
│   │   ├── products.ts               # Productos
│   │   └── roles.ts                  # Gestión de roles
│   ├── api/                          # Endpoints REST legacy e integraciones de NextAuth
│   ├── [módulos]/                   # Módulos de la aplicación
│   │   ├── ventas/                   # Facturación y ventas
│   │   ├── compras/                  # Compras
│   │   ├── contactos/                # Clientes y proveedores
│   │   ├── inventario/               # Gestión de inventario
│   │   ├── bancos/                   # Cuentas bancarias
│   │   ├── caja/                     # Caja - Cobro de facturas pendientes
│   │   ├── gastos/                   # Gastos
│   │   ├── ingresos/                 # Ingresos
│   │   ├── cotizaciones/             # Cotizaciones
│   │   ├── contabilidad/             # Contabilidad (asientos, plan de cuentas, reportes)
│   │   ├── configuracion/           # Configuración del sistema
│   │   ├── reportes/                # Reportes
│   │   ├── pos/                      # Punto de venta
│   │   └── ayuda/                    # Ayuda
│   ├── login/                        # Página de login
│   ├── registro/                     # Página de registro
│   ├── page.tsx                      # Dashboard principal
│   ├── layout.tsx                    # Shell global
│   └── middleware.ts                 # Middleware para proteger rutas sin sesión
├── components/                       # Componentes UI de React
│   ├── layout/                       # AppLayout, Header, Sidebar
│   ├── forms/                        # Formularios principales (InvoiceForm)
│   ├── modals/                       # Modales (ProductModal, ContactModal, CheckoutModal, etc.)
│   ├── ui/                           # Componentes genéricos (Table, Autocomplete)
│   ├── accounting/                   # Componentes contables
│   ├── contacts/                     # Formularios de contactos
│   ├── inventory/                    # Formularios de inventario
│   ├── estimates/                     # Formularios de cotizaciones
│   ├── payments/                      # Componentes de pagos
│   ├── dashboard/                    # Componentes del dashboard
│   └── providers/                    # Proveedores de contexto (QueryProvider)
├── lib/                              # Código y utilidades core
│   ├── prisma.ts                     # Instancia Prisma con extensión para multitenant
│   ├── env.ts                        # Wrapper Zod de process.env
│   ├── schemas/                      # Esquemas de validación Zod
│   │   ├── invoice.ts, estimate.ts, product.ts
│   │   ├── client.ts, expense.ts, income.ts
│   │   ├── accounting.ts, register.ts
│   ├── utils.ts                      # Utilidades varias
│   ├── permissions.ts                # Sistema de permisos
│   ├── api-helpers.ts                # Helpers para APIs
│   ├── decimal.utils.ts               # Utilidades para decimales
│   ├── pdf-reports.ts                # Generación de PDFs
│   └── config.ts                     # Configuración global
├── hooks/                           # Custom hooks
│   ├── useDatabase.ts                # Hook para consultas a la BD
│   └── useRealtimeTransactions.ts   # Hook para actualizaciones en tiempo real
├── prisma/                           # Definición de la BD
│   ├── schema.prisma                  # Esquema completo con todos los modelos
│   ├── seed.ts                        # Script de seed
│   └── migrations/                   # Migraciones
├── __tests__/                        # Tests unitarios (Vitest)
│   ├── utils.test.ts
│   ├── schemas.test.ts
│   └── invoice.test.ts
├── store/                            # Estado global (Zustand)
│   └── useStore.ts
└── public/                          # Archivos estáticos
```

---

## ✅ Funcionalidades Clave y Nivel de Terminado

### 1. Server Actions Implementadas (100% Sincronizadas)
Todos los flujos de "Creación", "Edición" y "Eliminación" dependían antes de mutaciones `useMutation` a mano sobre la API REST. Se han migrado hacia Next.js **Server Actions** (`app/actions/*.ts`).
- **Ventajas alcanzadas:** Mejora general de seguridad. Cada Server Action primero verifica **internamente** si hay sesión válida de `organizationId`, y encierra las operaciones complejas (Cotizaciones Items / Facturas Items) con transacciones de Prisma `tx.invoice.update(...)`.
- **Módulos bajo este patrón:** Inventario (Productos), Ventas (Facturas), Cotizaciones, Contactos (Clientes/Proveedores), Contabilidad, Pagos, Roles.

### 2. Formularios Híbridos (Cliente-Acción)
Nuevos formularios como `InvoiceForm.tsx`, `EstimateForm.tsx` y `ProductModal.tsx` utilizan el componente de formulario con el Hook experimental `useActionState(action, initialState)` en React 19.
Al finalizar el flujo con éxito, las peticiones realizan la deshidratación del caché del lado del cliente llamando a:
```ts
queryClient.invalidateQueries({ queryKey: ["modelName"] })
```

### 3. Modelo Multitenant de Datos (Organizaciones)
El modelo base provee separación por empresas (`organizationId`), siendo esta mandatoria en *todas* las operaciones CRUD.
- `auth()` provee en la sesión el `organizationId`. Se evita un ID null o consultas cruzadas.
- **Extensión Prisma:** Se implementó `getScopedPrisma()` que inyecta automáticamente `organizationId` en todas las operaciones (create, findMany, updateMany, deleteMany, etc.).

### 4. Sistema de POS (Punto de Venta)
Sistema completo de punto de venta con dos modos de operación configurables:

#### Tipos de POS (configurables en `/configuracion/pos`):
- **STANDARD (Caja Normal):** Facturación y cobro en el mismo lugar. Un solo botón "Cobrar" que hace todo el proceso.
- **SPLIT (Facturar):** Facturación en el POS, cobro en módulo de Caja separado. Solo botón "Facturar" en el POS.

#### Funcionalidades del POS:
- Carrito de compras interactivo
- Selector de clientes
- Categorías de productos
- Búsqueda de productos
- Cálculo automático de subtotal, ITBIS y total
- Notificaciones toast al crear facturas (no modal)
- Limpieza automática del carrito tras facturar exitosamente
- Sistema de receipt/ticket para impresión
- Indicador visual del modo de POS activo

#### Configuración de Impresión:
- `TICKET`: 80mm - Tirilla
- `HALF_LETTER`: Media carta (148mm)
- `LETTER`: Carta completa (216mm)
- Opciones: Copias de impresión, auto-impresión, mostrar logo

#### Configuración de Impuestos:
- Tasa de impuesto configurable (%)
- Impuesto incluido/excluido

#### API: `/api/pos/config` (GET/POST)
#### Página: `/configuracion/pos`

### 5. Módulo de Caja (Cobros)
El módulo de caja sirve para el modo SPLIT del POS:
- Lista de facturas pendientes de pago (estado SENT)
- Búsqueda de facturas por número o cliente
- Filtro por estado (SENT, PARTIAL)
- Modal de checkout para realizar cobros
- Integración en tiempo real con el POS (actualización automática de facturas)
- Estados de facturas: SENT, PARTIAL, PAID, CANCELLED

#### Página: `/caja`

### 6. Sistema de Permisos y Roles
- Modelo `Role` con permisos personalizados por organización.
- Sistema de `Membership` que relaciona usuarios con organizaciones y roles.
- Sistema de roles del sistema: ADMIN, CONTADOR, VENDEDOR, USER.

### 7. Contabilidad Integrada
- Plan de cuentas jerárquico (`AccountingAccount` con parentId).
- Asientos contables automáticos (`JournalEntry`, `JournalLine`).
- Integración con facturas y gastos (cada documento genera su asiento contable).
- Estados: DRAFT, POSTED, CANCELLED.

### 8. Módulo Bancario
- Gestión de cuentas bancarias con tipos: CHECKING, SAVINGS, CASH, CREDIT.
- Conciliación bancaria.
- Transferencias entre cuentas.
- Estados: ACTIVE, INACTIVE, CLOSED.

### 9. Correcciones Importantes Recientes (Depuradas)
- **Cloudflare Drop:** El antiguo `proxy.ts`, envoltorios Workers y Wrangler fueron eliminados de raíz. La aplicación corre pura en una VM tradicional o plataformas como **Netlify/Vercel**.
- **Issue Fechas Prisma ("premature end of input"):** Las datas del HTML `type="date"` (formato `YYYY-MM-DD`) pasaban directo a un prisma `DateTime`. La aplicación resolvió ello usando de proxy a *Zod* invocando `z.coerce.date()` forzando a JS Dates universales.
- **Autocompletados Activos:** Todos los selectores de Productos, Categorías y Clientes se mejoraron mediante la introducción del componente `ContactSearch` o componentes autocompletables anidados, mitigando problemas de interfaces limitantes al escalar la base de datos de ítems.
- **Notificaciones POS:** Cambio de modal a toast notification para confirmaciones de facturación en modo SPLIT.
- **Carrito POS:** Limpieza automática del carrito después de facturar exitosamente.

---

## 🔒 Seguridad

### Headers de Seguridad Configurados
En `next.config.ts` se configuran los siguientes headers:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

### Validación de Variables de Entorno
- `lib/env.ts` usa Zod para validar todas las variables de entorno al arranque.
- Esquema requiere: DATABASE_URL (URL válida), AUTH_SECRET (mínimo 32 caracteres), NEXT_PUBLIC_APP_URL.

---

## 🧪 Testing

### Stack de Testing
- **Vitest** para tests unitarios con jsdom.
- **Playwright** para tests end-to-end.
- **Testing Library** para tests de componentes React.

### Tests Existentes
- `__tests__/utils.test.ts` - Tests de utilidades
- `__tests__/schemas.test.ts` - Tests de esquemas Zod
- `__tests__/invoice.test.ts` - Tests de facturas

---

## 🛠 Directrices para Futuras Iteraciones o Mantenimiento IA

Si un nuevo agente (tú) retoma este proyecto, considera:

1. **Al interactuar con Formularios de Datos:** Sigue el patrón `useActionState`. Muta en un `"use server"` module dentro de `app/actions/`. Y no uses endpoints en `app/api/...` para mutaciones; utiliza los actions debido a sus características nativas de form binding y simplicidad.

2. **Consultar Datos (Listados):** La aplicación aún depende de React Query vía endpoints (ej. `/api/invoices`) dentro de `useDatabase.ts`. Si vas a refactorizar esto a futuro, puedes reemplazarlos por Server Components asíncronos en los `page.tsx`. Si el tiempo u optimización no es urgente, mantén `useDatabase.ts`.

3. **Prisma Transaccional:** Cada vez que actualices una factura y sus *items*, invoca a `$transaction` eliminando los ítems anteriores (`deleteMany`) y construyendo iterativamente (`create`) los nuevos. Esto por la seguridad entre consistencia e inventarios futuros.

4. **Entorno Netlify:** El proyecto puede ser publicado haciendo simplemente un `npm run build` apuntando a Netlify con sus respectivas variables de entorno verificadas en `.env` (AUTH_URL, AUTH_SECRET, DATABASE_URL y cuentas de providers como Google o Github). El error config nextJS de Cloudflare Server-side fue solventado.

5. **Zod v4:** El proyecto utiliza Zod v4 (zod ^4.3.6). Asegúrate de usar las últimas APIs de coerción como `z.coerce.date()`, `z.coerce.number()`.

6. **Decimal.js:** Para cálculos financieros precisos, utiliza `Decimal` de decimal.js en lugar de operaciones con floats nativos.

7. **Modo SPLIT del POS:** Si necesitas modificar el flujo de facturación/cobro, recuerda que el POS (modo SPLIT) solo crea facturas y el módulo `/caja` es quien gestiona los cobros. Ambos deben estar sincronizados.

8. **Hook useRealtimeTransactions:** El módulo de caja usa este hook para recibir actualizaciones en tiempo real de las facturas creadas en el POS. Si necesitas modificar la lógica de sincronización, revisa este hook.

Cualquier cambio futuro a infra o la BD exige que antes se actualice `prisma/schema.prisma` y se emita el flujo regular: `npx prisma db push` o `npx prisma migrate dev`.

---

## 📋 Estado de Módulos

| Módulo | Estado | Notas |
|--------|--------|-------|
| Autenticación | ✅ Completo | NextAuth + Credentials + JWT |
| Multitenant | ✅ Completo | Organización + Memberships |
| Roles/Permisos | ✅ Completo | Roles personalizados + SystemRoles |
| Contactos | ✅ Completo | Clientes/Proveedores con tipos |
| Productos | ✅ Completo | Inventario con categorías |
| Facturas | ✅ Completo | Con asientos contables |
| Cotizaciones | ✅ Completo | Estados: DRAFT, SENT, ACCEPTED, REJECTED |
| Gastos | ✅ Completo | Con categorías y tipos |
| Ingresos | ✅ Completo | Con banco destino |
| Pagos | ✅ Completo | Vinculados a facturas/gastos |
| Contabilidad | ✅ Completo | Plan de cuentas + Asientos |
| Bancos | ✅ Completo | Conciliación + Transferencias |
| Configuración | ✅ Completo | Roles, usuarios, impuestos, numeraciones, POS |
| Reportes | ✅ Completo | Estados de cuenta + Contables (Balance, Resultados) |
| POS | ✅ Completo | Punto de venta con checkout, receipt e impresión configurable |
| Caja | ✅ Completo | Cobro de facturas pendientes (modo SPLIT) |
