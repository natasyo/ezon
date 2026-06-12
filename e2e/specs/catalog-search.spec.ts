import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { CatalogPage } from '../pages/catalog.page';

test.describe('Поиск в каталоге', () => {
  let catalog: CatalogPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login('admin@ezon.local', 'password123');
    catalog = new CatalogPage(page);
    await catalog.open();
  });

  test('поиск по точному совпадению', async () => {
    await catalog.search('Монитор');
    await expect(catalog.rows).toHaveCount(1);
    await expect(catalog.page.locator('table')).toContainText('Монитор LG');
  });

  test('поиск нечувствителен к регистру', async () => {
    await catalog.search('монитор');
    await expect(catalog.rows).toHaveCount(1);
  });

  test('сброс поиска возвращает все товары', async ({ page }) => {
    await catalog.search('Монитор');
    await expect(catalog.rows).toHaveCount(1);

    await page.locator('a:has-text("Сбросить")').click();
    await expect(catalog.rows).not.toHaveCount(1); // больше одного товара
  });
});
