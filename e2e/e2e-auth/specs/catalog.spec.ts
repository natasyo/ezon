import test, { expect, request } from '@playwright/test';
import { CatalogPage } from '../pages/catalog.page';
import {
  CATALOG_TEST_PRODUCTS,
  createProductsViaApi,
} from 'e2e/e2e-auth/helpers/products';

test.describe('Test catalog', () => {
  test.beforeAll(async ({ baseURL }) => {
    const api = await request.newContext({ storageState: '.auth/user.json' });
    const count = await createProductsViaApi(
      api,
      baseURL,
      CATALOG_TEST_PRODUCTS,
    );
    expect(count).toBeGreaterThanOrEqual(1);
    await api.dispose();
  });

  test('should display catalog list and rows', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.open();
    await expect(page).toHaveURL('/warehouse/products');
    const count = await catalogPage.getRowCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should search by name', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.open();
    await catalogPage.search('test');
    await expect(page.locator('body')).toContainText(/Найдено:/);
  });

  test('should navigate to product detail', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.open();
    await catalogPage.clickFirstRow();
    await expect(page).toHaveURL(/\/warehouse\/products\/.+/);
  });

  test('should go to create product page', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.open();
    await catalogPage.clickCreate();
    await expect(page).toHaveURL('/warehouse/products/create');
  });

  test('should filter by SKU', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.open();
    await catalogPage.toggleFilters();
    await expect(catalogPage.filterInputs.sku).toBeVisible();
    const firstSku = await page
      .locator('table tbody tr td:nth-child(2)')
      .first()
      .innerText();
    await catalogPage.applyFilters({ sku: firstSku.trim() });
    const count = await catalogPage.getRowCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('bulk form appears after selecting items', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.open();
    await catalogPage.selectFirstItems(2);
    await expect(catalogPage.bulkForm).toBeVisible();
  });

  test('the filter panel should expand, and the fields should be visible', async ({
    page,
  }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.open();
    await catalogPage.toggleFilters();
    await expect(catalogPage.filterInputs.sku).toBeVisible();
    await expect(catalogPage.filterInputs.ean).toBeVisible();
    await expect(catalogPage.filterInputs.asin).toBeVisible();
    await expect(catalogPage.filterInputs.condition).toBeVisible();
    await expect(catalogPage.filterInputs.cellId).toBeVisible();
  });

  test('filter by SKU should return row with this SKU', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.open();
    await catalogPage.ensureFilterOpen();
    const [firstSKU] = await catalogPage.columnValues(2);
    test.skip(!firstSKU, 'Catalog is empty');
    await catalogPage.applyFilters({ sku: firstSKU });
    const skus = await catalogPage.columnValues(2);

    for (const sku of skus) {
      expect(sku.toLowerCase()).toBe(firstSKU.toLowerCase());
    }
  });

  test('Filtering by parameters should display "Nothing found" if the parameter is invalid.', async ({
    page,
  }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.open();

    for (const key of Object.keys(catalogPage.filterInputs)) {
      if (key !== 'status') {
        await catalogPage.ensureFilterOpen();
        await catalogPage.applyFilters({ [key]: 'invalid-value' });
        await expect(page.locator('body')).toContainText(/Ничего не найдено/);
        await catalogPage.applyFilters({ [key]: '' });
      }
    }
  });
});
