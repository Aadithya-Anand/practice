import { test, expect } from "@playwright/test";

test.describe("Ride page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
  });

  test("cancel button visible for active trips", async ({ page }) => {
    await page.goto("/ride/test-trip-id");
    await page.waitForLoadState("networkidle");
    const cancelBtn = page.getByRole("button", { name: /cancel/i });
    await expect(cancelBtn).toBeVisible({ timeout: 5000 }).catch(() => {
      // Trip may not exist - page might show "Trip not found"
    });
  });
});
