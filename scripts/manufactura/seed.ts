import "dotenv/config";

// Import prisma from lib
import { prisma } from "../../lib/prisma";

async function main() {
  console.log("🌱 Creating manufacturing demo data...");

  // Get first organization
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error("No organization found. Please run seed first.");
    return;
  }

  console.log(`Using organization: ${org.name} (${org.id})`);

  // Create categories
  const [windowCat, rawCat, furnitureCat] = await Promise.all([
    prisma.category.upsert({
      where: { id: `cat-${org.id}-windows` },
      update: {},
      create: {
        id: `cat-${org.id}-windows`,
        organizationId: org.id,
        name: "Ventanas",
        type: "PRODUCT",
      },
    }),
    prisma.category.upsert({
      where: { id: `cat-${org.id}-raw` },
      update: {},
      create: {
        id: `cat-${org.id}-raw`,
        organizationId: org.id,
        name: "Materia Prima",
        type: "PRODUCT",
      },
    }),
    prisma.category.upsert({
      where: { id: `cat-${org.id}-furniture` },
      update: {},
      create: {
        id: `cat-${org.id}-furniture`,
        organizationId: org.id,
        name: "Muebles",
        type: "PRODUCT",
      },
    }),
  ]);

  console.log("✅ Categories created");

  // Create product attributes
  await Promise.all([
    prisma.productAttribute.upsert({
      where: { id: `attr-${org.id}-width` },
      update: {},
      create: {
        id: `attr-${org.id}-width`,
        organizationId: org.id,
        name: "Ancho",
        code: "width",
        type: "number",
        unit: "m",
        isRequired: true,
        isGlobal: true,
      },
    }),
    prisma.productAttribute.upsert({
      where: { id: `attr-${org.id}-height` },
      update: {},
      create: {
        id: `attr-${org.id}-height`,
        organizationId: org.id,
        name: "Alto",
        code: "height",
        type: "number",
        unit: "m",
        isRequired: true,
        isGlobal: true,
      },
    }),
    prisma.productAttribute.upsert({
      where: { id: `attr-${org.id}-depth` },
      update: {},
      create: {
        id: `attr-${org.id}-depth`,
        organizationId: org.id,
        name: "Profundidad",
        code: "depth",
        type: "number",
        unit: "m",
        isRequired: false,
        isGlobal: true,
      },
    }),
    prisma.productAttribute.upsert({
      where: { id: `attr-${org.id}-color` },
      update: {},
      create: {
        id: `attr-${org.id}-color`,
        organizationId: org.id,
        name: "Color",
        code: "color",
        type: "select",
        options: JSON.stringify(["Blanco", "Negro", "Gris", "Madera"]),
        isRequired: true,
        isGlobal: true,
      },
    }),
    prisma.productAttribute.upsert({
      where: { id: `attr-${org.id}-glass_type` },
      update: {},
      create: {
        id: `attr-${org.id}-glass_type`,
        organizationId: org.id,
        name: "Tipo de Vidrio",
        code: "glass_type",
        type: "select",
        options: JSON.stringify(["Transparente", "Templado", "Laminado"]),
        isRequired: true,
        isGlobal: true,
      },
    }),
    prisma.productAttribute.upsert({
      where: { id: `attr-${org.id}-material` },
      update: {},
      create: {
        id: `attr-${org.id}-material`,
        organizationId: org.id,
        name: "Material",
        code: "material",
        type: "select",
        options: JSON.stringify(["Aluminio", "PVC", "Madera"]),
        isRequired: true,
        isGlobal: true,
      },
    }),
  ]);

  console.log("✅ Attributes created");

  // Create RAW materials
  const [perfil, vidrio, tornillo, sellador, vinilo, burlete] = await Promise.all([
    prisma.product.upsert({
      where: { id: `prod-${org.id}-perfil` },
      update: {},
      create: {
        id: `prod-${org.id}-perfil`,
        organizationId: org.id,
        name: "Perfil de Aluminio 1 pulgada",
        sku: "MP-PERFIL-ALU-001",
        categoryId: rawCat.id,
        price: 150,
        cost: 85,
        stock: 500,
        minStock: 50,
      },
    }),
    prisma.product.upsert({
      where: { id: `prod-${org.id}-vidrio` },
      update: {},
      create: {
        id: `prod-${org.id}-vidrio`,
        organizationId: org.id,
        name: "Vidrio Transparente 4mm",
        sku: "MP-VIDRIO-001",
        categoryId: rawCat.id,
        price: 450,
        cost: 280,
        stock: 200,
        minStock: 20,
      },
    }),
    prisma.product.upsert({
      where: { id: `prod-${org.id}-tornillo` },
      update: {},
      create: {
        id: `prod-${org.id}-tornillo`,
        organizationId: org.id,
        name: "Tornillo Autoperforante",
        sku: "MP-TORNILLO-001",
        categoryId: rawCat.id,
        price: 0.50,
        cost: 0.25,
        stock: 10000,
        minStock: 1000,
      },
    }),
    prisma.product.upsert({
      where: { id: `prod-${org.id}-sellador` },
      update: {},
      create: {
        id: `prod-${org.id}-sellador`,
        organizationId: org.id,
        name: "Sellador de Silicón",
        sku: "MP-SELLADOR-001",
        categoryId: rawCat.id,
        price: 45,
        cost: 25,
        stock: 150,
        minStock: 20,
      },
    }),
    prisma.product.upsert({
      where: { id: `prod-${org.id}-vinilo` },
      update: {},
      create: {
        id: `prod-${org.id}-vinilo`,
        organizationId: org.id,
        name: "Vinilo de Goma",
        sku: "MP-VINILO-001",
        categoryId: rawCat.id,
        price: 25,
        cost: 12,
        stock: 300,
        minStock: 50,
      },
    }),
    prisma.product.upsert({
      where: { id: `prod-${org.id}-burlete` },
      update: {},
      create: {
        id: `prod-${org.id}-burlete`,
        organizationId: org.id,
        name: "Burlete de Espuma",
        sku: "MP-BURLETE-001",
        categoryId: rawCat.id,
        price: 15,
        cost: 8,
        stock: 500,
        minStock: 100,
      },
    }),
  ]);

  console.log("✅ Raw materials created");

  // Create configurable product (windows)
  const windowProduct = await prisma.product.upsert({
    where: { id: `prod-${org.id}-ventana` },
    update: {},
    create: {
      id: `prod-${org.id}-ventana`,
      organizationId: org.id,
      name: "Ventana de Aluminum",
      sku: "VENTANA-ALU-001",
      categoryId: windowCat.id,
      price: 2500,
      cost: 0,
      stock: 0,
      hasAttributes: true,
    },
  });

  console.log("✅ Finished products created");

  // Create BoM for windows
  const existingBom = await prisma.billOfMaterials.findFirst({
    where: {
      organizationId: org.id,
      productId: windowProduct.id,
    },
  });

  if (!existingBom) {
    await prisma.billOfMaterials.create({
      data: {
        organizationId: org.id,
        productId: windowProduct.id,
        version: "1.0",
        isActive: true,
        isDefault: true,
        boMItems: {
          create: [
            {
              componentId: perfil.id,
              quantity: 0,
              quantityFormula: "({width} + {height}) * 2",
              isOptional: false,
              scrapPercent: 5,
              sequence: 1,
            },
            {
              componentId: vidrio.id,
              quantity: 0,
              quantityFormula: "{width} * {height} * 1.1",
              isOptional: false,
              scrapPercent: 10,
              sequence: 2,
            },
            {
              componentId: tornillo.id,
              quantity: 0,
              quantityFormula: "round(({width} + {height}) * 8)",
              isOptional: false,
              scrapPercent: 0,
              sequence: 3,
            },
            {
              componentId: sellador.id,
              quantity: 0,
              quantityFormula: "({width} + {height}) * 2 / 10",
              isOptional: false,
              scrapPercent: 0,
              sequence: 4,
            },
            {
              componentId: vinilo.id,
              quantity: 0,
              quantityFormula: "({width} + {height}) * 2",
              isOptional: false,
              scrapPercent: 5,
              sequence: 5,
            },
            {
              componentId: burlete.id,
              quantity: 0,
              quantityFormula: "({width} + {height}) * 2",
              isOptional: false,
              scrapPercent: 5,
              sequence: 6,
            },
          ],
        },
      },
    });
    console.log("✅ BoM for windows created");
  }

  // Second example: Wooden furniture
  const [madera, plywood, manija, bisagra, tornilloMad] = await Promise.all([
    prisma.product.upsert({
      where: { id: `prod-${org.id}-madera` },
      update: {},
      create: {
        id: `prod-${org.id}-madera`,
        organizationId: org.id,
        name: "Tabla de Madera Pino",
        sku: "MP-MADERA-001",
        categoryId: rawCat.id,
        price: 350,
        cost: 180,
        stock: 100,
        minStock: 10,
      },
    }),
    prisma.product.upsert({
      where: { id: `prod-${org.id}-plywood` },
      update: {},
      create: {
        id: `prod-${org.id}-plywood`,
        organizationId: org.id,
        name: "Triplay 15mm",
        sku: "MP-PLYWOOD-001",
        categoryId: rawCat.id,
        price: 480,
        cost: 290,
        stock: 80,
        minStock: 10,
      },
    }),
    prisma.product.upsert({
      where: { id: `prod-${org.id}-manija` },
      update: {},
      create: {
        id: `prod-${org.id}-manija`,
        organizationId: org.id,
        name: "Manija de Acero Inoxidable",
        sku: "MP-MANija-001",
        categoryId: rawCat.id,
        price: 85,
        cost: 45,
        stock: 500,
        minStock: 50,
      },
    }),
    prisma.product.upsert({
      where: { id: `prod-${org.id}-bisagra` },
      update: {},
      create: {
        id: `prod-${org.id}-bisagra`,
        organizationId: org.id,
        name: "Bisagra de Acero",
        sku: "MP-BISAGRA-001",
        categoryId: rawCat.id,
        price: 35,
        cost: 18,
        stock: 1000,
        minStock: 100,
      },
    }),
    prisma.product.upsert({
      where: { id: `prod-${org.id}-tornilloMad` },
      update: {},
      create: {
        id: `prod-${org.id}-tornilloMad`,
        organizationId: org.id,
        name: "Tornillo para Madera",
        sku: "MP-TORNILLO-MAD-001",
        categoryId: rawCat.id,
        price: 0.30,
        cost: 0.15,
        stock: 20000,
        minStock: 2000,
      },
    }),
  ]);

  // Create furniture product
  const furnitureProduct = await prisma.product.upsert({
    where: { id: `prod-${org.id}-estante` },
    update: {},
    create: {
      id: `prod-${org.id}-estante`,
      organizationId: org.id,
      name: "Estante de Madera",
      sku: "MUEBLE-EST-001",
      categoryId: furnitureCat.id,
      price: 1200,
      cost: 0,
      stock: 0,
      hasAttributes: true,
    },
  });

  // Create BoM for furniture
  const existingFurnitureBom = await prisma.billOfMaterials.findFirst({
    where: {
      organizationId: org.id,
      productId: furnitureProduct.id,
    },
  });

  if (!existingFurnitureBom) {
    await prisma.billOfMaterials.create({
      data: {
        organizationId: org.id,
        productId: furnitureProduct.id,
        version: "1.0",
        isActive: true,
        isDefault: true,
        boMItems: {
          create: [
            {
              componentId: madera.id,
              quantity: 0,
              quantityFormula: "{width} * {height} * 0.02",
              isOptional: false,
              scrapPercent: 15,
              sequence: 1,
            },
            {
              componentId: plywood.id,
              quantity: 0,
              quantityFormula: "({width} * {height}) / 2",
              isOptional: false,
              scrapPercent: 10,
              sequence: 2,
            },
            {
              componentId: manija.id,
              quantity: 2,
              isOptional: false,
              scrapPercent: 0,
              sequence: 3,
            },
            {
              componentId: bisagra.id,
              quantity: 0,
              quantityFormula: "round({width} / 0.5)",
              isOptional: false,
              scrapPercent: 5,
              sequence: 4,
            },
            {
              componentId: tornilloMad.id,
              quantity: 0,
              quantityFormula: "round(({width} + {height}) * 10)",
              isOptional: false,
              scrapPercent: 10,
              sequence: 5,
            },
          ],
        },
      },
    });
    console.log("✅ BoM for furniture created");
  }

  console.log("\n✅ All manufacturing demo data created successfully!");
  console.log("\n📋 Summary:");
  console.log("- 3 Categories (Ventanas, Materia Prima, Muebles)");
  console.log("- 6 Attributes (width, height, depth, color, glass_type, material)");
  console.log("- 11 Raw Materials");
  console.log("- 2 Finished Products (Ventana de Aluminum, Estante de Madera)");
  console.log("- 2 BoMs with formulas");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
