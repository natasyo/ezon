# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Ezon - e2e >> wrong password
- Location: e2e/specs/auth.spec.ts:24:7

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: locator('.error p')
Expected: "Неверный email или пароль"
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" with timeout 10000ms
  - waiting for locator('.error p')

```

```yaml
- banner:
  - link "📦 Ezon":
    - /url: /
  - navigation:
    - link "Главная":
      - /url: /
    - link "Каталог":
      - /url: /warehouse/products
    - link "Категории":
      - /url: /warehouse/categories
    - link "Сотрудники":
      - /url: /warehouse/users
    - link "Настройки":
      - /url: /warehouse/settings
    - link "Ячейки":
      - /url: /warehouse/cells
    - link "Поля":
      - /url: /warehouse/custom-fields
    - link "Войти":
      - /url: /auth/login
- main:
  - heading "Вход в Ezon" [level=2]
  - text: Email
  - textbox "Email":
    - /placeholder: user@example.com
  - text: Пароль
  - textbox "Пароль":
    - /placeholder: ••••••
  - button "Войти"
  - paragraph:
    - text: Нет аккаунта?
    - link "Зарегистрироваться":
      - /url: /users/register
- contentinfo: Ezon © 2026. Платформа управления складом.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { LoginPage } from '../pages/login.page';
  3  | 
  4  | const CREDS = {
  5  |   email: 'admin@ezon.local',
  6  |   password: 'password123',
  7  |   wrongPassword: 'wrongpass',
  8  | };
  9  | 
  10 | test.describe('Ezon - e2e', () => {
  11 |   test('login&logout', async ({ page }) => {
  12 |     const login = new LoginPage(page);
  13 |     await page.goto('/warehouse/products');
  14 |     await expect(page).toHaveURL('/auth/login');
  15 | 
  16 |     await login.login(CREDS.email, CREDS.password);
  17 |     await expect(page).toHaveURL('/');
  18 |     await expect(login.logoutButton).toBeVisible();
  19 | 
  20 |     await login.logout();
  21 |     await expect(page).toHaveURL('/auth/login', { timeout: 10000 });
  22 |   });
  23 | 
  24 |   test('wrong password', async ({ page }) => {
  25 |     const login = new LoginPage(page);
  26 |     await page.goto('/auth/login');
  27 |     await login.login(CREDS.email, CREDS.wrongPassword);
  28 |     await expect(page).toHaveURL('/auth/login');
> 29 |     await expect(page.locator('.error p')).toHaveText(
     |                                            ^ Error: expect(locator).toHaveText(expected) failed
  30 |       'Неверный email или пароль',
  31 |       { timeout: 10000 },
  32 |     );
  33 |   });
  34 | 
  35 |   test('empty fields', async ({ page }) => {
  36 |     const login = new LoginPage(page);
  37 |     await page.goto('/auth/login');
  38 |     await login.submitButton.click();
  39 |     await expect(page).toHaveURL('/auth/login');
  40 |     await expect(login.loginButton).toBeVisible();
  41 |   });
  42 | 
  43 |   test('fields is not valid', async ({ page }) => {
  44 |     const login = new LoginPage(page);
  45 |     await page.goto('/auth/login');
  46 |     await login.login('sdf', 'sdfsdf');
  47 |     await expect(page.locator('#email+.field-error')).toHaveText(
  48 |       'Некорректный email',
  49 |     );
  50 |   });
  51 | });
  52 | 
```