import { NextResponse } from "next/server";
import { getScopedPrisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sanitizeString, sanitizeNumber } from "@/lib/security-validation";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "client" | "invoice" | "product" | "vehicle" | "workOrder";
  href: string;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const organizationId = session.user.organizationId;
    if (!organizationId) {
      return new NextResponse("Organization not found", { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    
    // Sanitizar inputs
    const rawQuery = searchParams.get("q") || "";
    const query = sanitizeString(rawQuery, 100);
    const limit = sanitizeNumber(searchParams.get("limit") || "10", 1, 50);

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const prismaOrg = getScopedPrisma(organizationId);
    const results: SearchResult[] = [];

    // Buscar Clientes
    const clients = await prismaOrg.client.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
          { idNumber: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { name: "asc" },
    });

    clients.forEach((client) => {
      results.push({
        id: client.id,
        title: client.name,
        subtitle: client.email || client.phone || "Cliente",
        type: "client",
        href: `/clientes/${client.id}`,
      });
    });

    // Buscar Productos
    const products = await prismaOrg.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { name: "asc" },
    });

    products.forEach((product) => {
      results.push({
        id: product.id,
        title: product.name,
        subtitle: product.sku || `RD$ ${product.price}`,
        type: "product",
        href: `/inventario/${product.id}`,
      });
    });

    // Buscar Vehículos
    const vehicles = await prismaOrg.vehicle.findMany({
      where: {
        OR: [
          { plates: { contains: query, mode: "insensitive" } },
          { brand: { contains: query, mode: "insensitive" } },
          { model: { contains: query, mode: "insensitive" } },
          { vin: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { client: true },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    vehicles.forEach((vehicle) => {
      results.push({
        id: vehicle.id,
        title: `${vehicle.brand} ${vehicle.model} (${vehicle.plates || "Sin placa"})`,
        subtitle: vehicle.client?.name || "Sin cliente",
        type: "vehicle",
        href: `/vehiculos/${vehicle.id}`,
      });
    });

    // Buscar Órdenes de Servicio
    const workOrders = await prismaOrg.workOrder.findMany({
      where: {
        OR: [
          { number: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { 
        vehicle: true, 
        client: true 
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    workOrders.forEach((wo) => {
      results.push({
        id: wo.id,
        title: `${wo.number} - ${wo.vehicle?.brand} ${wo.vehicle?.model}`,
        subtitle: wo.client?.name || "Sin cliente",
        type: "workOrder",
        href: `/ordenes-servicio/${wo.id}`,
      });
    });

    // Buscar Facturas
    const invoices = await prismaOrg.invoice.findMany({
      where: {
        OR: [
          { number: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { client: true },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    invoices.forEach((invoice) => {
      results.push({
        id: invoice.id,
        title: `Factura ${invoice.number}`,
        subtitle: invoice.client?.name || "Sin cliente",
        type: "invoice",
        href: `/ventas/${invoice.id}`,
      });
    });

    return NextResponse.json({ 
      results, 
      total: results.length 
    });
  } catch (error) {
    console.error("Error in global search:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
