import { test, expect } from "@playwright/test";

test.describe("Invoice Creation Flow", () => {
  test("should display new invoice form", async ({ page }) => {
    await page.goto("/ventas/nueva");
    await expect(page.locator("h1")).toContainText(/nueva/i);
  });

  test("should have client selector in invoice form", async ({ page }) => {
    await page.goto("/ventas/nueva");
    await expect(page.locator('input[placeholder*="cliente" i]')).toBeVisible();
  });

  test("should have product selector in invoice form", async ({ page }) => {
    await page.goto("/ventas/nueva");
    await expect(page.locator('input[placeholder*="producto" i]')).toBeVisible();
  });

  test("should have total calculation in invoice form", async ({ page }) => {
    await page.goto("/ventas/nueva");
    await expect(page.locator("text=subtotal")).toBeVisible();
    await expect(page.locator("text=total")).toBeVisible();
  });
});