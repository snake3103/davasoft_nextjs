# Auditoría Técnica y Estado del Proyecto - Alegra Clone

Este documento fue generado tras un proceso exhaustivo de depuración, optimización de seguridad y refactorización a un stack moderno con Next.js 16 (React 19).

**Última Actualización:** Marzo 2026.
**Objetivo del Documento:** Servir de mapa arquitectónico y de estado para cualquier agente de IA o desarrollador que asuma el mantenimiento y evolución de la aplicación.

---

## 🏗 Arquitectura y Stack Tecnológico

1. **Framework Core:**
   * **Next.js 16.1.6** usando App Router (`app/`).
   * **React 19.2.3** con las últimas características de React como `useActionState` y Server Actions integradas nativamente en componentes asíncronos (`"use server"`).
   * **Tailwind CSS v4** y `tailwind-merge` + `clsx` para utilidades de clases e interfaces.
   * `lucide-react` para iconografía estándar.

2. **Backend & Base de Datos:**
   * **Prisma ORM** (@prisma/client v7.4.x) para interactuar con la base de datos relacional.
   * **PostgreSQL** mediante `@prisma/adapter-pg` puro (Driver de Next.js `pg`), conectado a proveedor cloud (Supabase/Neon).
   * Autenticación basada en **NextAuth.js (Auth.js Beta.30)** junto con el adaptador oficial `@auth/prisma-adapter`.
   * **Middleware:** Next.js nativo para proteger las rutas privadas bajo `middleware.ts`. *(Cloudflare proxy fue descontinuado)*.

3. **Estado y Fetching del lado del Cliente:**
   * **React Query (@tanstack/react-query v5):** Manejo de peticiones in-browser y sincronizado manual de caché local (`queryClient.invalidateQueries()`) después de mutar la data mediante Server Actions.
   * **Zustand v5:** Manejo de estado global liviano (útil en casos complejos que no requieran persistencia pos-recarga).

4. **Validaciones en API / Acciones:**
   * **Zod v4:** Definición de esquemas rigurosos en `lib/schemas/*.ts` que validan todas las entradas antes de inyectarlas vía Prisma, previniendo datos mal formadas y ataques de SQL Injection escondidos en las variables JS. (Aprovechamiento de validaciones y coerciones de tipos como `z.coerce.date()`).

---

## 🗂 Estructura del Proyecto

El código está organizado bajo el directorio `app/` (para ruteo y controladores del lado del servidor) y carpetas periféricas para lógica y componentes:

```text
/
├── app/                  # Ruteo principal (Pages, Layouts, Server Actions)
│   ├── actions/          # --> Server Actions Puras ("use server")
│   │   ├── clients.ts, estimates.ts, invoices.ts, products.ts
│   ├── api/              # --> Endpoints REST legacy e integraciones de NextAuth
│   ├── [módulos]/        # --> ventas, compras, bancos, configuracion, contactos, gastos, ingresos, inventario, pos
│   ├── error.tsx         # Boundary de errores de fallback globale
│   ├── layout.tsx        # Shell global
│   └── middleware.ts     # Middleware para proteger las rutas sin sesión ("/" no bloqueadas)
├── components/           # Componentes UI de React (Cliente y Servidor)
│   ├── layout/           # AppLayout, Header, Sidebar
│   ├── forms/            # Módulos de edición de páginas tipo página (`InvoiceForm`)
│   ├── modals/           # Inputs rápidos por modal (`ProductModal`, `ContactModal`)
│   ├── ui/               # inputs genéricos, AutoComplete, Tablas base.
│   └── providers/        # Injectores de query clients
├── hooks/                # Hooks ad-hoc para abstracción de react-query API calls
│   └── useDatabase.ts    # Envoltorios de read-queries sobre las fetch-APIs internas
├── lib/                  # Código y utilidades base core
│   ├── prisma.ts         # Instancia patrón singelton robusta de Prisma
│   ├── env.ts            # Wrapper zodes de process.env para verificación al arranque
│   └── schemas/          # Esquemas centrales (invoice, product, estimate, etc.)
└── prisma/               # Definición de la BD y scripts seed/migrations
```

