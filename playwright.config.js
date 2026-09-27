import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
// The app takes its static GitHub Pages path only on *.github.io (services/api.js), so the suite
// resolves a Pages-like host to the local preview: any `/api/*` call is then a real bug.
const PAGES_ORIGIN = `http://telca1.github.io:${PORT}`;
// CI builds the site once in its own step; locally the UI suite builds what it tests.
const SERVE_COMMAND = process.env.UI_SKIP_BUILD
  ? `npx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`
  : `npx vite build --logLevel warn && npx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`;

export default defineConfig({
  testDir: './tests/ui',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `${PAGES_ORIGIN}/`,
    launchOptions: {
      args: [
        '--host-resolver-rules=MAP telca1.github.io 127.0.0.1',
        `--unsafely-treat-insecure-origin-as-secure=${PAGES_ORIGIN}`,
      ],
    },
    locale: 'en-US',
    serviceWorkers: 'block',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: SERVE_COMMAND,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
