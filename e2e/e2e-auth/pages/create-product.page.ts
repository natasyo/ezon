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
  readonly createForm: Locator;
  readonly url = '/warehouse/products/create';
  constructor(page: Page) {
    super(page);
    this.sku = page.locator('input[name="sku"]');
    this.name = page.locator('input[@name="name"]');
    this.ean = page.locator('input[@name="ean"]');
    this.asin = page.locator('input[@name="asin"]');
    this.category = page.locator('select[@name="categoryId"]');
    this.state = page.locator('select[@name="condition"]');
    this.acquisitionPrice = page.locator('input[@name="purchasePrice"]');
    this.sellingPrice = page.locator('input[@name="salePrice"]');
    this.cell = page.locator('select[@name="cellId"]');
    this.dateAcquisition = page.locator('input[@name="arrivalDate"]');
    this.createButton = page.locator('button[@name="create-product-submit"]');
    this.createForm = page.locator('form[@name="create-product"]');
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
    //await this.page.waitForURL(/\/warehouse\/products\/(?!create)/);
  }

  async fillSelectInputs() {
    const selectOption = async (locator: Locator) => {
      const count = await locator.locator('option').count();
      if (count > 1) {
        await locator.selectOption({ index: 1 });
      }
    };
    await selectOption(this.category);
    await selectOption(this.state);
    await selectOption(this.cell);
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
