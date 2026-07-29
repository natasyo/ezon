import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });
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
    command: 'npm run build && npm run start:prod',
    url: 'http://127.0.0.1:4000',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'setup',
      testMatch: 'setup/auth.setup.ts',
    },
    {
      name: 'e2e-auth',
      use: { storageState: '.auth/user.json' },
      dependencies: ['setup'],
      testIgnore: [
        /e2e-guest\/specs\/(auth|register|profile).*\.spec\.(ts|js)$/,
      ],
    },
    {
      name: 'e2e-guest',
      testMatch: [
        /e2e-guest\/specs\/(auth|register|profile).*\.spec\.(ts|js)$/,
      ],
    },
  ],
});
