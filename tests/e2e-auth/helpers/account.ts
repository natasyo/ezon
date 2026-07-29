import { APIRequestContext } from '@playwright/test';

export async function createUser(
  request: APIRequestContext,
  user: { email: string; password: string },
  baseURL: string = 'http://localhost:4000',
) {
  const response = await request.post(`${baseURL}/users/register`, {
    headers: { 'content-type': 'application/json' },
    data: JSON.stringify({
      email: user.email,
      password: user.password,
    }),
  });
  return response;
}
