import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { CreateProductType } from 'e2e/types/create-product.type';

export class CreateProductPage extends BasePage {
  readonly sku: Locator;
  readonly name: Locator;
  readonly ean: Locator;
  readonly asin: Locator;
  readonly category: Locator;
  readonly state: Locator;
  readonly acquisitionPrice: Locator;
  readonly sellingPrice: Locator;
  readonly cell: Locator;
  readonly dateAcquisition: Locator;
  readonly createButton: Locator;
  readonly url = '/warehouse/products/create';
  constructor(page: Page) {
    super(page);
    this.sku = page.locator('xpath=//input[@name="sku"]');
    this.name = page.locator('xpath=//input[@name="name"]');
    this.ean = page.locator('xpath=//input[@name="ean"]');
    this.asin = page.locator('xpath=//input[@name="asin"]');
    this.category = page.locator('xpath=//select[@name="categoryId"]');
    this.state = page.locator('xpath=//select[@name="condition"]');
    this.acquisitionPrice = page.locator(
      'xpath=//input[@name="purchasePrice"]',
    );
    this.sellingPrice = page.locator('xpath=//input[@name="salePrice"]');
    this.cell = page.locator('xpath=//select[@name="cellId"]');
    this.dateAcquisition = page.locator('xpath=//input[@name="arrivalDate"]');
    this.createButton = page.locator(
      'xpath=//button[@name="create-product-submit"]',
    );
  }
  async open() {
    await this.goto(this.url);
  }
  async fillForm(product: CreateProductType) {
    const { sku, name, ean } = product;
    await this.sku.fill(sku);
    await this.name.fill(name);
    await this.ean.fill(ean || '');
    await this.asin.fill(product.asin || '');
    await this.acquisitionPrice.fill(product.purchasePrice?.toString() || '');
    await this.sellingPrice.fill(product.salePrice?.toString() || '');
    await this.dateAcquisition.fill(product.arrivalDate || '');
  }
  async createProduct(product: CreateProductType) {
    await this.fillForm(product);
    await this.createButton.click();
    await this.page.waitForURL(/\/warehouse\/products\/(?!create)/);
  }

  async fillSelectInputs() {
    const selectRandomOption = async (locator: Locator) => {
      const count = await locator.locator('option').count();
      if (count > 1) {
        const randomIndex = Math.floor(Math.random() * (count - 1)) + 1;
        await locator.selectOption({ index: randomIndex });
      }
    };
    await selectRandomOption(this.category);
    await selectRandomOption(this.state);
    await selectRandomOption(this.cell);
  }

  async clearInputs() {
    await this.sku.clear();
    await this.name.clear();
    await this.ean.clear();
    await this.asin.clear();
    await this.acquisitionPrice.clear();
    await this.sellingPrice.clear();
    await this.dateAcquisition.clear();

    await this.category.selectOption({ index: 0 });
    await this.state.selectOption({ index: 0 });
    await this.cell.selectOption({ index: 0 });
  }
}
