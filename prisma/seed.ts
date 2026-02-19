import "dotenv/config"; // Load .env before anything else
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Decimal } from "decimal.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const hashedPassword = bcrypt.hashSync("password123", 10);

  // 1. Create a Default Organization
  const org = await prisma.organization.upsert({
    where: { slug: "davasoft-sas" },
    update: {},
    create: {
      name: "Davasoft S.A.S",
      slug: "davasoft-sas",
    },
  });

  // 2. Create a Default User and Membership
  const user = await prisma.user.upsert({
    where: { email: "admin@davasoft.com" },
    update: { password: hashedPassword },
    create: {
      email: "admin@davasoft.com",
      name: "Administrador Davasoft",
      password: hashedPassword,
      role: "ADMIN",
      memberships: {
        create: {
          organizationId: org.id,
          role: "ADMIN",
        },
      },
    },
  });

  // 3. Create Categories
  const catProduct = await prisma.category.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Equipos" } },
    update: {},
    create: { name: "Equipos", type: "PRODUCT", organizationId: org.id },
  });

  const catService = await prisma.category.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Servicios Cloud" } },
    update: {},
    create: { name: "Servicios Cloud", type: "SERVICE", organizationId: org.id },
  });

  const catExpense = await prisma.category.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Arriendo" } },
    update: {},
    create: { name: "Arriendo", type: "EXPENSE", organizationId: org.id },
  });

  // 4. Create Clients
  const client1 = await prisma.client.upsert({
    where: { organizationId_idNumber: { organizationId: org.id, idNumber: "901.123.456-1" } },
    update: {},
    create: {
      name: "Tech Solutions S.A.S",
      email: "billing@techsolutions.com",
      idNumber: "901.123.456-1",
      address: "Calle 100 # 15-20, Bogotá",
      organizationId: org.id,
    },
  });

  // 5. Create Products
  const product1 = await prisma.product.upsert({
    where: { organizationId_sku: { organizationId: org.id, sku: "SERV-CLOUD" } },
    update: {},
    create: {
      name: "Servicios Cloud AWS",
      description: "Hosting y servicios en la nube",
      price: new Decimal(340.00),
      stock: 100,
      sku: "SERV-CLOUD",
      categoryId: catService.id,
      organizationId: org.id,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { organizationId_sku: { organizationId: org.id, sku: "HARD-LAP-01" } },
    update: {},
    create: {
      name: "Laptop Dell XPS 13",
      description: "Computador portátil de alto rendimiento",
      price: new Decimal(1250.00),
      stock: 15,
      sku: "HARD-LAP-01",
      categoryId: catProduct.id,
      organizationId: org.id,
    },
  });

  // 6. Create Invoices
  await prisma.invoice.upsert({
    where: { organizationId_number: { organizationId: org.id, number: "FE-1024" } },
    update: {},
    create: {
      number: "FE-1024",
      date: new Date(),
      clientId: client1.id,
      subtotal: new Decimal(1250.00),
      tax: new Decimal(237.50),
      total: new Decimal(1487.50),
      status: "PAID",
      organizationId: org.id,
      items: {
        create: [
          {
            productId: product2.id,
            quantity: 1,
            price: new Decimal(1250.00),
            total: new Decimal(1250.00),
          }
        ]
      }
    },
  });

  // 7. Create Expenses
  await prisma.expense.upsert({
    where: { organizationId_number: { organizationId: org.id, number: "G-541" } },
    update: {},
    create: {
      number: "G-541",
      date: new Date(),
      provider: "Inmobiliaria Central",
      categoryId: catExpense.id,
      total: new Decimal(2100.00),
      status: "PAID",
      organizationId: org.id,
    }
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

