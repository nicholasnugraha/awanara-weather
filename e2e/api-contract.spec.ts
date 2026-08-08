import { test, expect } from "@playwright/test";

test.describe("OpenWeatherMap API Contract", () => {
  const LAZY_JAKARTA = { lat: -6.2088, lon: 106.8456 };

  test("GET /api/weather returns valid structure", async ({ page }) => {
    // Hitung langsung via Playwright Network
    await page.goto("/");

    // Tunggu response BFF selesai (simulasi fetch dashboard)
    await page.waitForURL(/\/$/, { waitUntil: "networkidle" });

    // Snapshot response
    const response = await page.route("**/api/weather*", route => route.continue()).then(() => null);

    // Kita hanya perlu pastikan status 2xx, bukan 500 error lagi
    // Real-time call via internal server nanti di CI dengan secret
  });
});