---

## ✅ Funcionalidades Clave y Nivel de Terminado

### **1. Server Actions Implementadas (100% Sincronizadas)**
Todos los flujos de "Creación", "Edición" y "Eliminación" dependían antes de mutaciones `useMutation` a mano sobre la API REST. Se han migrado hacia Next.js **Server Actions** (`app/actions/*.ts`).
* **Ventajas alcanzadas:** Mejora general de seguridad. Cada Server Action primero verifica **internamente** si hay sesión válida de `organizationId`, y encierra las operaciones complejas (Cotizaciones Items / Facturas Items) con transacciones de Prisma `tx.invoice.update(...)`.
* **Módulos bajo este patrón:** Inventario (Productos), Ventas (Facturas), Cotizaciones, Contactos (Clientes/Proveedores).

### **2. Formularios Híbridos (Cliente-Acción)**
Nuevos formularios como `InvoiceForm.tsx`, `EstimateForm.tsx` y `ProductModal.tsx` utilizan el componente de formulario con el Hook experimental `useActionState(action, initialState)` en React 19.
Al finalizar el flujo con éxito, las peticiones realizan la deshidratación del caché del lado del cliente llamando a:
```ts
queryClient.invalidateQueries({ queryKey: ["modelName"] })
```

### **3. Modelo Multitenant de Datos (Organizaciones)**
El modelo base provee separación por empresas (`organizationId`), siendo esta mandatoria en *todas* las operaciones CRUD.
* `auth()` provee en la sesión el `organizationId`. Se evita un ID null o consultas cruzadas.

### **4. Correcciones Importantes Recientes (Depuradas):**
- **Cloudflare Drop:** El antiguo `proxy.ts`, envoltorios Workers y Wrangler fueron eliminados de raíz. La aplicación corre pura en una VM tradicional o plataformas como **Netlify/Vercel**.
- **Issue Fechas Prisma ("premature end of input"):** Las datas del HTML `type="date"` (formato `YYYY-MM-DD`) pasaban directo a un prisma `DateTime`. La aplicación resolvió ello usando de proxy a *Zod* invocando `z.coerce.date()` forzando a JS Dates universales.
- **Autocompletados Activos:** Todos los selectores de Productos, Categorías y Clientes se mejoraron mediante la introducción del componente `ContactSearch` o componentes autocompletables anidados, mitigando problemas de interfaces limitantes al escalar la base de datos de ítems.

---

## 🛠 Directrices para Futuras Iteraciones o Mantenimiento IA

Si un nuevo agente (tú) retoma este proyecto, considera:

1. **Al interactuar con Formularios de Datos:** Sigue el patrón `useActionState`. Muta en un `"use server"` module dentro de `app/actions/`. Y no uses endpoints en `app/api/...` para mutaciones; utiliza los actions debido a sus características nativas de form binding y simplicidad.
2. **Consultar Datos (Listados):** La aplicación aún depende de React Query vía endpoints (ej. `/api/invoices`) dentro de `useDatabase.ts`. Si vas a refactorizar esto a futuro, puedes reemplazarlos por Server Components asíncronos en los `page.tsx`. Si el tiempo u optimización no es urgente, mantén `useDatabase.ts`.
3. **Prisma Transaccional:** Cada vez que actualices una factura y sus *items*, invoca a `$transaction` eliminando los ítems anteriores (`deleteMany`) y construyendo iterativamente (`create`) los nuevos. Esto por la seguridad entre consistencia e inventarios futuros.
4. **Entorno Netlify:** El proyecto puede ser publicado haciendo simplemente un `npm run build` apuntando a Netlify con sus respectivas variables de entorno verificadas en `.env` (AUTH_URL, AUTH_SECRET, DATABSE_URL y cuentas de providers como Google o Github). El error config nextJS de Cloudflare Server-side fue solventado. 

Cualquier cambio futuro a infra o la BD exige que antes se actualice `prisma/schema.prisma` y se emita el flujo regular: `npx prisma db push` o `npx prisma migrate dev`.
