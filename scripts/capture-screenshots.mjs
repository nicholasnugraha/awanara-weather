/**
 * Capture screenshots aplikasi untuk dokumentasi progress.
 * Menghasilkan: screenshots/<route>-<viewport>-<theme>.png
 *
 * Jalankan: node scripts/capture-screenshots.mjs
 * Prasyarat: `pnpm build` sudah dijalankan & `pnpm start` berjalan di :3000.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "screenshots";
mkdirSync(OUT, { recursive: true });

const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";

const routes = [
  { path: "/", name: "home" },
  { path: "/forecast", name: "forecast" },
  { path: "/radar", name: "radar" },
  { path: "/settings", name: "settings" },
];

const viewports = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const themes = ["light", "dark"];

// Route selain home: desktop saja (cukup untuk dokumentasi).
function viewportsFor(routeName) {
  return routeName === "home" ? viewports : [viewports[2]];
}

const browser = await chromium.launch({
  channel: process.env.SCREENSHOT_CHANNEL ?? "msedge",
});

const captured = [];
for (const theme of themes) {
  for (const route of routes) {
    for (const vp of viewportsFor(route.name)) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      // Set tema SEBELUM script aplikasi berjalan (anti-FOUC script membaca ini)
      await context.addInitScript(
        ([t]) => {
          try {
            localStorage.setItem("awanara-theme", t);
            document.documentElement.setAttribute("data-theme", t);
          } catch {}
        },
        [theme],
      );
      const page = await context.newPage();
      await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: "networkidle",
      });
      // Beri waktu font & layout settle
      await page.waitForTimeout(400);
      const file = `${OUT}/${route.name}-${vp.name}-${theme}.png`;
      await page.screenshot({ path: file, fullPage: true });
      captured.push(file);
      await context.close();
    }
  }
}

await browser.close();
console.log(`Captured ${captured.length} screenshots:`);
for (const f of captured) console.log(`  ${f}`);
