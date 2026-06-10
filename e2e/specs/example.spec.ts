import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { CatalogPage } from '../pages/catalog.page';
import { ProductCardPage } from '../pages/product-card.page';

test.describe('Авторизация', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('страница входа открывается', async () => {
    await loginPage.open();
    await expect(loginPage.page.locator('h2')).toHaveText('Вход в Ezon');
  });

  test('успешный вход', async () => {
    await loginPage.open();
    await loginPage.login('admin@ezon.local', 'password123');
    await expect(loginPage.page).toHaveURL('/');
    await expect(loginPage.logoutBtn).toBeVisible();
  });

  test('неверный пароль показывает ошибку', async () => {
    await loginPage.open();
    await loginPage.login('admin@ezon.local', 'wrong');
    await expect(loginPage.errorBox).toContainText('Неверный email или пароль');
  });
});

test.describe('Каталог', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login('admin@ezon.local', 'password123');
  });

  test('отображает товары', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open();
    await expect(catalog.rows).not.toHaveCount(0);
  });

  test('переход в карточку', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open();
    await catalog.clickFirstRow();
    const card = new ProductCardPage(page);
    await expect(card.nameInput).toBeVisible();
  });

  test('выход', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open();
    await catalog.logout();
    await expect(page).toHaveURL('/auth/login');
  });
});
