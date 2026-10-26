import { test, expect } from "@playwright/test";

test.describe("Community Water Source Submission Flow", () => {
  test("fills out and submits a new community water source suggestion", async ({ page }) => {
    await page.goto("/submit-water");

    // Header
    await expect(page.locator("h1")).toContainText("Suggest a Water Source");

    // Fill fields
    await page.locator("input[placeholder*='e.g. Sitio Gabao Mountain Spring']").fill("E2E Test Spring");
    await page.locator("input[placeholder*='e.g. Maria Santos']").fill("Civic Contributor");
    await page.locator("textarea[placeholder*='Describe the source']").fill("Reliable mountain spring with steady flow.");

    // Submit button
    const submitBtn = page.locator("button", { hasText: "Submit Water Source" });
    await submitBtn.click();

    // Verify confirmation redirect
    await expect(page).toHaveURL(/\/submit-water\/success/);
    await expect(page.locator("h1")).toContainText("Submission Received");
  });
});
