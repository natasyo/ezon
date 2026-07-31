import { APIRequestContext, expect, test } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { generateUser } from 'tests/fixture/register-user.fixture';
import { RegisterType } from 'tests/types/register.type';
import { register } from 'tsconfig-paths';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: String(process.env.DATABASE_URL),
  }),
});

async function createUser(request: APIRequestContext, user: RegisterType) {
  return request.post('users/register', {
    data: user,
    maxRedirects: 0,
  });
}

test.describe('Register API', () => {
  test('POST /users/register — successfull registration', async ({
    request,
  }) => {
    const user = generateUser();
    const res = await createUser(request, user);
    expect(res.headers()['location']).toBe('/auth/login');
    expect(res.status()).toBe(302);

    const userInDb = await prisma.user.findUnique({
      where: { email: user.email },
    });
    expect(!!userInDb).toBeTruthy();
    await prisma.$disconnect();
  });

  test('POST /users/register — error,register with existing email', async ({
    request,
  }) => {
    const user = generateUser();
    const res = await createUser(request, user);
    expect(res.headers()['location']).toBe('/auth/login');
    expect(res.status()).toBe(302);
    const res2 = await createUser(request, user);
    expect(res2.headers()['location']).toBe('/users/register');
    expect(res2.status()).toBe(302);
    await prisma.$disconnect();
  });

  test('empty email — error validation', async ({ request }) => {
    const user = generateUser({ email: '' });
    const res = await createUser(request, user);
    expect(res.status()).toBe(302);
    expect(res.headers()['location']).toContain('/users/register');
  });
  test('empty username — error validation', async ({ request }) => {
    const user = generateUser({ userName: '' });
    const res = await createUser(request, user);
    expect(res.status()).toBe(302);
    expect(res.headers()['location']).toContain('/users/register');
  });
});
