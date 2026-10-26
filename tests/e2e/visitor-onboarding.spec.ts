import { test, expect } from "@playwright/test";

test.describe("Visitor Onboarding Flow", () => {
  test("displays welcome page and allows visitor to set display name without password", async ({ page }) => {
    await page.goto("/welcome");

    // Check title and branding
    await expect(page.locator("h1")).toContainText("Welcome to IroWa");

    // Input display name
    const input = page.locator("input#display-name-input");
    await input.fill("Maria Santos");

    // Click continue
    const continueBtn = page.locator("button#continue-button");
    await continueBtn.click();

    // Should navigate to /home
    await expect(page).toHaveURL(/\/home/);
  });

  test("allows visitor to skip onboarding and browse directly", async ({ page }) => {
    await page.goto("/welcome");
    const skipLink = page.locator("a", { hasText: "Skip for now, browse anonymously" });
    await skipLink.click();

    await expect(page).toHaveURL(/\/home/);
  });
});
