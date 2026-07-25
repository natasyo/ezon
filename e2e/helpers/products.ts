import { APIRequestContext } from '@playwright/test';
import { CreateProductType } from 'e2e/types/create-product.type';

export const CATALOG_TEST_PRODUCTS: CreateProductType[] = [
  { sku: 'E2E-CAT-ALPHA', name: 'Alpha Test Product', ean: '1000000000001' },
  { sku: 'E2E-CAT-BETA', name: 'Beta Test Product', ean: '1000000000002' },
  { sku: 'E2E-CAT-GAMMA', name: 'Gamma Test рroduct', ean: '1000000000003' },
  { sku: 'E2E-CAT-DELTA', name: 'Delta Test Product', ean: '1000000000004' },
];

export async function createProductsViaApi(
  request: APIRequestContext,
  baseURL: string = 'http://127.0.0.1:4000',
  products: CreateProductType[],
) {
  let created = 0;
  for (const product of products) {
    const res = await request.post(`${baseURL}/warehouse/products`, {
      data: product,
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok()) {
      created++;
    } else {
      console.warn(
        `⚠️ Не удалось создать товар ${product.sku}: ${res.status()}`,
      );
    }
  }
  console.log(`✅ Создано товаров: ${created} из ${products.length}`);
  return created;
}
