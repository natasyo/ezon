import { faker } from '@faker-js/faker';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';

export function createProductFixture(): CreateProductDto {
  return {
    sku: faker.helpers.fromRegExp('SKU-[0-9]{3}'),
    name: faker.commerce.productName(),
    arrivalDate: faker.date.past().toDateString(),
  };
}
