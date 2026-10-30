import { randomBytes } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";
try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: "pnpm start --port 3100 --hostname 127.0.0.1",
    env: { WAITLIST_HMAC_SECRET: randomBytes(32).toString("hex") },
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
