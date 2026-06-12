import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Ezon - e2e', () => {
  test('login&logout', async ({ page }) => {
    const login = new LoginPage(page);
    await page.goto('/warehouse/products');
    await expect(page).toHaveURL('/auth/login');

    await login.login('admin@ezon.local', 'password123');
    await expect(page).toHaveURL('/');
    await expect(login.logoutButton).toBeVisible();

    await login.logout();
    await expect(page).toHaveURL('/auth/login');
  });
});
