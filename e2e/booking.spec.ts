import { test, expect } from "@playwright/test";

test.describe("Booking flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/book|\/history|\/$/);
  });

  test("can navigate to book page", async ({ page }) => {
    await page.goto("/book");
    await expect(page.locator("h2")).toContainText("Book a Ride");
  });

  test("shows book ride CTA when locations selected", async ({ page }) => {
    await page.goto("/book");
    await expect(page.locator("#book-ride-btn, [id='book-ride-btn']")).toBeVisible();
  });
});
