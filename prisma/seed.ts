import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const hashedPassword = bcrypt.hashSync("password123", 10);

  // 1. Create a Default User
  const user = await prisma.user.upsert({
    where: { email: "admin@davasoft.com" },
    update: { password: hashedPassword },
    create: {
      email: "admin@davasoft.com",
      name: "Administrador Davasoft",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // 2. Create Categories
  const catProduct = await prisma.category.upsert({
    where: { name: "Equipos" },
    update: {},
    create: { name: "Equipos", type: "PRODUCT" },
  });

  const catService = await prisma.category.upsert({
    where: { name: "Servicios Cloud" },
    update: {},
    create: { name: "Servicios Cloud", type: "SERVICE" },
  });

  const catExpense = await prisma.category.upsert({
    where: { name: "Arriendo" },
    update: {},
    create: { name: "Arriendo", type: "EXPENSE" },
  });

  // 3. Create Clients
  const client1 = await prisma.client.upsert({
    where: { idNumber: "901.123.456-1" },
    update: {},
    create: {
      name: "Tech Solutions S.A.S",
      email: "billing@techsolutions.com",
      idNumber: "901.123.456-1",
      address: "Calle 100 # 15-20, Bogotá",
    },
  });

  // 4. Create Products
  const product1 = await prisma.product.upsert({
    where: { sku: "SERV-CLOUD" },
    update: {},
    create: {
      name: "Servicios Cloud AWS",
      description: "Hosting y servicios en la nube",
      price: 340.00,
      stock: 100,
      sku: "SERV-CLOUD",
      categoryId: catService.id,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { sku: "HARD-LAP-01" },
    update: {},
    create: {
      name: "Laptop Dell XPS 13",
      description: "Computador portátil de alto rendimiento",
      price: 1250.00,
      stock: 15,
      sku: "HARD-LAP-01",
      categoryId: catProduct.id,
    },
  });

  // 5. Create Invoices
  await prisma.invoice.upsert({
    where: { number: "FE-1024" },
    update: {},
    create: {
      number: "FE-1024",
      date: new Date(),
      clientId: client1.id,
      subtotal: 1250.00,
      tax: 237.50,
      total: 1487.50,
      status: "PAID",
      items: {
        create: [
          {
            productId: product2.id,
            quantity: 1,
            price: 1250.00,
            total: 1250.00,
          }
        ]
      }
    },
  });

  // 6. Create Expenses
  await prisma.expense.upsert({
    where: { number: "G-541" },
    update: {},
    create: {
      number: "G-541",
      date: new Date(),
      provider: "Inmobiliaria Central",
      categoryId: catExpense.id,
      total: 2100.00,
      status: "PAID",
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
