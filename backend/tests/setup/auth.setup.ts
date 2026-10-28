import { test as setup, request as requestUI } from '@playwright/test';
import { createUser } from 'tests/e2e-auth/helpers/account';
import fs from 'fs';

const authFile = '.auth/user.json';

setup('prepare db and authenticate', async ({ baseURL, request }) => {
  // 1) Очистить БД (dev/test endpoint)
  // await fetch(`${baseURL}/test/reset`, { method: 'POST' });

  // 2) Создать тестового пользователя через dev/test сид‑эндпоинт ИЛИ напрямую через API
  // Предпочтительно иметь /api/test-seed/create-user, иначе — обычный /auth/register
  const user = { email: 'admin@ezon.local', password: 'password123' };

  await createUser(request, user);
  // 3) Логин через API и сохранить storageState
  if (!fs.existsSync('.auth')) fs.mkdirSync('.auth');

  const api = await requestUI.newContext({ baseURL });
  const res = await api.post('/auth/login', {
    data: user,
  });
  if (!res.ok()) throw new Error(`Login failed: ${res.status()}`);

  await api.storageState({ path: authFile });
});
