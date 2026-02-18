import { test, expect } from "@playwright/test";

test.describe("Authentication flow", () => {
  test("should redirect to login if not authenticated", async ({ page }) => {
    // Attempt to access a protected route
    await page.goto("/");
    
    // Expect redirection to the login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("h2")).toContainText("Bienvenido a Davasoft");
  });

  test("login page should have the required fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText("Iniciar Sesión");
  });
});
