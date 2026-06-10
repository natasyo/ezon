import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductCardPage extends BasePage {
  readonly statusBadge: Locator;
  readonly nameInput: Locator;
  readonly saveBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.statusBadge = page.locator('.bg-blue-50');
    this.nameInput   = page.locator('input[name="name"]');
    this.saveBtn     = page.locator('button:has-text("Сохранить")');
  }

  async transitionTo(statusLabel: string) {
    await this.page
      .locator(`form[action$="/transition"] button:has-text("→ ${statusLabel}")`)
      .click();
    await this.page.waitForLoadState('networkidle');
  }
}
