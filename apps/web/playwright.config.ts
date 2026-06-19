import { defineConfig, devices } from '@playwright/test';

/**
 * HRManager4U.ai — Playwright E2E Configuration
 * Targets: Chromium, Firefox
 * Reporter: HTML (with trace) + List (CI)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never',
      },
    ],
    ['json', { outputFile: 'playwright-results/results.json' }],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },

  projects: [
    // ─── Setup: global auth state ─────────────────────────────────────────────
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },

    // ─── Chromium ─────────────────────────────────────────────────────────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/auth.state.json',
      },
      dependencies: ['setup'],
    },

    // ─── Firefox ──────────────────────────────────────────────────────────────
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'e2e/auth.state.json',
      },
      dependencies: ['setup'],
    },

    // ─── Unauthenticated tests (auth, rbac) ───────────────────────────────────
    {
      name: 'chromium-anon',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /\/(auth|rbac|mfa)\.spec\.ts/,
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  outputDir: 'playwright-results',
});
