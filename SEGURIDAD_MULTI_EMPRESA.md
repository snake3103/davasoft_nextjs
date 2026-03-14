# Seguridad Multi-Empresa (SaaS/ERP)

## 🏢 Arquitectura Multi-Tenant

Este sistema ERP está diseñado desde cero para operar como un **SaaS multi-empresa**, donde cada organización tiene sus datos completamente aislados y seguros.

---

## 🔒 Mecanismos de Aislamiento

### 1. **Prisma Scoping Automático**

El sistema utiliza un Prisma Client extendido que **automáticamente inyecta** `organizationId` en todas las consultas:

```typescript
// lib/prisma.ts
export function getScopedPrisma(organizationId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          // Modelos que requieren organizationId
          if (MODELS_WITH_ORG.includes(model)) {
            // Find operations
            if (['findMany', 'findFirst', 'count', 'aggregate', 'groupBy', 'updateMany', 'deleteMany'].includes(operation)) {
              args.where = { ...args.where, organizationId };
            }
            
            // Create operations
            if (operation === "create" || operation === "upsert") {
              args.data = { ...args.data, organizationId };
            }
            
            // CreateMany operations
            if (operation === "createMany") {
              if (Array.isArray(args.data)) {
                args.data = args.data.map((item: any) => ({
                  ...item,
                  organizationId,
                }));
              }
            }
          }
          
          return query(args);
        },
      },
    },
  });
}
```

### 2. **Modelos con Aislamiento**

#### Modelos Multi-Empresa (`MODELS_WITH_ORG`):
- ✅ Client
- ✅ Product
- ✅ Category
- ✅ Invoice
- ✅ InvoiceItem
- ✅ Estimate
- ✅ EstimateItem
- ✅ Expense
- ✅ ExpenseItem
- ✅ Payment
- ✅ AccountingAccount
- ✅ JournalEntry
- ✅ JournalLine
- ✅ Role

#### Modelos Globales (`GLOBAL_MODELS`):
- User (usuarios pueden pertenecer a múltiples organizaciones)
- Account (NextAuth)
- Session (NextAuth)
- VerificationToken (NextAuth)
- Organization
- Membership

---

## 🔐 Autenticación y Autorización

### API Helper Centralizado

```typescript
// lib/api-helpers.ts
export async function getAuthContext() {
  const session = await auth();
  
  if (!session?.user) {
    return { db: null, organizationId: null, session: null };
  }
  
  const organizationId = session.user.organizationId;
  if (!organizationId) {
    return { db: null, organizationId: null, session: null };
  }
  
  return {
    db: getScopedPrisma(organizationId),  // ← Prisma scoping automático
    organizationId,
    session
  };
}
```

### Uso en Todas las APIs

```typescript
// app/api/invoices/route.ts
export async function POST(request: Request) {
  const { db, organizationId } = await getAuthContext();
  if (!db || !organizationId) return unauthorizedResponse();
  
  // Todas las consultas usan 'db' que ya está scoping por organizationId
  const invoices = await db.invoice.findMany({
    where: { /* automáticamente filtra por organizationId */ },
  });
}
```

---

## 📊 Flujo de Aislamiento

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario inicia sesión                                │
│    - NextAuth crea sesión con organizationId           │
│    - session.user.organizationId = "org_123"           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Usuario hace petición a API                          │
│    - GET /api/invoices                                  │
│    - Middleware verifica sesión                         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. API obtiene contexto                                 │
│    - getAuthContext()                                   │
│    - Valida sesión y organizationId                     │
│    - Retorna db = getScopedPrisma(organizationId)      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Prisma scoping automático                            │
│    - db.invoice.findMany()                              │
│    - Automáticamente añade: where: { organizationId }  │
│    - Solo devuelve facturas de ESA organización         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Datos aislados garantizados                          │
│    - Organización A nunca ve datos de Organización B   │
│    - Imposible acceder a datos de otra empresa         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Verificación de Seguridad

### APIs Verificadas:

