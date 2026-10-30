import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: false });
export default defineConfig({
  globalSetup: require.resolve(`./tests/setup/global-setup`),
  testDir: './tests',
  timeout: 30_000,
  retries: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:4000',
    headless: true,
  },
  webServer: {
    command: 'npm run build && PORT=4000 npm run start:prod',
    url: 'http://127.0.0.1:4000',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'api-guest',
      testMatch: 'api-guest/**/*.spec.ts',
    },
  ],
});
