import { BasePage } from './base.page';
import { Locator, Page } from '@playwright/test';

export class CatalogPage extends BasePage {
  readonly rows: Locator;
  readonly searchInput: Locator;
  readonly createButton: Locator;
  constructor(page: Page) {
    super(page);
    this.rows = page.locator('table tbody tr');
    this.searchInput = page.locator('input[name="search"]');
    this.createButton = page.locator('button[type="submit"]');
  }
  async open() {
    await this.goto('warehouse/products');
  }

  async clickFirstRow() {
    await this.rows.first().locator('td').nth(1).click();
    await this.page.waitForURL(/\/warehouse\/products\/.+/);
  }

  async search(text: string) {
    await this.searchInput.fill(text);
    await this.page.locator('button:has-text("Найти")').click();
  }
}
