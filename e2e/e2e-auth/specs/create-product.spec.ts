import test, { expect, Locator } from '@playwright/test';
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
    const selectRandomOption = async (locator: Locator) => {
      const count = await locator.locator('option').count();
      if (count > 1) {
        const randomIndex = Math.floor(Math.random() * (count - 1)) + 1;
        await locator.selectOption({ index: randomIndex });
      }
    };
    const createProductPage = new CreateProductPage(page);
    await createProductPage.open();
    await expect(page).toHaveURL(createProductPage.url);
    const product = createProductWithAllFieldsFixture();
    await selectRandomOption(createProductPage.category);
    await selectRandomOption(createProductPage.state);
    await selectRandomOption(createProductPage.cell);
    await createProductPage.createProduct(product);
    await expect(page).toHaveURL(/\/warehouse\/products\/(?!create)/);
    await expect(page.locator('h2')).toHaveText(product.name);
  });
});
