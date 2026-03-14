import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should have main navigation menu", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible();
  });

  test("should have sidebar with menu items", async ({ page }) => {
    await expect(page.locator("aside")).toBeVisible();
  });

  test("should display dashboard page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should navigate to ventas page", async ({ page }) => {
    await page.goto("/ventas");
    await expect(page.locator("h1")).toContainText(/ventas/i);
  });

  test("should navigate to inventario page", async ({ page }) => {
    await page.goto("/inventario");
    await expect(page.locator("h1")).toContainText(/inventario/i);
  });

  test("should navigate to contabilidad page", async ({ page }) => {
    await page.goto("/contabilidad/asientos");
    await expect(page.locator("h1")).toBeVisible();
  });
});