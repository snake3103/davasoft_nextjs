import "dotenv/config"; // Load .env before anything else
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Decimal } from "decimal.js";

const poolConfig: PoolConfig = { connectionString: process.env.DATABASE_URL };
const adapter = new PrismaPg(poolConfig);
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
          systemRole: "ADMIN",
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

  // 3b. Create Default Taxes (Impuestos para República Dominicana)
  const taxes = [
    { name: "ITBIS 18%", shortName: "ITBIS", type: "PERCENTAGE" as const, value: 18, isDefault: true },
    { name: "ITBIS 16%", shortName: "ITBIS16", type: "PERCENTAGE" as const, value: 16, isDefault: false },
    { name: "ISC", shortName: "ISC", type: "PERCENTAGE" as const, value: 10, isDefault: false },
  ];

  for (const tax of taxes) {
    await prisma.tax.upsert({
      where: { name_organizationId: { name: tax.name, organizationId: org.id } },
      update: {},
      create: { ...tax, organizationId: org.id },
    });
  }
  console.log("✓ Impuestos creados");

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

  // 3b. Create Default Chart of Accounts (Plan de Cuentas - República Dominicana)
  // Basado en el Plan de Cuentas NIIF para PYMES de RD
  
  // Función helper para crear cuentas con upsert
  const createAccount = async (code: string, name: string, type: any, parentId: string | null) => {
    return await prisma.accountingAccount.upsert({
      where: {
        organizationId_code: {
          organizationId: org.id,
          code: code,
        },
      },
      update: {
        name: name,
        type: type,
        parentId: parentId,
      },
      create: {
        code: code,
        name: name,
        type: type,
        organizationId: org.id,
        parentId: parentId,
      },
    });
  };

  // ACTIVOS (1-xxxx-xxx)
  const activo = await createAccount("1", "ACTIVOS", "ASSET", null);

  // Activo Corriente (1-1)
  const activoCorriente = await createAccount("1-1", "ACTIVO CORRIENTE", "ASSET", activo.id);

  // Efectivo y Equivalentes (1-1-01)
  const efectivo = await createAccount("1-1-01", "EFECTIVO Y EQUIVALENTES", "ASSET", activoCorriente.id);

  await createAccount("1-1-01-001", "Caja General", "ASSET", efectivo.id);
  await createAccount("1-1-01-002", "Caja Chica", "ASSET", efectivo.id);

  // Bancos (1-1-02)
  const bancos = await createAccount("1-1-02", "BANCOS", "ASSET", activoCorriente.id);

  await createAccount("1-1-02-001", "Banco Popular (Cta. Cte.)", "ASSET", bancos.id);
  await createAccount("1-1-02-002", "Banco Reservas (Cta. Cte.)", "ASSET", bancos.id);
  await createAccount("1-1-02-003", "Banco BHD (Cta. Cte.)", "ASSET", bancos.id);

  // Cuentas por Cobrar (1-1-03)
  const porCobrar = await createAccount("1-1-03", "CUENTAS POR COBRAR", "ASSET", activoCorriente.id);

  await createAccount("1-1-03-001", "Clientes Nacionales", "ASSET", porCobrar.id);
  await createAccount("1-1-03-002", "Clientes del Exterior", "ASSET", porCobrar.id);
  await createAccount("1-1-03-003", "Cobros a Directivos y Empleados", "ASSET", porCobrar.id);

  // Inventarios (1-1-04)
  const inventarios = await createAccount("1-1-04", "INVENTARIOS", "ASSET", activoCorriente.id);

  await createAccount("1-1-04-001", "Mercancías Disponibles", "ASSET", inventarios.id);
  await createAccount("1-1-04-002", "Mercancías en Tránsito", "ASSET", inventarios.id);

  // ITBIS Compras (1-1-05) - Impuesto Dominicano
  const itbisCompras = await createAccount("1-1-05", "ITBIS COMPRAS (Crédito Fiscal)", "ASSET", activoCorriente.id);

  await createAccount("1-1-05-001", "ITBIS Compras Locales (18%)", "ASSET", itbisCompras.id);
  await createAccount("1-1-05-002", "ITBIS Importaciones", "ASSET", itbisCompras.id);

  // Activos No Corrientes (1-2)
  const activoNoCorriente = await createAccount("1-2", "ACTIVOS NO CORRIENTES", "ASSET", activo.id);

  // Propiedad, Planta y Equipo (1-2-01)
  const ppe = await createAccount("1-2-01", "PROPIEDAD, PLANTA Y EQUIPO", "ASSET", activoNoCorriente.id);

  await createAccount("1-2-01-001", "Equipos de Oficina", "ASSET", ppe.id);
  await createAccount("1-2-01-002", "Equipos de Computación", "ASSET", ppe.id);
  await createAccount("1-2-01-003", "Mobiliario y Equipo", "ASSET", ppe.id);
  await createAccount("1-2-01-004", "Vehículos", "ASSET", ppe.id);

  // Depreciación Acumulada (1-2-02)
  await createAccount("1-2-02", "DEPRECIACIÓN ACUMULADA", "ASSET", activoNoCorriente.id);

  // PASIVOS (2-xxxx-xxx)
  const pasivo = await createAccount("2", "PASIVOS", "LIABILITY", null);

  // Pasivo Corriente (2-1)
  const pasivoCorriente = await createAccount("2-1", "PASIVO CORRIENTE", "LIABILITY", pasivo.id);

  // Cuentas por Pagar (2-1-01)
  const porPagar = await createAccount("2-1-01", "CUENTAS POR PAGAR", "LIABILITY", pasivoCorriente.id);

  await createAccount("2-1-01-001", "Proveedores Nacionales", "LIABILITY", porPagar.id);
  await createAccount("2-1-01-002", "Proveedores del Exterior", "LIABILITY", porPagar.id);

  // ITBIS Ventas (2-1-02) - Impuesto Dominicano
  const itbisVentas = await createAccount("2-1-02", "ITBIS VENTAS (Débito Fiscal)", "LIABILITY", pasivoCorriente.id);

  await createAccount("2-1-02-001", "ITBIS Ventas Locales (18%)", "LIABILITY", itbisVentas.id);

  // Impuestos por Pagar (2-1-03)
  const impuestosPagar = await createAccount("2-1-03", "IMPUESTOS Y APORTES POR PAGAR", "LIABILITY", pasivoCorriente.id);

  await createAccount("2-1-03-001", "Retención ISR por Pagar", "LIABILITY", impuestosPagar.id);
  await createAccount("2-1-03-002", "Retención ITBIS por Pagar", "LIABILITY", impuestosPagar.id);
  await createAccount("2-1-03-003", "TSS por Pagar (Seguridad Social)", "LIABILITY", impuestosPagar.id);
  await createAccount("2-1-03-004", "INFOTEP por Pagar", "LIABILITY", impuestosPagar.id);

  // PATRIMONIO (3-xxxx-xxx)
  const patrimonio = await createAccount("3", "PATRIMONIO", "EQUITY", null);

  await createAccount("3-1-01-001", "Capital Social Suscrito", "EQUITY", patrimonio.id);
  await createAccount("3-1-02-001", "Utilidad (Pérdida) del Ejercicio", "EQUITY", patrimonio.id);
  await createAccount("3-1-02-002", "Utilidades Acumuladas", "EQUITY", patrimonio.id);

  // INGRESOS (4-xxxx-xxx)
  const ingresos = await createAccount("4", "INGRESOS", "REVENUE", null);

  await createAccount("4-1-01-001", "Ventas de Mercancías Locales", "REVENUE", ingresos.id);
  await createAccount("4-1-01-002", "Ventas de Mercancías al Exterior", "REVENUE", ingresos.id);
  await createAccount("4-1-02-001", "Prestación de Servicios", "REVENUE", ingresos.id);
  await createAccount("4-1-03-001", "Ingresos Diversos", "REVENUE", ingresos.id);

  // Descuentos (4-2)
  await createAccount("4-2-01-001", "Descuentos sobre Ventas", "REVENUE", ingresos.id);

  // GASTOS (5-xxxx-xxx)
  const gastos = await createAccount("5", "GASTOS", "EXPENSE", null);

  // Gastos de Operación (5-1)
  const gastosOperacion = await createAccount("5-1", "GASTOS DE OPERACIÓN", "EXPENSE", gastos.id);

  await createAccount("5-1-01-001", "Sueldos y Salarios", "EXPENSE", gastosOperacion.id);
  await createAccount("5-1-01-002", "Seguridad Social (TSS)", "EXPENSE", gastosOperacion.id);
  await createAccount("5-1-01-003", "INFOTEP", "EXPENSE", gastosOperacion.id);
  await createAccount("5-1-02-001", "Arrendamientos", "EXPENSE", gastosOperacion.id);
  await createAccount("5-1-03-001", "Servicios Públicos (Luz, Agua, Teléfono)", "EXPENSE", gastosOperacion.id);
  await createAccount("5-1-04-001", "Internet y Telecomunicaciones", "EXPENSE", gastosOperacion.id);
  await createAccount("5-1-05-001", "Útiles y Materiales de Oficina", "EXPENSE", gastosOperacion.id);
  await createAccount("5-1-06-001", "Mantenimiento y Reparaciones", "EXPENSE", gastosOperacion.id);
  await createAccount("5-1-07-001", "Combustibles y Lubricantes", "EXPENSE", gastosOperacion.id);
  await createAccount("5-1-08-001", "Seguros", "EXPENSE", gastosOperacion.id);
  await createAccount("5-1-09-001", "Gastos de Ventas", "EXPENSE", gastosOperacion.id);
  await createAccount("5-1-10-001", "Gastos Bancarios", "EXPENSE", gastosOperacion.id);
  await createAccount("5-1-11-001", "Depreciación y Amortización", "EXPENSE", gastosOperacion.id);
  await createAccount("5-1-99-001", "Otros Gastos de Operación", "EXPENSE", gastosOperacion.id);

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

  // 8. Create Test Clients for Workshop
  const testClients = await Promise.all([
    prisma.client.upsert({
      where: { organizationId_idNumber: { organizationId: org.id, idNumber: "001-1234567-0" } },
      update: {},
      create: {
        organizationId: org.id,
        name: "Juan Pérez",
        phone: "(809) 555-0101",
        email: "juan.perez@email.com",
        idNumber: "001-1234567-0",
        type: "CLIENT",
      },
    }),
    prisma.client.upsert({
      where: { organizationId_idNumber: { organizationId: org.id, idNumber: "001-2345678-0" } },
      update: {},
      create: {
        organizationId: org.id,
        name: "María García",
        phone: "(809) 555-0202",
        email: "maria.garcia@email.com",
        idNumber: "001-2345678-0",
        type: "CLIENT",
      },
    }),
    prisma.client.upsert({
      where: { organizationId_idNumber: { organizationId: org.id, idNumber: "001-3456789-0" } },
      update: {},
      create: {
        organizationId: org.id,
        name: "Carlos López",
        phone: "(809) 555-0303",
        email: "carlos.lopez@email.com",
        idNumber: "001-3456789-0",
        type: "CLIENT",
      },
    }),
  ]);

  // 9. Create Test Vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { id: "test-vehicle-1" },
      update: {},
      create: {
        id: "test-vehicle-1",
        organizationId: org.id,
        clientId: testClients[0].id,
        brand: "Toyota",
        model: "Corolla",
        year: 2020,
        color: "Rojo",
        plates: "AAA-001",
        vin: "1HGBH41JXMN109186",
        mileage: 45000,
        cameWithTow: false,
      },
    }),
    prisma.vehicle.upsert({
      where: { id: "test-vehicle-2" },
      update: {},
      create: {
        id: "test-vehicle-2",
        organizationId: org.id,
        clientId: testClients[1].id,
        brand: "Honda",
        model: "Civic",
        year: 2022,
        color: "Azul",
        plates: "BBB-002",
        vin: "2HGES16534H592611",
        mileage: 25000,
        cameWithTow: false,
      },
    }),
    prisma.vehicle.upsert({
      where: { id: "test-vehicle-3" },
      update: {},
      create: {
        id: "test-vehicle-3",
        organizationId: org.id,
        clientId: testClients[2].id,
        brand: "Hyundai",
        model: "Tucson",
        year: 2021,
        color: "Negro",
        plates: "CCC-003",
        vin: "KM8JU3AC0DU543217",
        mileage: 38000,
        cameWithTow: true,
      },
    }),
    prisma.vehicle.upsert({
      where: { id: "test-vehicle-4" },
      update: {},
      create: {
        id: "test-vehicle-4",
        organizationId: org.id,
        clientId: testClients[0].id,
        brand: "Kia",
        model: "Sportage",
        year: 2023,
        color: "Blanco",
        plates: "DDD-004",
        vin: "5XYZG3AG5DG123456",
        mileage: 15000,
        cameWithTow: false,
      },
    }),
  ]);

  // 10. Create Test Work Orders
  await prisma.workOrder.upsert({
    where: { id: "test-workorder-1" },
    update: {},
    create: {
      id: "test-workorder-1",
      organizationId: org.id,
      clientId: testClients[0].id,
      vehicleId: vehicles[0].id,
      number: "OS-0001",
      status: "FINISHED",
      fuelLevel: 75,
      cameWithTow: false,
      description: "Cambio de aceite y filtro",
      workItems: JSON.stringify([
        { description: "Cambio de aceite", cost: 1500, completed: true },
        { description: "Cambio de filtro de aire", cost: 500, completed: true },
      ]),
      inventory: JSON.stringify({ speedometer: true, radio: true, spareTire: true, jack: true }),
      notes: "Cliente satisfecho",
      createdById: user.id,
      entryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      exitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.workOrder.upsert({
    where: { id: "test-workorder-2" },
    update: {},
    create: {
      id: "test-workorder-2",
      organizationId: org.id,
      clientId: testClients[1].id,
      vehicleId: vehicles[1].id,
      number: "OS-0002",
      status: "IN_PROGRESS",
      fuelLevel: 50,
      cameWithTow: false,
      description: "Diagnóstico y reparación de sistema de frenos",
      workItems: JSON.stringify([
        { description: "Revisión de frenos", cost: 800, completed: true },
        { description: "Cambio de pastillas", cost: 2500, completed: false },
        { description: "Alineación", cost: 1000, completed: false },
      ]),
      inventory: JSON.stringify({ speedometer: true, radio: true, spareTire: true, tools: false }),
      notes: "Esperando repuestos",
      createdById: user.id,
      entryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.workOrder.upsert({
    where: { id: "test-workorder-3" },
    update: {},
    create: {
      id: "test-workorder-3",
      organizationId: org.id,
      clientId: testClients[2].id,
      vehicleId: vehicles[2].id,
      number: "OS-0003",
      status: "RECEIVED",
      fuelLevel: 25,
      cameWithTow: true,
      description: "Servicio de mantenimiento general",
      workItems: JSON.stringify([
        { description: "Cambio de aceite", cost: 1500, completed: false },
        { description: "Rotación de neumáticos", cost: 600, completed: false },
        { description: "Check-up completo", cost: 1200, completed: false },
      ]),
      inventory: JSON.stringify({ speedometer: true, radio: true, spareTire: false, jack: false, documents: true }),
      notes: "Vehículo vino en grúa, revisar daños",
      createdById: user.id,
      entryDate: new Date(),
    },
  });

  console.log("Seeding finished.");
  console.log("Test data created:");
  console.log("- 3 Clients");
  console.log("- 4 Vehicles");
  console.log("- 3 Work Orders");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

