import test, { expect } from '@playwright/test';
import { createRegisterData, getExistingUser } from 'e2e/fixtures/user.fixture';
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
    console.log('Response status:', response.status());
    expect(response.status()).toBe(200);
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(data.email, data.password);
    await expect(page.locator('text=Профиль')).toBeVisible();
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
    const user=getExistingUser()
    const profilePage = new ProfilePage(page);
    await profilePage.open();
    await expect(page).toHaveURL('/warehouse/profile');
    await profilePage.editData({email:user.email})
      await expect(page.locator('#email+p')).toHaveText(
      'Пользователь с таким email уже существует',
    );
  })
});
