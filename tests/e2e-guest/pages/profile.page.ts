import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ProfileType } from 'tests/types/profile.type';

export class ProfilePage extends BasePage {
  readonly username: Locator;
  readonly displayName: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  readonly submitButton: Locator;
  readonly deactivateButton: Locator;
  constructor(page: Page) {
    super(page);
    this.username = page.locator("xpath=//input[@name='userName']");
    this.displayName = page.locator("xpath=//input[@name='displayName']");
    this.email = page.locator("xpath=//input[@name='email']");
    this.password = page.locator("xpath=//input[@name='password']");
    this.confirmPassword = page.locator(
      "xpath=//input[@name='confirmPassword']",
    );
    this.submitButton = page.locator('#profile-submit');
    this.deactivateButton = page.locator('#profile-deactivate');
  }
  async open() {
    await this.goto('warehouse/profile');
  }

  async fillForm(profile: Partial< ProfileType>) {
    const fieldMap: Record<keyof  ProfileType, Locator> = {
      userName: this.username,
      confirmPassword: this.confirmPassword,
      displayName: this.displayName,
      email: this.email,
      password: this.password,
    };
    for (const [key, value] of Object.entries(profile)) {
      const locator = fieldMap[key as keyof  ProfileType];
      if (locator && value !== undefined) {
        await locator.fill(value as string);
      }
    }
  }
  async editData(profile: Partial< ProfileType>) {
    await this.fillForm(profile);
    await this.submitButton.click();
  }
}
