import { faker } from '@faker-js/faker';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';

function toDateInputString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createProductWithRequiredFieldsFixture(
  override: Partial<CreateProductDto> = {},
): CreateProductDto {
  return {
    sku: faker.helpers.fromRegExp('SKU-[0-9]{3}'),
    name: faker.commerce.productName(),
    arrivalDate: toDateInputString(faker.date.past()),
    ...override,
  };
}

export function createProductWithAllFieldsFixture(
  override: Partial<CreateProductDto> = {},
): CreateProductDto {
  return {
    sku: faker.helpers.fromRegExp('SKU-[0-9]{3}'),
    name: faker.commerce.productName(),
    arrivalDate: toDateInputString(faker.date.past()),
    asin: faker.helpers.fromRegExp('B[0-9A-Z]{9}'),
    ean: faker.helpers.fromRegExp('[0-9]{13}'),
    purchasePrice: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    salePrice: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    ...override,
  };
}
