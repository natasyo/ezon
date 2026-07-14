# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-auth/specs/catalog.spec.ts >> Test catalog >> Filtering by parameters should display "Nothing found" if the parameter is invalid.
- Location: e2e/e2e-auth/specs/catalog.spec.ts:82:7

# Error details

```
Error: locator.fill: Error: Element is not an <input>, <textarea>, <select> or [contenteditable] and does not have a role allowing [aria-readonly]
Call log:
  - waiting for locator('//details[@name="filters"]/summary')
    - locator resolved to <summary class="text-sm text-gray-500 cursor-pointer hover:text-gray-700 select-none">↵          Фильтры ▾↵        </summary>
    - fill("invalid-value")
  - attempting fill action
    - waiting for element to be visible, enabled and editable

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
        - link "Профиль" [ref=e13] [cursor=pointer]:
          - /url: /warehouse/profile
        - button "Выйти" [ref=e15] [cursor=pointer]
  - main [ref=e16]:
    - generic [ref=e17]:
      - heading "Каталог товаров" [level=2] [ref=e18]
      - link "+ Новый товар" [ref=e19] [cursor=pointer]:
        - /url: /warehouse/products/create
    - generic [ref=e20]:
      - generic [ref=e21]:
        - textbox "Поиск по наименованию..." [ref=e22]
        - button "Найти" [ref=e23] [cursor=pointer]
        - link "Сбросить" [ref=e24] [cursor=pointer]:
          - /url: /warehouse/products
      - group [ref=e25]:
        - generic "Фильтры ▾" [active] [ref=e26] [cursor=pointer]
        - generic [ref=e27]:
          - generic [ref=e28]:
            - generic [ref=e29]: SKU
            - textbox [ref=e30]
          - generic [ref=e31]:
            - generic [ref=e32]: EAN
            - textbox [ref=e33]
          - generic [ref=e34]:
            - generic [ref=e35]: ASIN
            - textbox [ref=e36]
          - generic [ref=e37]:
            - generic [ref=e38]: Состояние
            - textbox [ref=e39]
          - generic [ref=e40]:
            - generic [ref=e41]: Статус
            - combobox [ref=e42]:
              - option "Все" [selected]
              - option "Поступление"
              - option "На складе"
              - option "Размещён"
              - option "Продан"
              - option "Списан"
          - generic [ref=e43]:
            - generic [ref=e44]: Ячейка
            - textbox [ref=e45]
          - generic [ref=e46]:
            - generic [ref=e47]: Категория (ID)
            - textbox [ref=e48]
    - generic [ref=e49]:
      - generic [ref=e50]: "Найдено: 6"
      - generic [ref=e51]: Стр. 1 из 1
    - table [ref=e53]:
      - rowgroup [ref=e54]:
        - row "SKU Наименование Категория Цена продажи Статус Ячейка" [ref=e55]:
          - columnheader [ref=e56]:
            - checkbox [ref=e57]
          - columnheader "SKU" [ref=e58]
          - columnheader "Наименование" [ref=e59]
          - columnheader "Категория" [ref=e60]
          - columnheader "Цена продажи" [ref=e61]
          - columnheader "Статус" [ref=e62]
          - columnheader "Ячейка" [ref=e63]
      - rowgroup [ref=e64]:
        - row "SKU-001 Монитор LG UltraFine 27\" Электроника 52 000 ₽ Поступление A-12" [ref=e65]:
          - cell [ref=e66]:
            - checkbox [ref=e67]
          - cell "SKU-001" [ref=e68]
          - cell "Монитор LG UltraFine 27\"" [ref=e69] [cursor=pointer]
          - cell "Электроника" [ref=e70] [cursor=pointer]
          - cell "52 000 ₽" [ref=e71] [cursor=pointer]
          - cell "Поступление" [ref=e72] [cursor=pointer]:
            - generic [ref=e73]: Поступление
          - cell "A-12" [ref=e74] [cursor=pointer]
        - row "SKU-006 Стол компьютерный Ergolife Мебель 10 ₽ На складе D-01" [ref=e75]:
          - cell [ref=e76]:
            - checkbox [ref=e77]
          - cell "SKU-006" [ref=e78]
          - cell "Стол компьютерный Ergolife" [ref=e79] [cursor=pointer]
          - cell "Мебель" [ref=e80] [cursor=pointer]
          - cell "10 ₽" [ref=e81] [cursor=pointer]
          - cell "На складе" [ref=e82] [cursor=pointer]:
            - generic [ref=e83]: На складе
          - cell "D-01" [ref=e84] [cursor=pointer]
        - row "SKU-003 SSD Samsung 1TB Комплектующие 10 ₽ Размещён C-07" [ref=e85]:
          - cell [ref=e86]:
            - checkbox [ref=e87]
          - cell "SKU-003" [ref=e88]
          - cell "SSD Samsung 1TB" [ref=e89] [cursor=pointer]
          - cell "Комплектующие" [ref=e90] [cursor=pointer]
          - cell "10 ₽" [ref=e91] [cursor=pointer]
          - cell "Размещён" [ref=e92] [cursor=pointer]:
            - generic [ref=e93]: Размещён
          - cell "C-07" [ref=e94] [cursor=pointer]
        - row "SKU-004 Мышь Razer DeathAdder Периферия 7 900 ₽ Продан C-07" [ref=e95]:
          - cell [ref=e96]:
            - checkbox [ref=e97]
          - cell "SKU-004" [ref=e98]
          - cell "Мышь Razer DeathAdder" [ref=e99] [cursor=pointer]
          - cell "Периферия" [ref=e100] [cursor=pointer]
          - cell "7 900 ₽" [ref=e101] [cursor=pointer]
          - cell "Продан" [ref=e102] [cursor=pointer]:
            - generic [ref=e103]: Продан
          - cell "C-07" [ref=e104] [cursor=pointer]
        - row "SKU-005 Блок питания 500W (брак) Комплектующие 0 ₽ Списан C-07" [ref=e105]:
          - cell [ref=e106]:
            - checkbox [ref=e107]
          - cell "SKU-005" [ref=e108]
          - cell "Блок питания 500W (брак)" [ref=e109] [cursor=pointer]
          - cell "Комплектующие" [ref=e110] [cursor=pointer]
          - cell "0 ₽" [ref=e111] [cursor=pointer]
          - cell "Списан" [ref=e112] [cursor=pointer]:
            - generic [ref=e113]: Списан
          - cell "C-07" [ref=e114] [cursor=pointer]
        - row "SKU-002 Клавиатура Logitech MX Keys Периферия 12 990 ₽ На складе B-04" [ref=e115]:
          - cell [ref=e116]:
            - checkbox [ref=e117]
          - cell "SKU-002" [ref=e118]
          - cell "Клавиатура Logitech MX Keys" [ref=e119] [cursor=pointer]
          - cell "Периферия" [ref=e120] [cursor=pointer]
          - cell "12 990 ₽" [ref=e121] [cursor=pointer]
          - cell "На складе" [ref=e122] [cursor=pointer]:
            - generic [ref=e123]: На складе
          - cell "B-04" [ref=e124] [cursor=pointer]
  - contentinfo [ref=e125]:
    - generic [ref=e126]: Ezon © 2026. Платформа управления складом.
```

