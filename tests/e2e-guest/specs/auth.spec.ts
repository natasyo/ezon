import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

const CREDS = {
  email: 'admin@ezon.local',
  password: 'password123',
  wrongPassword: 'wrongpass',
};

test.describe('Ezon - e2e-guest', () => {
  test('login&logout', async ({ page }) => {
    const login = new LoginPage(page);
    await page.goto('/warehouse/products');
    await expect(page).toHaveURL('/auth/login');

    await login.login(CREDS.email, CREDS.password);
    await expect(page).toHaveURL('/warehouse/products');
    await expect(login.logoutButton).toBeVisible();

    await login.logout();
    await expect(page).toHaveURL('/auth/login', { timeout: 10000 });
  });

  test('wrong password', async ({ page }) => {
    const login = new LoginPage(page);
    await page.goto('/auth/login');
    await login.login(CREDS.email, CREDS.wrongPassword);
    await expect(page).toHaveURL('/auth/login');
    await expect(page.locator('.error p')).toHaveText(
      'Неверный email или пароль',
      { timeout: 10000 },
    );
  });

  test('empty fields', async ({ page }) => {
    const login = new LoginPage(page);
    await page.goto('/auth/login');
    await login.submitButton.click();
    await expect(page).toHaveURL('/auth/login');
    await expect(login.loginButton).toBeVisible();
  });

  test('fields is not valid', async ({ page }) => {
    const login = new LoginPage(page);
    await page.goto('/auth/login');
    await login.login('sdf', 'sdfsdf');
    await expect(page.locator('#email+.field-error')).toHaveText(
      'Некорректный email',
    );
  });
});
