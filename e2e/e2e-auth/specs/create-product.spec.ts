import test, { expect } from '@playwright/test';
import { CreateProductPage } from '../pages/create-product.page';
import {
  createProductWithRequiredFieldsFixture,
  createProductWithAllFieldsFixture,
} from 'e2e/e2e-guest/fixtures/create-product.fixture';

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
});
