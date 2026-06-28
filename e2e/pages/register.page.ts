import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { RegisterDto } from 'src/modules/users/dto/register.dto';

export class RegisterPage extends BasePage {
  readonly username: Locator;
  readonly displayName: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  readonly submitButton: Locator;
  readonly logoutButton: Locator;
  constructor(page: Page) {
    super(page);
    this.username = page.locator("xpath=//input[@name='userName']");
    this.displayName = page.locator("xpath=//input[@name='displayName']");
    this.email = page.locator("xpath=//input[@name='email']");
    this.password = page.locator("xpath=//input[@name='password']");
    this.confirmPassword = page.locator(
      "xpath=//input[@name='confirmPassword']",
    );
    this.submitButton = page.locator('#register-submit');
    this.logoutButton = page.locator("xpath=//button[@name='logout']");
  }
  async open() {
    await this.goto('users/register');
  }

  async fillForm(user: RegisterDto) {
    const { confirmPassword, email, password, userName, displayName } = user;
    await this.username.fill(userName);
    await this.displayName.fill(displayName || '');
    await this.email.fill(email);
    await this.password.fill(password);
    await this.confirmPassword.fill(confirmPassword);
  }
  async registerUser(user: RegisterDto) {
    await this.fillForm(user);
    await this.submitButton.click();
  }
}
