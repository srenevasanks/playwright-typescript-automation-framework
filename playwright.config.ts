import { defineConfig, devices } from '@playwright/test';
import { config } from './src/utils/config';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: config.workers,
  retries: config.retries,
  timeout: 60000,
  expect: { timeout: 12000 },
  outputDir: process.env.RESULTS_DIR ?? 'test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: process.env.REPORT_DIR ?? 'playwright-report', open: 'never' }],
    ['json', { outputFile: process.env.JSON_REPORT ?? 'test-results/results.json' }],
    [
      'allure-playwright',
      { resultsDir: process.env.ALLURE_RESULTS_DIR ?? 'allure-results', detail: true },
    ],
  ],
  use: {
    baseURL: config.baseURL,
    testIdAttribute: 'data-test',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    screenshot: 'only-on-failure',
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    video: 'retain-on-failure',
    locale: 'en-US',
  },
  projects: [
    { name: 'api', testMatch: /api\/.*\.spec\.ts/ },
    ...(['chromium', 'firefox', 'webkit'] as const).map((name) => ({
      name,
      testIgnore: /api\/.*\.spec\.ts/,
      use: {
        ...devices[
          name === 'chromium'
            ? 'Desktop Chrome'
            : name === 'firefox'
              ? 'Desktop Firefox'
              : 'Desktop Safari'
        ],
        ...(name === 'chromium' && process.env.CHROMIUM_CHANNEL
          ? { channel: process.env.CHROMIUM_CHANNEL }
          : {}),
      },
    })),
  ],
});
