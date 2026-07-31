import { faker } from '@faker-js/faker';
import { CreateProductType } from 'tests/types/create-product.type';

// Глобальный счётчик для генерации уникальных значений
let globalCounter = Date.now();

function toDateInputString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Генерирует уникальный EAN-13 на основе временной метки + счётчика
 * Формат: 200 + timestamp (10 цифр) + контрольная сумма
 */
function generateUniqueEAN(): string {
  // Date.now() возвращает 13 цифр. Отрезаем лишнее, чтобы влезть в лимит префикса.
  // Префикс 200 + 9 цифр таймстампа = 12 цифр базы
  const timestamp = String(Date.now()).slice(-9);
  const base = `200${timestamp}`;

  // Вычисляем контрольную сумму EAN-13
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    sum += parseInt(base[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const checksum = (10 - (sum % 10)) % 10;
  return base + checksum;
}

/**
 * Генерирует уникальный ASIN (Amazon Standard Identification Number)
 * Формат: B + 9 букв/цифр (всегда уникальный)
 */
function generateUniqueASIN(): string {
  const timestamp = globalCounter++;
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `B${String(timestamp).slice(-2)}${random.slice(0, 7)}`;
}

/**
 * Генерирует уникальный SKU на основе временной метки
 * Формат: SKU- + timestamp
 */
function generateUniqueSKU(): string {
  return `SKU-${globalCounter++}`;
}

export function createProductWithRequiredFieldsFixture(
  override: Partial<CreateProductType> = {},
): CreateProductType {
  return {
    sku: generateUniqueSKU(),
    name: faker.commerce.productName(),
    arrivalDate: toDateInputString(faker.date.past()),
    ...override,
  };
}

export function createProductWithAllFieldsFixture(
  override: Partial<CreateProductType> = {},
): CreateProductType {
  return {
    sku: generateUniqueSKU(),
    name: faker.commerce.productName(),
    arrivalDate: toDateInputString(faker.date.past()),
    asin: generateUniqueASIN(),
    ean: generateUniqueEAN(),
    purchasePrice: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    salePrice: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    ...override,
  };
}

/**
 * Создаёт массив товаров с гарантированно уникальными EAN и ASIN
 * @param count количество товаров
 */
export function createMultipleProducts(count: number): CreateProductType[] {
  const products: CreateProductType[] = [];
  const usedEANs = new Set<string>();
  const usedASINs = new Set<string>();
  const usedSKUs = new Set<string>();

  for (let i = 0; i < count; i++) {
    let ean: string;
    let asin: string;
    let sku: string;

    // Гарантируем уникальность EAN
    do {
      ean = generateUniqueEAN();
    } while (usedEANs.has(ean));
    usedEANs.add(ean);

    // Гарантируем уникальность ASIN
    do {
      asin = generateUniqueASIN();
    } while (usedASINs.has(asin));
    usedASINs.add(asin);

    // Гарантируем уникальность SKU
    do {
      sku = generateUniqueSKU();
    } while (usedSKUs.has(sku));
    usedSKUs.add(sku);

    products.push({
      sku,
      name: faker.commerce.productName(),
      arrivalDate: toDateInputString(faker.date.past()),
      asin,
      ean,
      purchasePrice: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      salePrice: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    });
  }

  return products;
}