# Test source

```ts
  1  | import { BasePage } from '../../e2e-guest/pages/base.page';
  2  | import { Locator, Page } from '@playwright/test';
  3  | 
  4  | export class CatalogPage extends BasePage {
  5  |   readonly rows: Locator;
  6  |   readonly searchInput: Locator;
  7  |   readonly searchButton: Locator;
  8  |   readonly createLink: Locator;
  9  |   readonly filterInputs: { [key: string]: Locator };
  10 |   readonly bulkForm: Locator;
  11 |   readonly selectAllCheckbox: Locator;
  12 |   readonly filterDetails: Locator;
  13 | 
  14 |   constructor(page: Page) {
  15 |     super(page);
  16 |     this.rows = page.locator('xpath=//tbody/tr');
  17 |     this.searchInput = page.locator('input[name="search"]');
  18 |     this.searchButton = page.locator('#search-catalog-submit');
  19 |     this.createLink = page.locator('a:has-text("+ Новый товар")');
  20 |     this.bulkForm = page.locator('#bulk-form');
  21 |     this.selectAllCheckbox = page.locator('#select-all');
  22 |     this.filterDetails = page.locator('details[name="filters"]');
  23 | 
  24 |     this.filterInputs = {
  25 |       sku: page.locator('input[name="sku"]'),
  26 |       ean: page.locator('input[name="ean"]'),
  27 |       asin: page.locator('input[name="asin"]'),
  28 |       condition: page.locator('input[name="condition"]'),
  29 |       status: page.locator('select[name="status"]'),
  30 |       cellId: page.locator('input[name="cellId"]'),
  31 |       categoryId: page.locator('input[name="categoryId"]'),
  32 |       header: page.locator('xpath=//details[@name="filters"]/summary'),
  33 |     };
  34 |   }
  35 | 
  36 |   async open() {
  37 |     await this.goto('warehouse/products');
  38 |   }
  39 | 
  40 |   async clickFirstRow() {
  41 |     await this.rows.first().locator('td').nth(2).click(); // name column
  42 |     await this.page.waitForURL(/\/warehouse\/products\/.+/);
  43 |   }
  44 | 
  45 |   async search(text: string) {
  46 |     await this.searchInput.fill(text);
  47 |     await this.searchButton.click();
  48 |   }
  49 | 
  50 |   async ensureFilterOpen() {
  51 |     const isOpen = await this.filterDetails.evaluate(
  52 |       (el) => (el as HTMLDetailsElement).open,
  53 |     );
  54 |     if (!isOpen) {
  55 |       await this.filterInputs.header.click();
  56 |     }
  57 |     await this.filterInputs.sku.waitFor({ state: 'visible' });
  58 |   }
  59 |   async applyFilters(filters: Record<string, string>) {
  60 |     for (const [key, value] of Object.entries(filters)) {
  61 |       const input = this.filterInputs[key];
  62 |       if (input) {
> 63 |         await input.fill(value);
     |                     ^ Error: locator.fill: Error: Element is not an <input>, <textarea>, <select> or [contenteditable] and does not have a role allowing [aria-readonly]
  64 |       }
  65 |     }
  66 |     await this.searchButton.click();
  67 |   }
  68 | 
  69 |   async toggleFilters() {
  70 |     await this.filterInputs.header.click();
  71 |   }
  72 | 
  73 |   async clickCreate() {
  74 |     await this.createLink.click();
  75 |     await this.page.waitForURL('/warehouse/products/create');
  76 |   }
  77 | 
  78 |   async getRowCount() {
  79 |     return this.rows.count();
  80 |   }
  81 | 
  82 |   async selectFirstItems(count: number) {
  83 |     for (let i = 0; i < count; i++) {
  84 |       await this.rows.nth(i).locator('input[type="checkbox"]').check();
  85 |     }
  86 |   }
  87 | 
  88 |   async columnValues(nthChild: number) {
  89 |     const cells = this.page.locator(`table tbody tr td:nth-child(${nthChild})`);
  90 |     return (await cells.allInnerTexts()).map((cell) => cell.trim());
  91 |   }
  92 | }
  93 | 
```