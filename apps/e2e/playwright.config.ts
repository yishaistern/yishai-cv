// Browser end-to-end tests: the real React build served by the real Nest API,
// driven by Chromium. Run with `npm run e2e` (Nx builds api + web first).
import { defineConfig, devices } from '@playwright/test';

// Not 3001, so the suite can run while `npm run dev` is up.
const PORT = 3100;
const CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  // Tests share one server, so each one creates its own uniquely named version.
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 1000 } } }],
  webServer: {
    // In production mode the API also serves apps/web/dist, so one process is the whole app.
    command: 'node --enable-source-maps ../api/dist/main.js',
    url: `http://127.0.0.1:${PORT}/api/versions`,
    // A fresh in-memory database per run: never touches apps/api/data/cv.db.
    env: { PORT: String(PORT), CV_DB_PATH: ':memory:' },
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
