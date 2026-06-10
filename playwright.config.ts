import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4000',
    headless: true,
  },
  webServer: {
    command: 'npm run build && npm run start:prod',
    url: 'http://localhost:4000',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
