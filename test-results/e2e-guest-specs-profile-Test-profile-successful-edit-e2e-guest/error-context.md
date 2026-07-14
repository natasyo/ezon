# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-guest/specs/profile.spec.ts >> Test profile >> successful edit
- Location: e2e/e2e-guest/specs/profile.spec.ts:37:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#profile-submit')
    - locator resolved to <button disabled type="submit" id="profile-submit" name="profile-submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors opacity-50 cursor-not-allowed">↵        Сохранить изменения↵      </button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    54 × waiting for element to be visible, enabled and stable
       - element is not enabled
     - retrying click action
       - waiting 500ms
    - waiting for" http://127.0.0.1:4000/warehouse/profile" navigation to finish...
    - navigated to "http://127.0.0.1:4000/warehouse/profile"
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying
    - locator resolved to <button disabled type="submit" id="profile-submit" name="profile-submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors opacity-50 cursor-not-allowed">↵        Сохранить изменения↵      </button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "📦 Ezon" [ref=e4] [cursor=pointer]:
        - /url: /
      - navigation [ref=e5]:
        - link "Главная" [ref=e6] [cursor=pointer]:
          - /url: /
        - link "Каталог" [ref=e7] [cursor=pointer]:
          - /url: /warehouse/products
        - link "Категории" [ref=e8] [cursor=pointer]:
          - /url: /warehouse/categories
        - link "Сотрудники" [ref=e9] [cursor=pointer]:
          - /url: /warehouse/users
        - link "Настройки" [ref=e10] [cursor=pointer]:
          - /url: /warehouse/settings
        - link "Ячейки" [ref=e11] [cursor=pointer]:
          - /url: /warehouse/cells
        - link "Поля" [ref=e12] [cursor=pointer]:
          - /url: /warehouse/custom-fields
        - link "Войти" [ref=e13] [cursor=pointer]:
          - /url: /auth/login
  - main [ref=e14]:
    - heading "Вход в Ezon" [level=2] [ref=e15]
    - generic [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]: Email
        - textbox "Email" [ref=e19]:
          - /placeholder: user@example.com
      - generic [ref=e20]:
        - generic [ref=e21]: Пароль
        - textbox "Пароль" [ref=e22]:
          - /placeholder: ••••••
      - button "Войти" [ref=e23] [cursor=pointer]
      - paragraph [ref=e24]:
        - text: Нет аккаунта?
        - link "Зарегистрироваться" [ref=e25] [cursor=pointer]:
          - /url: /users/register
  - contentinfo [ref=e26]:
    - generic [ref=e27]: Ezon © 2026. Платформа управления складом.
```

# Test source

```ts
  1  | import { Locator, Page } from '@playwright/test';
  2  | import { BasePage } from './base.page';
  3  | import { ProfileDto } from 'src/modules/users/dto/profile.dto';
  4  | 
  5  | export class ProfilePage extends BasePage {
  6  |   readonly username: Locator;
  7  |   readonly displayName: Locator;
  8  |   readonly email: Locator;
  9  |   readonly password: Locator;
  10 |   readonly confirmPassword: Locator;
  11 |   readonly submitButton: Locator;
  12 |   readonly deactivateButton: Locator;
  13 |   constructor(page: Page) {
  14 |     super(page);
  15 |     this.username = page.locator("xpath=//input[@name='userName']");
  16 |     this.displayName = page.locator("xpath=//input[@name='displayName']");
  17 |     this.email = page.locator("xpath=//input[@name='email']");
  18 |     this.password = page.locator("xpath=//input[@name='password']");
  19 |     this.confirmPassword = page.locator(
  20 |       "xpath=//input[@name='confirmPassword']",
  21 |     );
  22 |     this.submitButton = page.locator('#profile-submit');
  23 |     this.deactivateButton = page.locator('#profile-deactivate');
  24 |   }
  25 |   async open() {
  26 |     await this.goto('warehouse/profile');
  27 |   }
  28 | 
  29 |   async fillForm(profile: Partial<ProfileDto>) {
  30 |     const fieldMap: Record<keyof ProfileDto, Locator> = {
  31 |       userName: this.username,
  32 |       confirmPassword: this.confirmPassword,
  33 |       displayName: this.displayName,
  34 |       email: this.email,
  35 |       password: this.password,
  36 |     };
  37 |     for (const [key, value] of Object.entries(profile)) {
  38 |       const locator = fieldMap[key as keyof ProfileDto];
  39 |       if (locator && value !== undefined) {
  40 |         await locator.fill(value as string);
  41 |       }
  42 |     }
  43 |   }
  44 |   async editData(profile: Partial<ProfileDto>) {
  45 |     await this.fillForm(profile);
> 46 |     await this.submitButton.click();
     |                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
  47 |   }
  48 | }
  49 | 
```