import { test, expect } from "@playwright/test";

test("home page merender heading utama", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: /cuaca, dalam genggaman/i }),
  ).toBeVisible();
});

test("home page merender shell navigasi", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("navigation", { name: /navigasi utama/i }).first(),
  ).toBeVisible();
});
