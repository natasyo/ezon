import { APIRequestContext, expect, test } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { generateUser } from 'tests/fixture/register-user.fixture';
import { RegisterType } from 'tests/types/register.type';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: String(process.env.DATABASE_URL),
  }),
});

async function createUser(request: APIRequestContext, user: RegisterType) {
  return request.post('api/users/register', {
    data: user,
  });
}

test.describe('Register API', () => {
  test('POST /api/users/register — successfull registration', async ({
    request,
  }) => {
    const user = generateUser();
    const res = await createUser(request, user);
    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body.email).toBe(user.email);
    expect(body.password).toBeUndefined();

    const userInDb = await prisma.user.findUnique({
      where: { email: user.email },
    });
    expect(!!userInDb).toBeTruthy();
    await prisma.$disconnect();
  });

  test('POST /api/users/register — error, register with existing email', async ({
    request,
  }) => {
    const user = generateUser();
    const res = await createUser(request, user);
    expect(res.status()).toBe(201);

    const res2 = await createUser(request, user);
    expect(res2.status()).toBe(409);

    const body = await res2.json();
    expect(body.statusCode).toBe(409);
    expect(body.message).toHaveProperty('email');
    await prisma.$disconnect();
  });

  test('empty email — error validation', async ({ request }) => {
    const user = generateUser({ email: '' });
    const res = await createUser(request, user);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.statusCode).toBe(400);
    expect(Array.isArray(body.message)).toBeTruthy();
  });

  test('empty username — error validation', async ({ request }) => {
    const user = generateUser({ userName: '' });
    const res = await createUser(request, user);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.statusCode).toBe(400);
    expect(Array.isArray(body.message)).toBeTruthy();
  });
});
