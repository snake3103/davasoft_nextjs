import { NextResponse } from "next/server";
import { unauthorizedResponse } from "@/lib/api-helpers";
import { 
  generateProductTemplate, 
  generateClientTemplate
} from "@/lib/excel-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/templates/products - Download products template
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (!type || !["products", "contacts"].includes(type)) {
    return NextResponse.json({ error: "Tipo inválido. Use 'products' o 'contacts'" }, { status: 400 });
  }

  try {
    let buffer: Buffer;
    let filename: string;

    if (type === "products") {
      buffer = await generateProductTemplate();
      filename = "plantilla_productos.xlsx";
    } else {
      buffer = await generateClientTemplate();
      filename = "plantilla_contactos.xlsx";
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Download template error:", error);
    return NextResponse.json({ error: "Error al generar plantilla" }, { status: 500 });
  }
}
