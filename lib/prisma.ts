import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Base Prisma Client with adapter
const globalForPrisma = global as unknown as { prismaClient: PrismaClient };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const baseClient = globalForPrisma.prismaClient ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaClient = baseClient;
}

export default baseClient;

/**
 * Creates an organization-scoped Prisma client that automatically filters
 * all queries by the given organizationId.
 *
 * Usage in Server Actions / API Routes:
 *
 *   import { getScopedPrisma } from "@/lib/prisma";
 *   const db = getScopedPrisma(session.user.organizationId);
 *   const invoices = await db.invoice.findMany(); // auto-filtered by org
 */
export function getScopedPrisma(organizationId: string) {
  return baseClient.$extends({
    query: {
      client: {
        $allOperations({ args, query }: any) {
          if (args.where !== undefined) {
            args.where = { ...args.where, organizationId };
          } else if (["create", "upsert"].includes(args.operationType)) {
            if (args.data) args.data = { ...args.data, organizationId };
          }
          return query(args);
        },
      },
      product: {
        $allOperations({ args, query }: any) {
          if (args.where !== undefined) {
            args.where = { ...args.where, organizationId };
          } else if (["create", "upsert"].includes(args.operationType)) {
            if (args.data) args.data = { ...args.data, organizationId };
          }
          return query(args);
        },
      },
      invoice: {
        $allOperations({ args, query }: any) {
          if (args.where !== undefined) {
            args.where = { ...args.where, organizationId };
          } else if (["create", "upsert"].includes(args.operationType)) {
            if (args.data) args.data = { ...args.data, organizationId };
          }
          return query(args);
        },
      },
      expense: {
        $allOperations({ args, query }: any) {
          if (args.where !== undefined) {
            args.where = { ...args.where, organizationId };
          } else if (["create", "upsert"].includes(args.operationType)) {
            if (args.data) args.data = { ...args.data, organizationId };
          }
          return query(args);
        },
      },
      category: {
        $allOperations({ args, query }: any) {
          if (args.where !== undefined) {
            args.where = { ...args.where, organizationId };
          } else if (["create", "upsert"].includes(args.operationType)) {
            if (args.data) args.data = { ...args.data, organizationId };
          }
          return query(args);
        },
      },
    },
  });
}
