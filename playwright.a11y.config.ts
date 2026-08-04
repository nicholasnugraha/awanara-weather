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
    // Build production + start server in one command
    command: "pnpm exec playwright install chromium && pnpm build && pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: false, // Fresh start each time
    timeout: 240_000, // Increased for build + start
    stderr: [],
  },
});
