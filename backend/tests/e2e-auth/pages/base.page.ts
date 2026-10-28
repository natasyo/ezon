import { Locator, Page } from '@playwright/test';

export class BasePage {
  readonly logoutButton: Locator;
  readonly loginButton: Locator;
  constructor(public page: Page) {
    this.logoutButton = page.locator('#logout-btn');
    this.loginButton = page.locator('#login-btn');
  }
  async goto(path = '/') {
    await this.page.goto(path);
  }
  async logout() {
    await this.logoutButton.click();
  }
}
