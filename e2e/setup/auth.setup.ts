import { test as setup, request } from '@playwright/test';
import fs from 'fs';

const authFile = '.auth/user.json';

setup('prepare db and authenticate', async ({ baseURL }) => {
  // 1) Очистить БД (dev/test endpoint)
  await fetch(`${baseURL}/test/reset`, { method: 'POST' });

  // 2) Создать тестового пользователя через dev/test сид‑эндпоинт ИЛИ напрямую через API
  // Предпочтительно иметь /api/test-seed/create-user, иначе — обычный /auth/register
  await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@ezon.local',
      password: 'password123',
    }),
  });

  // 3) Логин через API и сохранить storageState
  if (!fs.existsSync('.auth')) fs.mkdirSync('.auth');

  const api = await request.newContext({ baseURL });
  const res = await api.post('/auth/login', {
    data: { email: 'admin@ezon.local', password: 'password123' },
  });
  if (!res.ok()) throw new Error(`Login failed: ${res.status()}`);

  await api.storageState({ path: authFile });
});
