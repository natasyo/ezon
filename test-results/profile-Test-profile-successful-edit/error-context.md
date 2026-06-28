# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.ts >> Test profile >> successful edit
- Location: e2e\specs\profile.spec.ts:36:7

# Error details

```
Test timeout of 30000ms exceeded while running "afterEach" hook.
```

# Test source

```ts
  1  | import test, { expect } from '@playwright/test';
  2  | import { createRegisterData, getExistingUser } from 'e2e/fixtures/user.fixture';
  3  | import { LoginPage } from '../pages/login.page';
  4  | 
  5  | import { ProfilePage } from '../pages/profile.page';
  6  | import { faker } from '@faker-js/faker';
  7  | 
  8  | test.describe('Test profile', () => {
  9  |   test.beforeEach(async ({ request, page }) => {
  10 |     const data = createRegisterData();
  11 |     const response = await request.post(
  12 |       'http://localhost:4000/users/register',
  13 |       {
  14 |         headers: {
  15 |           'Content-Type': 'application/json',
  16 |         },
  17 |         data,
  18 |       },
  19 |     );
  20 |     console.log('Response status:', response.status());
  21 |     expect(response.status()).toBe(200);
  22 |     const loginPage = new LoginPage(page);
  23 |     await loginPage.open();
  24 |     await loginPage.login(data.email, data.password);
  25 |     await expect(page.locator('text=Профиль')).toBeVisible();
  26 |   });
  27 | 
> 28 |   test.afterEach(async ({ page }) => {
     |        ^ Test timeout of 30000ms exceeded while running "afterEach" hook.
  29 |     const profilePage = new ProfilePage(page);
  30 |     const dialogPromise = page.waitForEvent('dialog');
  31 |     await profilePage.deactivateButton.click();
  32 |     const dialog = await dialogPromise;
  33 |     await dialog.accept();
  34 |     await expect(page).toHaveURL(/\/auth\/login/);
  35 |   });
  36 |   test('successful edit', async ({ page }) => {
  37 |     const profilePage = new ProfilePage(page);
  38 |     const email = faker.internet.email();
  39 |     await profilePage.open();
  40 |     await expect(page).toHaveURL('/warehouse/profile');
  41 |     await profilePage.editData({ email: email });
  42 |     await page.reload();
  43 |     await expect(profilePage.email).toHaveValue(email);
  44 |   });
  45 |   test('edit with existing email', async ({ page }) => {
  46 |     const user = getExistingUser();
  47 |     const profilePage = new ProfilePage(page);
  48 |     await profilePage.open();
  49 |     await expect(page).toHaveURL('/warehouse/profile');
  50 |     await profilePage.editData({ email: user.email });
  51 |     await expect(page.locator('#email+p')).toHaveText(
  52 |       'Пользователь с таким email уже существует',
  53 |     );
  54 |   });
  55 | });
  56 | 
```