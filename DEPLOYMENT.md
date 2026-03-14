# Deployment - Davasoft

Este documento describe el proceso de despliegue de la aplicación Davasoft.

## Requisitos Previos

- Node.js 20+
- PostgreSQL database
- Cuenta de Vercel (para deployment)
- Cuenta de Neon (recomendado para PostgreSQL)
- Cuenta de Upstash (para rate limiting - opcional)
- Cuenta de Sentry (para monitoreo - opcional)

## Configuración Inicial

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/davasoft.git
cd davasoft
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` con los valores correctos:
- `DATABASE_URL`: Tu URL de PostgreSQL (Neon)
- `AUTH_SECRET`: Generar con `npx auth secret`
- `NEXT_PUBLIC_APP_URL`: URL de tu app

### 4. Configurar base de datos
```bash
npx prisma db push
```

### 5. Ejecutar seed (opcional)
```bash
npx prisma db seed
```

## Desarrollo Local

```bash
npm run dev
```

La app estará disponible en `http://localhost:3000`

## Deployment a Vercel

### Opción 1: Deploy automático con Git

1. Subir el proyecto a GitHub
2. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
3. Importar el repositorio
4. Agregar las variables de entorno en Vercel:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - `SENTRY_ORG` (si usas Sentry)
   - `SENTRY_PROJECT` (si usas Sentry)
   - `NEXT_PUBLIC_SENTRY_DSN` (si usas Sentry)
5. Click en "Deploy"

### Opción 2: Deploy desde CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## CI/CD con GitHub Actions

El proyecto incluye un workflow de GitHub Actions en `.github/workflows/ci.yml`

### Secrets requeridos en GitHub:

- `DATABASE_URL`: URL de la base de datos de producción
- `AUTH_SECRET`: Secret para NextAuth
- `VERCEL_TOKEN`: Token de Vercel
- `VERCEL_ORG_ID`: ID de la organización Vercel
- `VERCEL_PROJECT_ID`: ID del proyecto Vercel

### Variables requeridas:

- `NEXT_PUBLIC_APP_URL`: URL de producción

### Funcionamiento del CI:

1. **Push a main/develop**: Ejecuta lint, typecheck y tests
2. **Pull Request**: Ejecuta tests + build + E2E
3. **Push a main**: Ejecuta build + deploy a Vercel

## Monitoreo

### Sentry (Errores)

1. Crear proyecto en [Sentry](https://sentry.io)
2. Agregar variables:
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
   - `NEXT_PUBLIC_SENTRY_DSN`
3. Los errores se capturan automáticamente

### Upstash (Rate Limiting)

1. Crear cuenta en [Upstash](https://upstash.com)
2. Crear Redis database
3. Agregar variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## Mantenimiento

### Actualizar dependencias
```bash
npm update
npx prisma generate
```

### Backup de base de datos
```bash
# Usando pg_dump (neon)
pg_dump "postgresql://user:pass@host/db" > backup.sql

# O usar el script en scripts/backup-db.sh
./scripts/backup-db.sh
```

### Ver logs en producción
```bash
# Vercel
vercel logs davasoft

#也可使用
vercel logs davasoft --follow
```

## Troubleshooting

### Error de build
```bash
# Limpiar build cache
rm -rf .next
npm run build
```

### Error de Prisma
```bash
npx prisma generate
npx prisma db push
```

### Error de autenticación
Verificar que `AUTH_SECRET` esté configurado correctamente

## Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org/)