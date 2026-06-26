# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.ts >> Test profile >> successful edit
- Location: e2e/specs/profile.spec.ts:28:7

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  locator('//input[@name=\'email\']')
Expected: "Theresa91@hotmail.com"
Received: "Ofelia.Ebert54@gmail.com"
Timeout:  5000ms

Call log:
  - Expect "toHaveValue" with timeout 5000ms
  - waiting for locator('//input[@name=\'email\']')
    14 × locator resolved to <input id="email" required="" type="email" name="email" value="Ofelia.Ebert54@gmail.com" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
       - unexpected value "Ofelia.Ebert54@gmail.com"

```

```yaml
- textbox "Email": Ofelia.Ebert54@gmail.com
```

# Test source

```ts
  1  | import test, { expect } from '@playwright/test';
  2  | import { createRegisterData } from 'e2e/fixtures/user.fixture';
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
  28 |   test('successful edit', async ({ page }) => {
  29 |     const profilePage = new ProfilePage(page);
  30 |     const email = faker.internet.email();
  31 |     await profilePage.open();
  32 |     await expect(page).toHaveURL('/warehouse/profile');
  33 |     await profilePage.editData({ email: email });
  34 |     await page.reload();
> 35 |     await expect(profilePage.email).toHaveValue(email);
     |                                     ^ Error: expect(locator).toHaveValue(expected) failed
  36 |   });
  37 | });
  38 | 
```