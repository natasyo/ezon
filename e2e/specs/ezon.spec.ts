import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { CatalogPage } from '../pages/catalog.page';
import { ProductCardPage } from '../pages/product-card.page';

test.describe('Ezon — E2E тесты', () => {

  // ---------- АВТОРИЗАЦИЯ ----------
  test.describe('Авторизация', () => {
    test('логин и логаут', async ({ page }) => {
      const login = new LoginPage(page);

      // гость → видит «Войти»
      await page.goto('/warehouse/products');
      await expect(page).toHaveURL('/auth/login');

      // входит
      await login.login('admin@ezon.local', 'password123');
      await expect(page).toHaveURL('/');
      await expect(login.logoutBtn).toBeVisible();

      // выходит
      await login.logout();
      await expect(page).toHaveURL('/auth/login');
    });
  });

  // ---------- КАТАЛОГ ----------
  test.describe('Каталог', () => {
    test.beforeEach(async ({ page }) => {
      await new LoginPage(page).login('admin@ezon.local', 'password123');
    });

    test('фильтр по статусу «Поступление»', async ({ page }) => {
      const catalog = new CatalogPage(page);
      await catalog.open();

      await page.locator('details summary').click();               // раскрыть фильтры
      await page.selectOption('select[name="status"]', 'ARRIVAL'); // выбрать статус
      await page.locator('button:has-text("Найти")').click();

      await expect(catalog.rows).toHaveCount(1);
      await expect(page.locator('table')).toContainText('Поступление');
    });

    test('массовое действие — сменить ячейку', async ({ page }) => {
      const catalog = new CatalogPage(page);
      await catalog.open();

      // выделить первые два товара
      await page.locator('.item-checkbox').nth(0).check();
      await page.locator('.item-checkbox').nth(1).check();

      await expect(page.locator('#bulk-form')).toBeVisible();
      await expect(page.locator('#selection-count')).toContainText('2');

      // применить
      await page.locator('#bulk-form input[name="cellId"]').fill('A-12');
      page.on('dialog', d => d.accept());
      await page.locator('#bulk-form button[type="submit"]').click();

      await expect(page).toHaveURL('/warehouse/products');
    });
  });

  // ---------- ЖИЗНЕННЫЙ ЦИКЛ ----------
  test.describe('Жизненный цикл товара', () => {
    test.beforeEach(async ({ page }) => {
      await new LoginPage(page).login('admin@ezon.local', 'password123');
    });

    test('полный цикл: Поступление → На складе → Размещён → Продан', async ({ page }) => {
      const catalog = new CatalogPage(page);
      await catalog.open();

      // создать товар
      await catalog.createBtn.click();
      await page.fill('input[name="sku"]', 'E2E-CYCLE');
      await page.fill('input[name="name"]', 'Тестовый товар');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/warehouse/products');

      // открыть его
      await catalog.search('E2E-CYCLE');
      await catalog.clickFirstRow();

      const card = new ProductCardPage(page);

      // Поступление → На складе
      await expect(card.statusBadge).toContainText('Поступление');
      await card.transitionTo('На складе');
      await expect(card.statusBadge).toContainText('На складе');

      // На складе → Размещён
      await card.transitionTo('Размещён');
      await expect(card.statusBadge).toContainText('Размещён');

      // Размещён → Продан
      await card.transitionTo('Продан');
      await expect(card.statusBadge).toContainText('Продан');
    });
  });

  // ---------- ОТРИЦАТЕЛЬНЫЕ ----------
  test.describe('Отрицательные сценарии', () => {
    test('пустая форма — кнопка не работает', async ({ page }) => {
      const login = new LoginPage(page);
      await login.open();
      await login.submitBtn.click();

      // должен остаться на странице логина (HTML5-валидация)
      await expect(page).toHaveURL('/auth/login');
    });

    test('несуществующий товар — 404', async ({ page }) => {
      await new LoginPage(page).login('admin@ezon.local', 'password123');
      await page.goto('/warehouse/products/nonexistent-id');

      await expect(page.locator('body')).toContainText('Товар не найден');
    });
  });
});
