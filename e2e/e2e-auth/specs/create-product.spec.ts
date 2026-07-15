import test, { expect } from '@playwright/test';
import { CreateProductPage } from '../pages/create-product.page';
import { createProductFixture } from 'e2e/e2e-guest/fixtures/create-product.fixture';

test.describe('Create product page', () => {
  test('The product should be successfully created (only required fields).', async ({
    page,
  }) => {
    const createProductPage = new CreateProductPage(page);
    await createProductPage.open();
    await expect(page).toHaveURL(createProductPage.url);
    const product = createProductFixture();
    await createProductPage.createProduct(product);
    await expect(page).toHaveURL(/warehouse\/products\/.+$/);
    await expect(page.locator('h2')).toHaveText(product.name);
  });
});
