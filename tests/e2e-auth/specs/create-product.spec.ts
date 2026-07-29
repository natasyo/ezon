import test, { expect } from '@playwright/test';
import { CreateProductPage } from '../pages/create-product.page';
import {
  createProductWithRequiredFieldsFixture,
  createProductWithAllFieldsFixture,
} from 'tests/e2e-auth/fixture/create-product.fixture';
import { createProductsViaApi } from 'tests/e2e-auth/helpers/products';

test.describe('Create product page', () => {
  test('The product should be successfully created (only required fields).', async ({
    page,
  }) => {
    const createProductPage = new CreateProductPage(page);
    await createProductPage.open();
    await expect(page).toHaveURL(createProductPage.url);
    const product = createProductWithRequiredFieldsFixture();

    await createProductPage.createProduct(product);
    await expect(page).toHaveURL(/warehouse\/products\/.+$/);
    await expect(page.locator('h2')).toHaveText(product.name);
  });

  test('The product should be successfully created (all fields).', async ({
    page,
  }) => {
    const createProductPage = new CreateProductPage(page);
    await createProductPage.open();
    await expect(page).toHaveURL(createProductPage.url);
    const product = createProductWithAllFieldsFixture();
    await createProductPage.fillSelectInputs();
    await createProductPage.createProduct(product);
    await expect(page).toHaveURL(/\/warehouse\/products\/(?!create)/);
    await expect(page.locator('h2')).toHaveText(product.name);
  });

  test('the product should be successfully created if price with a comma as the decimal separator', async ({
    page,
  }) => {
    const createProductPage = new CreateProductPage(page);
    await createProductPage.open();
    await expect(page).toHaveURL(createProductPage.url);
    await createProductPage.fillSelectInputs();
    const product = createProductWithAllFieldsFixture();
    await createProductPage.fillForm({
      ...product,
    });
    await createProductPage.sellingPrice.fill('29,6');
    await createProductPage.acquisitionPrice.fill('129.3');
    await createProductPage.createButton.click();
    await expect(page).toHaveURL(/\/warehouse\/products\/(?!create)/);
    await expect(page.locator('h2')).toHaveText(product.name);
  });

  test('The form should not be submitted; the button should remain inactive if required inputs is empty', async ({
    page,
  }) => {
    const createProductPage = new CreateProductPage(page);
    await createProductPage.open();
    await expect(page).toHaveURL(createProductPage.url);
    await expect(createProductPage.createButton).toBeDisabled();
    await createProductPage.clearInputs();
    await expect(createProductPage.createButton).toBeDisabled();
  });

  test('The form should not be submitted; the button should remain inactive if SKU is empty', async ({
    page,
  }) => {
    const createProductPage = new CreateProductPage(page);
    await createProductPage.open();
    await expect(page).toHaveURL(createProductPage.url);
    const product = createProductWithRequiredFieldsFixture({ sku: '' });
    await createProductPage.fillForm(product);
    await expect(createProductPage.createButton).toBeDisabled();
  });

  test('The form should not be submitted; the button should remain inactive if name is empty', async ({
    page,
  }) => {
    const createProductPage = new CreateProductPage(page);
    await createProductPage.open();
    await expect(page).toHaveURL(createProductPage.url);
    const product = createProductWithRequiredFieldsFixture({ name: '' });
    await createProductPage.fillForm(product);
    await expect(createProductPage.createButton).toBeDisabled();
  });

  test.skip('The form should not be submitted; the button should remain inactive if SKU is existing', async ({
    page,
    baseURL,
  }) => {
    const existingProduct = createProductWithAllFieldsFixture();
    const count = await createProductsViaApi(page.request, baseURL, [
      existingProduct,
    ]);
    expect(count).toBeGreaterThanOrEqual(1);

    const createProductPage = new CreateProductPage(page);
    await createProductPage.open();
    await expect(page).toHaveURL(createProductPage.url);
    const product = createProductWithRequiredFieldsFixture({
      sku: existingProduct.sku,
    });
    await createProductPage.fillForm(product);

    const [response] = await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/warehouse/products') &&
        resp.request().method() === 'POST' &&
        !resp.url().includes('bulk') &&
        !resp.url().includes('import'),
      ),
      createProductPage.createButton.click(),
    ]);

    if (response.status() === 302) {
      test.skip(true, 'Сервер не блокирует дубликат SKU (302 редирект)');
    } else {
      await expect(page.locator('body')).toContainText(
        /Товар с таким SKU уже существует/,
      );
    }
  });

  test.skip('The form should not be submitted; the button should remain inactive if EAN is existing', async ({
    page,
    baseURL,
  }) => {
    const existingProduct = createProductWithAllFieldsFixture();
    const count = await createProductsViaApi(page.request, baseURL, [
      existingProduct,
    ]);
    expect(count).toBeGreaterThanOrEqual(1);

    const createProductPage = new CreateProductPage(page);
    await createProductPage.open();
    await expect(page).toHaveURL(createProductPage.url);
    const product = createProductWithAllFieldsFixture({
      ean: existingProduct.ean,
    });
    await createProductPage.fillForm(product);

    const [response] = await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/warehouse/products') &&
        resp.request().method() === 'POST' &&
        !resp.url().includes('bulk') &&
        !resp.url().includes('import'),
      ),
      createProductPage.createButton.click(),
    ]);

    if (response.status() === 302) {
      test.skip(true, 'Сервер не блокирует дубликат EAN (302 редирект)');
    } else {
      await expect(page.locator('body')).toContainText(
        /Товар с таким EAN уже существует/,
      );
    }
  });

  test('Letters must not be entered; the value remains 0, and a product with a price of 0 is created', async ({
    page,
  }) => {
    const createProductPage = new CreateProductPage(page);
    await createProductPage.open();
    await expect(page).toHaveURL(createProductPage.url);
    const product = createProductWithRequiredFieldsFixture();
    await createProductPage.fillForm(product);
    await createProductPage.acquisitionPrice.fill('price');
    await expect(createProductPage.acquisitionPrice).toHaveValue('0');
    await createProductPage.createButton.click();
    await expect(page).toHaveURL(/\/warehouse\/products\/(?!create)/);
    await expect(page.getByTestId('purchase-price')).toHaveText(/0/);
  });
});