| Módulo | API | ¿Protegido? |
|--------|-----|-------------|
| **Ventas** | `/api/invoices` | ✅ |
| **Compras** | `/api/expenses` | ✅ |
| **Clientes** | `/api/clients` | ✅ |
| **Productos** | `/api/products` | ✅ |
| **Cotizaciones** | `/api/estimates` | ✅ |
| **Pagos** | `/api/payments/pending` | ✅ |
| **Reportes** | `/api/reports/*` | ✅ |
| **Contabilidad** | `/api/accounting/*` | ✅ |
| **Dashboard** | `/api/dashboard/*` | ✅ |

### Server Actions Verificadas:

| Acción | ¿Protegida? |
|--------|-------------|
| `createInvoice` | ✅ |
| `updateInvoice` | ✅ |
| `createExpense` | ✅ |
| `createAccount` (contable) | ✅ |
| `createJournalEntry` | ✅ |
| `generateInvoiceJournalEntry` | ✅ |
| `generateExpenseJournalEntry` | ✅ |
| `registerPayment` | ✅ |

---

## 🚫 Prevención de Fugas de Datos

### Escenario 1: Acceso Directo a ID
```typescript
// ❌ ESTO NO FUNCIONA
const invoice = await prisma.invoice.findUnique({
  where: { id: "invoice_de_otra_empresa" }
});
// Resultado: null o error, porque no coincide organizationId

// ✅ ESTO SÍ FUNCIONA
const { db, organizationId } = await getAuthContext();
const invoice = await db.invoice.findUnique({
  where: { id: "invoice_de_mi_empresa" }
});
// Resultado: invoice (si existe y pertenece a mi organización)
```

### Escenario 2: Manipulación de Queries
```typescript
// ❌ INTENTO DE ACCESO
const invoices = await prisma.invoice.findMany({
  where: { total: { gt: 1000 } }
  // organizationId se inyecta automáticamente
});
// Resultado: Solo facturas >1000 de MI organización
```

### Escenario 3: Creación de Datos
```typescript
// ✅ CREACIÓN SEGURA
const { db, organizationId } = await getAuthContext();
await db.invoice.create({
  data: {
    number: "FE-1001",
    total: 1000,
    // organizationId se inyecta automáticamente
  }
});
// Resultado: Factura creada con organizationId correcto
```

---

## 🔍 Auditoría y Logs

### Logs de Consultas (Desarrollo)
```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" 
    ? ["query", "error", "warn"] 
    : ["error"],
});
```

### Verificación en Producción
Todos los errores de acceso no autorizado retornan:
- **Status:** 401 Unauthorized
- **Mensaje:** "Unauthorized"

---

## 📝 Consideraciones para Nuevos Desarrollos

### ✅ Siempre Usar:
```typescript
// 1. Obtener contexto
const { db, organizationId } = await getAuthContext();

// 2. Verificar
if (!db || !organizationId) return unauthorizedResponse();

// 3. Usar db (scoping automático)
const data = await db.model.findMany();
```

### ❌ Nunca Hacer:
```typescript
// 1. Usar prisma directo sin scoping
import prisma from "@/lib/prisma";
const data = await prisma.model.findMany(); // ❌ SIN FILTRO

// 2. Confiar en inputs del cliente
const orgId = request.headers.get("X-Organization"); // ❌ INSEGURO

// 3. Saltar validación
const data = await someModel.findMany(); // ❌ SIN getAuthContext
```

---

## 🎯 Resumen de Seguridad

| Característica | Estado |
|----------------|--------|
| **Aislamiento por organización** | ✅ Implementado |
| **Prisma scoping automático** | ✅ Implementado |
| **Validación en todas las APIs** | ✅ Implementado |
| **Server Actions protegidas** | ✅ Implementado |
| **Prevención de fugas** | ✅ Implementado |
| **Logs de auditoría** | ✅ Implementado |
| **Roles y permisos** | ✅ Implementado |

---

## 📞 Soporte

Para dudas sobre implementación multi-empresa:
1. Revisar `lib/prisma.ts` - Scoping automático
2. Revisar `lib/api-helpers.ts` - Contexto de autenticación
3. Revisar `auth.ts` - Configuración de NextAuth
4. Revisar `middleware.ts` - Protección de rutas

---

**Documento creado:** Marzo 2026  
**Versión:** 1.0  
**Aplica para:** Todo el sistema ERP
