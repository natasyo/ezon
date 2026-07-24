import { createRegisterData } from 'e2e/e2e-guest/fixtures/user.fixture';
import test, { expect } from '@playwright/test';
import { RegisterPage } from 'e2e/e2e-guest/pages/register.page';

test.describe('register user', () => {
  test('successful register', async ({ page }) => {
    const USER = createRegisterData();
    const registerPage = new RegisterPage(page);
    await registerPage.open();
    await expect(page).toHaveURL('users/register');
    await registerPage.registerUser(USER);
    await expect(page).toHaveURL('auth/login');
  });
  test('registration with mismatched passwords', async ({ page }) => {
    const USER = createRegisterData();
    const registerPage = new RegisterPage(page);
    await registerPage.open();
    await expect(page).toHaveURL('users/register');
    const userWithMismatchedPasswords = {
      ...USER,
      confirmPassword: 'differentPassword123',
    };
    await registerPage.fillForm(userWithMismatchedPasswords);
    await expect(registerPage.submitButton).toBeDisabled();
  });
  test('register with existing email', async ({ page, baseURL }) => {
    const USER = createRegisterData();
    const registerPage = new RegisterPage(page);
    const res = await page.request.post(`${baseURL}/users/register`, {
      data: USER,
    });
    expect(res.ok()).toBeTruthy();
    await registerPage.open();
    await expect(page).toHaveURL('users/register');
    await registerPage.registerUser(USER);
    await expect(page).toHaveURL('users/register');
    await expect(page.locator('.error')).toHaveText(
      'Пользователь с таким email уже существует',
    );
  });
});
