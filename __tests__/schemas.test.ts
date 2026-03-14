import { describe, it, expect } from "vitest";
import { productSchema, inventoryMovementSchema } from "@/lib/schemas/product";
import { clientSchema } from "@/lib/schemas/client";
import { expenseSchema, expenseItemSchema } from "@/lib/schemas/expense";
import { invoiceSchema } from "@/lib/schemas/invoice";

describe("Product Schema", () => {
  const validProduct = {
    name: "Test Product",
    description: "A test product",
    price: "100.50",
    stock: "10",
    sku: "PROD-001",
    categoryId: "cat-123",
    cost: "50.00",
    minStock: "5",
    costMethod: "AVERAGE",
  };

  it("should validate a correct product", () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("should reject product without name", () => {
    const { name, ...product } = validProduct;
    const result = productSchema.safeParse(product);
    expect(result.success).toBe(false);
  });

  it("should reject product with negative price", () => {
    const result = productSchema.safeParse({ ...validProduct, price: "-10" });
    expect(result.success).toBe(false);
  });

  it("should reject product with negative stock", () => {
    const result = productSchema.safeParse({ ...validProduct, stock: "-5" });
    expect(result.success).toBe(false);
  });

  it("should reject product with negative cost", () => {
    const result = productSchema.safeParse({ ...validProduct, cost: "-20" });
    expect(result.success).toBe(false);
  });

  it("should accept valid cost methods", () => {
    const resultFIFO = productSchema.safeParse({ ...validProduct, costMethod: "FIFO" });
    const resultLIFO = productSchema.safeParse({ ...validProduct, costMethod: "LIFO" });
    const resultAverage = productSchema.safeParse({ ...validProduct, costMethod: "AVERAGE" });
    
    expect(resultFIFO.success).toBe(true);
    expect(resultLIFO.success).toBe(true);
    expect(resultAverage.success).toBe(true);
  });

  it("should reject invalid cost method", () => {
    const result = productSchema.safeParse({ ...validProduct, costMethod: "INVALID" });
    expect(result.success).toBe(false);
  });
});

describe("Inventory Movement Schema", () => {
  const validMovement = {
    productId: "prod-123",
    type: "PURCHASE",
    quantity: "10",
    unitCost: "50.00",
    reference: "PO-001",
    sourceType: "PURCHASE_ORDER",
    sourceId: "po-123",
    notes: "Test movement",
  };

  it("should validate a correct inventory movement", () => {
    const result = inventoryMovementSchema.safeParse(validMovement);
    expect(result.success).toBe(true);
  });

  it("should reject movement without productId", () => {
    const { productId, ...movement } = validMovement;
    const result = inventoryMovementSchema.safeParse(movement);
    expect(result.success).toBe(false);
  });

  it("should reject movement with quantity less than 1", () => {
    const result = inventoryMovementSchema.safeParse({ ...validMovement, quantity: "0" });
    expect(result.success).toBe(false);
  });

  it("should reject movement with negative unitCost", () => {
    const result = inventoryMovementSchema.safeParse({ ...validMovement, unitCost: "-10" });
    expect(result.success).toBe(false);
  });

  it("should accept all valid movement types", () => {
    const types = ["PURCHASE", "SALE", "ADJUSTMENT_IN", "ADJUSTMENT_OUT", "RETURN_IN", "RETURN_OUT", "TRANSFER_IN", "TRANSFER_OUT"];
    types.forEach(type => {
      const result = inventoryMovementSchema.safeParse({ ...validMovement, type });
      expect(result.success).toBe(true);
    });
  });
});

describe("Client Schema", () => {
  const validClient = {
    name: "Test Client",
    email: "client@example.com",
    phone: "809-123-4567",
    address: "Test Address",
    idNumber: "001-1234567-8",
    type: "CLIENT",
  };

  it("should validate a correct client", () => {
    const result = clientSchema.safeParse(validClient);
    expect(result.success).toBe(true);
  });

  it("should reject client without name", () => {
    const { name, ...client } = validClient;
    const result = clientSchema.safeParse(client);
    expect(result.success).toBe(false);
  });

  it("should reject client with invalid email", () => {
    const result = clientSchema.safeParse({ ...validClient, email: "invalid-email" });
    expect(result.success).toBe(false);
  });

  it("should accept client without email", () => {
    const { email, ...client } = validClient;
    const result = clientSchema.safeParse(client);
    expect(result.success).toBe(true);
  });

  it("should reject client without idNumber", () => {
    const { idNumber, ...client } = validClient;
    const result = clientSchema.safeParse(client);
    expect(result.success).toBe(false);
  });

  it("should accept valid client types", () => {
    const result = clientSchema.safeParse({ ...validClient, type: "PROVIDER" });
    expect(result.success).toBe(true);
  });
});

describe("Expense Schema", () => {
  const validExpense = {
    number: "Gasto-001",
    date: "2024-02-18",
    provider: "provider-123",
    categoryId: "cat-123",
    total: 1000,
    status: "PENDING",
    items: [
      {
        description: "Item 1",
        quantity: 2,
        price: 500,
        total: 1000,
      },
    ],
  };

  it("should validate a correct expense", () => {
    const result = expenseSchema.safeParse(validExpense);
    expect(result.success).toBe(true);
  });

  it("should reject expense without number", () => {
    const { number, ...expense } = validExpense;
    const result = expenseSchema.safeParse(expense);
    expect(result.success).toBe(false);
  });

  it("should reject expense without provider", () => {
    const { provider, ...expense } = validExpense;
    const result = expenseSchema.safeParse(expense);
    expect(result.success).toBe(false);
  });

  it("should reject expense without categoryId", () => {
    const { categoryId, ...expense } = validExpense;
    const result = expenseSchema.safeParse(expense);
    expect(result.success).toBe(false);
  });

  it("should accept expense without items", () => {
    const { items, ...expense } = validExpense;
    const result = expenseSchema.safeParse(expense);
    expect(result.success).toBe(true);
  });

  it("should reject expense item without description", () => {
    const result = expenseSchema.safeParse({
      ...validExpense,
      items: [{ ...validExpense.items![0], description: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("should reject expense item with quantity less than 1", () => {
    const result = expenseSchema.safeParse({
      ...validExpense,
      items: [{ ...validExpense.items![0], quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });
});

describe("Invoice Schema", () => {
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
        tax: 18,
        total: 236,
      },
    ],
    subtotal: 200,
    tax: 36,
    total: 236,
    status: "DRAFT" as const,
  };

  it("should validate a correct invoice", () => {
    const result = invoiceSchema.safeParse(validInvoice);
    expect(result.success).toBe(true);
  });

  it("should reject invoice without clientId", () => {
    const { clientId, ...invoice } = validInvoice;
    const result = invoiceSchema.safeParse(invoice);
    expect(result.success).toBe(false);
  });

  it("should reject invoice without items", () => {
    const result = invoiceSchema.safeParse({ ...validInvoice, items: [] });
    expect(result.success).toBe(false);
  });

  it("should accept valid invoice statuses", () => {
    const statuses = ["DRAFT", "SENT", "PAID", "CANCELLED", "PARTIAL"];
    statuses.forEach(status => {
      const result = invoiceSchema.safeParse({ ...validInvoice, status });
      expect(result.success).toBe(true);
    });
  });

  it("should reject invalid invoice status", () => {
    const result = invoiceSchema.safeParse({ ...validInvoice, status: "INVALID" });
    expect(result.success).toBe(false);
  });
});
