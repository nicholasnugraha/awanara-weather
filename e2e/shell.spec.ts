import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

test.describe("App shell responsive", () => {
  for (const vp of VIEWPORTS) {
    test(`layout ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      // Sidebar desktop (lg = 1024px) — hanya >= 1024
      const sidebar = page.locator("aside").filter({ hasText: "Awanara" });
      if (vp.width >= 1024) {
        await expect(sidebar).toBeVisible();
      } else {
        await expect(sidebar).toBeHidden();
      }

      // Bottom navigation mobile (< 768)
      const bottomNav = page
        .locator("nav[aria-label='Navigasi utama']")
        .last();
      if (vp.width < 768) {
        await expect(bottomNav).toBeVisible();
      } else {
        await expect(bottomNav).toBeHidden();
      }

      await page.screenshot({
        path: `test-results/screenshots/shell-${vp.name}.png`,
        fullPage: true,
      });
    });
  }

  test("navigasi ke halaman Prakiraan dan kembali", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await page.getByRole("link", { name: /prakiraan/i }).first().click();
    await expect(page).toHaveURL(/\/forecast$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /prakiraan cuaca/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: /kembali ke dashboard/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("skip link fokus dengan keyboard", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /langsung ke konten/i });
    await expect(skip).toBeFocused();
  });
});
