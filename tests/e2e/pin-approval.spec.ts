import { test, expect } from "@playwright/test";

test.describe("Admin Submission Queue and Pin Approval Flow", () => {
  test("loads admin submissions queue page", async ({ page }) => {
    await page.goto("/admin/submissions");

    // Check heading
    await expect(page.locator("h1")).toContainText("Community Submissions");

    // Queue filter tabs
    await expect(page.locator("button", { hasText: "Pending" })).toBeVisible();
  });
});
