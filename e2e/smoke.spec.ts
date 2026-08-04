import { test, expect } from "@playwright/test";

test("home page merender heading dan konten dasar", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: /cuaca, dalam genggaman/i }),
  ).toBeVisible();

  await expect(page.getByText(/sedang dalam pengembangan/i)).toBeVisible();
});
