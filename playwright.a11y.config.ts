import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/a11y",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    channel: process.env.CI ? undefined : "msedge",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm start", // Gunakan production server yang sudah jalan
    url: "http://localhost:3000",
    reuseExistingServer: true, // Reuse existing Next.js dev server
    timeout: 60_000,
  },
});
