import { Page, Locator } from '@playwright/test';
export class BasePage {
  readonly header: Locator;
  constructor(protected page: Page) {
    this.header = page.locator('header');
  }
}
