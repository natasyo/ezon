# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: register.spec.ts >> register user >> register with existing email
- Location: e2e/specs/register.spec.ts:25:7

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: locator('.error p')
Expected: "Пользователь с таким email уже существует"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for locator('.error p')

```

```yaml
- text: "{\"message\":\"Email или userName уже занят\",\"error\":\"Conflict\",\"statusCode\":409}"
```

# Test source

```ts
  1  | import { createRegisterData } from 'e2e/fixtures/user.fixture';
  2  | import test, { expect } from '@playwright/test';
  3  | import { RegisterPage } from 'e2e/pages/register.page';
  4  | 
  5  | const USER = createRegisterData();
  6  | test.describe('register user', () => {
  7  |   test('successful register', async ({ page }) => {
  8  |     const registerPage = new RegisterPage(page);
  9  |     await registerPage.open();
  10 |     await expect(page).toHaveURL('users/register');
  11 |     await registerPage.registerUser(USER);
  12 |     await expect(page).toHaveURL('auth/login');
  13 |   });
  14 |   test('registration with mismatched passwords', async ({ page }) => {
  15 |     const registerPage = new RegisterPage(page);
  16 |     await registerPage.open();
  17 |     await expect(page).toHaveURL('users/register');
  18 |     const userWithMismatchedPasswords = {
  19 |       ...USER,
  20 |       confirmPassword: 'differentPassword123',
  21 |     };
  22 |     await registerPage.fillForm(userWithMismatchedPasswords);
  23 |     await expect(registerPage.submitButton).toBeDisabled();
  24 |   });
  25 |   test('register with existing email', async ({ page }) => {
  26 |     const registerPage = new RegisterPage(page);
  27 |     await registerPage.open();
  28 |     await expect(page).toHaveURL('users/register');
  29 |     await registerPage.registerUser(USER);
> 30 |     await expect(page.locator('.error p')).toHaveText(
     |                                            ^ Error: expect(locator).toHaveText(expected) failed
  31 |       'Пользователь с таким email уже существует',
  32 |     );
  33 |   });
  34 | });
  35 | 
```