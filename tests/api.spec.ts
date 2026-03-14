import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("should return 401 for unauthenticated API calls", async ({ request }) => {
    const response = await request.get("/api/clients");
    expect(response.status()).toBe(401);
  });

  test("should have health check endpoint", async ({ request }) => {
    const response = await request.get("/api/auth/providers");
    expect(response.ok()).toBeTruthy();
  });
});