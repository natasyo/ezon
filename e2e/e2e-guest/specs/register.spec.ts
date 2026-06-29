import { createRegisterData } from 'e2e/e2e-guest/fixtures/user.fixture';
import test, { expect } from '@playwright/test';
import { RegisterPage } from 'e2e/e2e-guest/pages/register.page';

const USER = createRegisterData();
test.describe('register user', () => {
  test('successful register', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.open();
    await expect(page).toHaveURL('users/register');
    await registerPage.registerUser(USER);
    await expect(page).toHaveURL('auth/login');
  });
  test('registration with mismatched passwords', async ({ page }) => {
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
  test('register with existing email', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.open();
    await expect(page).toHaveURL('users/register');
    await registerPage.registerUser(USER);
    await expect(page.locator('.error p')).toHaveText(
      'Пользователь с таким email уже существует',
    );
  });
});
