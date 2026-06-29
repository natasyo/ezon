import { BasePage } from '../../e2e-guest/pages/base.page';
import { Locator, Page } from '@playwright/test';

export class CatalogPage extends BasePage {
  readonly rows: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly createLink: Locator;
  readonly filterInputs: { [key: string]: Locator };
  readonly bulkForm: Locator;
  readonly selectAllCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('table tbody tr');
    this.searchInput = page.locator('input[name="search"]');
    this.searchButton = page.locator('#search-catalog-submit');
    this.createLink = page.locator('a:has-text("+ Новый товар")');
    this.bulkForm = page.locator('#bulk-form');
    this.selectAllCheckbox = page.locator('#select-all');

    this.filterInputs = {
      sku: page.locator('input[name="sku"]'),
      ean: page.locator('input[name="ean"]'),
      asin: page.locator('input[name="asin"]'),
      condition: page.locator('input[name="condition"]'),
      status: page.locator('select[name="status"]'),
      cellId: page.locator('input[name="cellId"]'),
      categoryId: page.locator('input[name="categoryId"]'),
      header: page.locator('xpath=//details[@name="filters"]/summary'),
    };
  }

  async open() {
    await this.goto('warehouse/products');
  }

  async clickFirstRow() {
    await this.rows.first().locator('td').nth(2).click(); // name column
    await this.page.waitForURL(/\/warehouse\/products\/.+/);
  }

  async search(text: string) {
    await this.searchInput.fill(text);
    await this.searchButton.click();
  }

  async applyFilters(filters: Record<string, string>) {
    for (const [key, value] of Object.entries(filters)) {
      const input = this.filterInputs[key];
      if (input) {
        await input.fill(value);
      }
    }
    await this.searchButton.click();
  }

  async toggleFilters() {
    await this.filterInputs.header.click();
  }

  async clickCreate() {
    await this.createLink.click();
    await this.page.waitForURL('/warehouse/products/create');
  }

  async getRowCount() {
    return this.rows.count();
  }

  async selectFirstItems(count: number) {
    for (let i = 0; i < count; i++) {
      await this.rows.nth(i).locator('input[type="checkbox"]').check();
    }
  }
}
