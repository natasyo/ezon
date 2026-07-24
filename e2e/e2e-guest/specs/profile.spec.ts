import test, { expect } from '@playwright/test';
import {
  createRegisterData,
  getExistingUser,
} from 'e2e/e2e-guest/fixtures/user.fixture';
import { LoginPage } from '../pages/login.page';

import { ProfilePage } from '../pages/profile.page';
import { faker } from '@faker-js/faker';

test.describe('Test profile', () => {
  test.beforeEach(async ({ request, page }) => {
    const data = createRegisterData();
    const response = await request.post(
      'http://localhost:4000/users/register',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        data,
      },
    );
    expect(response.ok()).toBeTruthy();
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(data.email, data.password);
    await expect(page.locator('text=Профиль')).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.open();
    await expect(page).toHaveURL('/warehouse/profile');

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
    await profilePage.deactivateButton.click();
    await page.waitForURL(/\/auth\/login/);
  });
  test('successful edit', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    const email = faker.internet.email();
    await profilePage.open();
    await expect(page).toHaveURL('/warehouse/profile');
    await profilePage.editData({ email: email });
    await page.reload();
    await expect(profilePage.email).toHaveValue(email);
  });
  test('edit with existing email', async ({ page }) => {
    const user = getExistingUser();
    const profilePage = new ProfilePage(page);
    await profilePage.open();
    await expect(page).toHaveURL('/warehouse/profile');
    await profilePage.editData({ email: user.email });
    await expect(page.locator('#email+p')).toHaveText(
      'Пользователь с таким email уже существует',
    );
  });

  test('edit with existing username', async ({ page }) => {
    const user = getExistingUser();
    const profilePage = new ProfilePage(page);
    await profilePage.open();
    await expect(page).toHaveURL('/warehouse/profile');
    await profilePage.editData({ userName: user.userName });
    await expect(page.locator('#userName+p')).toHaveText(
      'Пользователь с таким именем уже существует',
    );
  });
  test('edit with invalid email, passwod, confirm password', async ({
    page,
  }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.open();
    await expect(page).toHaveURL('/warehouse/profile');
    await profilePage.fillForm({ email: 'invalid-email' });
    await expect(page.locator('#email+p')).toHaveText('Некорректный email');
    await profilePage.fillForm({ password: 'short', confirmPassword: 'short' });
    await expect(page.locator('#password+p')).toHaveText(
      'Пароль должен быть не менее 6 символов',
    );
    await profilePage.fillForm({
      password: 's33333hort',
      confirmPassword: 'shor444t',
    });
    await expect(page.locator('#confirmPassword+p')).toHaveText(
      'Пароли не совпадают',
    );
    await profilePage.fillForm({
      password: 's33333hort',
    });
    await expect(page.locator('body')).toContainText('Пароли не совпадают');
  });
});
