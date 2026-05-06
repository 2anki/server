import { defineConfig, devices } from '@playwright/test';

const shouldRunMockServer =
  process.env.PLAYWRIGHT_WITH_MOCK === 'true' ||
  process.argv.some((arg) => arg.includes('mock-api.spec.ts'));

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: '100%',
  reporter: 'html',
  use: {
    baseURL: process.env.CI ? 'http://localhost:4173' : 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: shouldRunMockServer
    ? [
        {
          command: 'node mock-server/server.js',
          url: 'http://localhost:2020/health',
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000,
        },
        {
          command: process.env.CI ? 'pnpm run preview' : 'pnpm run start',
          url: process.env.CI
            ? 'http://localhost:4173'
            : 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000,
        },
      ]
    : {
        command: process.env.CI ? 'pnpm run preview' : 'pnpm run start',
        url: process.env.CI ? 'http://localhost:4173' : 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      },
});
