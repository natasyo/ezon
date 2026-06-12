import { Locator, Page } from '@playwright/test';

export class BasePage {
  readonly logoutButton: Locator;
  readonly loginButton: Locator;
  constructor(public page: Page) {
    this.logoutButton = page.locator('header button:has-text("Выйти")');
    this.loginButton = page.locator('header a:has-text("Войти")');
  }
  async goto(path = '/') {
    await this.page.goto(path);
  }
  async logout(){
    await this.logoutButton.click();
  }
}
