import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/lib/env";

const connectionString = env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prismaClient: PrismaClient };

export const prisma = 
  globalForPrisma.prismaClient ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaClient = prisma;
}

export default prisma;

const GLOBAL_MODELS = [
  "User",
  "Account",
  "Session",
  "VerificationToken",
  "Organization",
  "Membership",
];

const MODELS_WITH_ORG = [
  "Client",
  "Product",
  "Category",
  "Invoice",
  "InvoiceItem",
  "Estimate",
  "EstimateItem",
  "Expense",
  "ExpenseItem",
  "Payment",
  "AccountingAccount",
  "JournalEntry",
  "JournalLine",
  "Role",
  "Vehicle",
  "WorkOrder",
  "BankAccount",
  "Income",
  "InventoryMovement",
  "CashDrawerShift",
  "ProductAttribute",
  "ProductAttributeValue",
  "BillOfMaterials",
  "BoMItem",
  "ProductionOrder",
  "ProductionConsumption",
];

export function getScopedPrisma(organizationId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          // console.log(`Prisma Op: ${model}.${operation}`); // Temporary debug
          
          // 1. Skip if model doesn't have organizationId or is in global list
          if (!MODELS_WITH_ORG.includes(model)) {
            return query(args);
          }

          // 2. Handle Filters (findMany, updateMany, deleteMany, findFirst, aggregate, count)
          if (['findMany', 'findFirst', 'count', 'aggregate', 'groupBy', 'updateMany', 'deleteMany'].includes(operation)) {
            if (args) {
              args.where = { ...args.where, organizationId };
            }
          } 
          
          // 3. Handle Creations (create, upsert)
          if (operation === "create" || operation === "upsert") {
            if (args.data) {
              args.data = { ...args.data, organizationId };
            }
          }

          // 4. Handle Massive Creations
          if (operation === "createMany") {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((item: any) => ({
                ...item,
                organizationId,
              }));
            } else if (args.data) {
              args.data = { ...args.data, organizationId };
            }
          }

          // Note: for findUnique, update, delete we don't automatically inject organizationId
          // because it would break Prisma's requirement for unique identifiers in 'where'.
          // Security for these should be handled by checking the result or using findFirst/updateMany.

          return query(args);
        },
      },
    },
  });
}

export type ScopedPrisma = ReturnType<typeof getScopedPrisma>;