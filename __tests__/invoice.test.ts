import { describe, it, expect } from "vitest";
import { invoiceSchema } from "@/lib/schemas/invoice";

describe("Invoice Schema Validation", () => {
  const validInvoice = {
    clientId: "client-123",
    number: "FE-1001",
    date: "2024-02-18",
    items: [
      {
        productId: "prod-1",
        description: "Test Product",
        quantity: 2,
        price: 100,
        tax: 19,
        total: 200,
      },
    ],
    subtotal: 200,
    tax: 38,
    total: 238,
    status: "DRAFT" as const,
  };

  it("should validate a correct invoice", () => {
    const result = invoiceSchema.safeParse(validInvoice);
    expect(result.success).toBe(true);
  });

  it("should reject an invoice without items", () => {
    const invalidInvoice = { ...validInvoice, items: [] };
    const result = invoiceSchema.safeParse(invalidInvoice);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Debe haber al menos un ítem");
    }
  });

  it("should reject an invoice with negative quantity", () => {
    const invalidInvoice = {
      ...validInvoice,
      items: [{ ...validInvoice.items[0], quantity: -1 }],
    };
    const result = invoiceSchema.safeParse(invalidInvoice);
    expect(result.success).toBe(false);
  });

  it("should reject an invoice with empty clientId", () => {
    const invalidInvoice = { ...validInvoice, clientId: "" };
    const result = invoiceSchema.safeParse(invalidInvoice);
    expect(result.success).toBe(false);
  });
});
