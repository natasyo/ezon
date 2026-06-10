import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CatalogPage extends BasePage {
  readonly rows: Locator;
  readonly searchInput: Locator;
  readonly createBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.rows       = page.locator('table tbody tr');
    this.searchInput = page.locator('input[name="search"]');
    this.createBtn  = page.locator('a:has-text("Новый товар")');
  }

  async open() { await this.goto('/warehouse/products'); }

  async clickFirstRow() {
    await this.rows.first().locator('td').nth(1).click(); // click on name cell
    await this.page.waitForURL(/\/warehouse\/products\/.+/);
  }

  async search(text: string) {
    await this.searchInput.fill(text);
    await this.page.locator('button:has-text("Найти")').click();
  }
}
