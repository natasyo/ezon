import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Охватываем и setup, и все спеки в подпапках e2e/**
  testDir: './e2e',
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
    // 1) setup-проект: один раз логинится и создаёт .auth/user.json
    {
      name: 'setup',
      testMatch: 'e2e/setup/auth.setup.ts',
    },
    // 2) Авторизованные e2e-guest: используют storageState, но ИГНОРИРУЮТ гостевые спеки
    {
      name: 'e2e-auth',
      use: { storageState: '.auth/user.json' },
      dependencies: ['setup'],
      // все тесты кроме login|register|profile
      testIgnore: [
        // Игнорируем гостевые спеки, расположенные в e2e/e2e-guest/specs/**
        /e2e\/e2e-guest\/specs\/(auth|register|profile).*\.spec\.(ts|js)$/,
      ],
    },
    // 3) Гостевые e2e-guest: только login|register|profile, без storageState
    {
      name: 'e2e-guest',
      testMatch: [
        // В этот проект попадают только гостевые спеки
        /e2e\/e2e-guest\/specs\/(auth|register|profile).*\.spec\.(ts|js)$/,
      ],
      // storageState по умолчанию пустой → гость
    },
  ],
});
