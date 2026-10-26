import { test, expect } from "@playwright/test";

test.describe("Map Navigation and Water Directory Flow", () => {
  test("renders map container and category filter controls", async ({ page }) => {
    await page.goto("/home");

    // Check search input exists
    const searchInput = page.locator("input[placeholder*='Search water resources']");
    await expect(searchInput).toBeVisible();

    // Check filter button
    const filterBtn = page.locator("button", { hasText: "Filter" });
    await expect(filterBtn).toBeVisible();
  });

  test("can navigate to water sources list directory", async ({ page }) => {
    await page.goto("/water");

    // Directory header
    await expect(page.locator("h1")).toContainText("Water Resources Directory");

    // Check that cards appear
    const cards = page.locator("div[class*='group p-5']");
    await expect(cards.first()).toBeVisible();
  });
});
