import { test, expect } from "@playwright/test";

test.describe("Admin Login & Protection Flow", () => {
  test("displays admin login page with email and password inputs", async ({ page }) => {
    await page.goto("/admin/login");

    await expect(page.locator("h1")).toContainText("Admin Portal");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toContainText("Sign In to Control Center");
  });

  test("shows validation error on invalid form input", async ({ page }) => {
    await page.goto("/admin/login");

    const emailInput = page.locator("input[type='email']");
    const submitBtn = page.locator("button[type='submit']");

    await emailInput.fill("invalid-email");
    await submitBtn.click();

    // Native validation or feedback
    await expect(page.locator("input[type='email']:invalid")).toBeVisible();
  });
});
