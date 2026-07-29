/**
 * Генерация Excel‑шаблона для импорта товаров.
 * Запуск: npx tsx scripts/generate-product-import-template.ts
 */
import * as XLSX from 'xlsx';

// ============ Константы стилей ============

const HEADER_FILL = {
  fgColor: { rgb: 'FF4472C4' },
  patternType: 'solid' as const,
};
const HEADER_FONT = { color: { rgb: 'FFFFFFFF' }, bold: true, sz: 11 };
const REQUIRED_FILL = {
  fgColor: { rgb: 'FFFFF2CC' },
  patternType: 'solid' as const,
};
const SAMPLE_FILL = {
  fgColor: { rgb: 'FFE2EFDA' },
  patternType: 'solid' as const,
};
const BORDER = {
  top: { style: 'thin' as const, color: { rgb: 'FFD9D9D9' } },
  bottom: { style: 'thin' as const, color: { rgb: 'FFD9D9D9' } },
  left: { style: 'thin' as const, color: { rgb: 'FFD9D9D9' } },
  right: { style: 'thin' as const, color: { rgb: 'FFD9D9D9' } },
};

// ============ Лист 1: Инструкция ============

function createInstructionSheet() {
  const rows: any[][] = [];

  rows.push(['ИНСТРУКЦИЯ ПО ЗАПОЛНЕНИЮ ШАБЛОНА ИМПОРТА ТОВАРОВ']);
  rows.push(['']);
  rows.push([
    '1. Заполните лист «ТОВАРЫ», начиная со строки 2 (строка 1 — заголовки).',
  ]);
  rows.push(['2. Поля, отмеченные *, обязательны для заполнения.']);
  rows.push(['3. Не меняйте порядок и названия столбцов.']);
  rows.push([
    '4. Не удаляйте лист «Справочники» — он содержит допустимые значения.',
  ]);
  rows.push([
    '5. После заполнения сохраните файл и импортируйте через интерфейс системы.',
  ]);
  rows.push(['']);
  rows.push(['ОПИСАНИЕ ПОЛЕЙ:']);
  rows.push(['Поле', 'Обязательное', 'Формат', 'Описание']);
  rows.push([
    'sku',
    'Да *',
    'строка (латиница/цифры/дефис)',
    'Артикул, уникальный в системе',
  ]);
  rows.push(['name', 'Да *', 'строка', 'Наименование товара']);
  rows.push([
    'ean',
    'Нет',
    'строка, 8/12/13 цифр',
    'Европейский штрихкод (уникальный)',
  ]);
  rows.push([
    'asin',
    'Нет',
    'строка',
    'Amazon Standard Identification Number (уникальный)',
  ]);
  rows.push([
    'categoryName',
    'Нет',
    'строка (из справочника)',
    'Название категории',
  ]);
  rows.push([
    'condition',
    'Нет',
    'Новый | Б/у | Бракованный',
    'Состояние товара',
  ]);
  rows.push([
    'purchasePrice',
    'Нет',
    'число (разделитель . или ,)',
    'Цена поступления',
  ]);
  rows.push(['salePrice', 'Нет', 'число', 'Цена продажи']);
  rows.push([
    'cellName',
    'Нет',
    'строка (из справочника)',
    'Название ячейки хранения',
  ]);
  rows.push(['arrivalDate', 'Нет', 'ГГГГ-ММ-ДД', 'Дата поступления на склад']);
  rows.push([
    'images',
    'Нет',
    'URL1; URL2; …',
    'Ссылки на фото через точку с запятой',
  ]);
  rows.push([
    'customFields',
    'Нет',
    'ключ1=значение1; ключ2=значение2',
    'Доп. поля (пары ключ=значение через ;)',
  ]);
  rows.push([
    'showcaseStatuses',
    'Нет',
    'озон=VISIBLE; wb=HIDDEN',
    'Статус на витринах',
  ]);

  const merges: XLSX.Range[] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
  return { data: rows, merges };
}

// ============ Лист 2: ТОВАРЫ (100 товаров для WB) ============

function generateWBProducts(): string[][] {
  const categories = [
    'Электроника',
    'Одежда',
    'Обувь',
    'Бытовая техника',
    'Косметика',
    'Игрушки',
    'Спорт',
    'Зоотовары',
    'Книги',
    'Автотовары',
  ];

  const conditions = [
    'Новый',
    'Новый',
    'Новый',
    'Новый',
    'Б/у',
    'Новый',
    'Новый',
    'Бракованный',
  ];

  const electronics = [
    'Смартфон Galaxy A%d',
    'Наушники Bluetooth Pro %d',
    'Планшет Tab %d Pro',
    'Умные часы Watch %d',
    'Колонка портативная Sound%d',
    'Мышь беспроводная Click%d',
    'Клавиатура механ. Key%d',
    'Монитор 27" View%d',
    'Кабель USB-C Fast%d',
    'Зарядка GaN Power%d',
  ];

  const clothes = [
    'Футболка базовая %d',
    'Джинсы Slim Fit %d',
    'Худи Oversize %d',
    'Куртка зимняя %d',
    'Рубашка классическая %d',
    'Шорты спортивные %d',
    'Платье летнее %d',
  ];

  const shoes = [
    'Кроссовки Run %d',
    'Ботинки кожаные %d',
    'Туфли классические %d',
    'Сандалии летние %d',
  ];

  const appliances = [
    'Пылесос робот Clean%d',
    'Микроволновка MW-%d',
    'Чайник электрический EK%d',
    'Утюг паровой Iron%d',
    'Фен профессиональный Dry%d',
  ];

  const cosmetics = [
    'Крем для лица Active%d',
    'Шампунь натуральный %d',
    'Духи парфюм Eau%d',
    'Тушь для ресниц Lash%d',
  ];

  const toys = [
    'Конструктор Build%d',
    'Кукла Fashion %d',
    'Машинка Speed%d',
    'Пазл 1000 деталей Art%d',
  ];

  const sport = [
    'Гантели набор %d кг',
    'Коврик йога Premium%d',
    'Скакалка скоростная %d',
    'Бутылка спортивная Sport%d',
  ];

  const pet = [
    'Корм сухой ProPlan %d',
    'Лежак для собак Comfort%d',
    'Когтеточка для кошек Scratch%d',
  ];

  const books = ['Книга «Тайна %d»', 'Роман «Лучший %d»', 'Учебник по JS %d'];

  const auto = [
    'Чехлы для авто Universal%d',
    'Автомагнитола Music%d',
    'Щетки стеклоочист. Clear%d',
  ];

  const allTemplates: { cat: string; templates: string[] }[] = [
    { cat: 'Электроника', templates: electronics },
    { cat: 'Одежда', templates: clothes },
    { cat: 'Обувь', templates: shoes },
    { cat: 'Бытовая техника', templates: appliances },
    { cat: 'Косметика', templates: cosmetics },
    { cat: 'Игрушки', templates: toys },
    { cat: 'Спорт', templates: sport },
    { cat: 'Зоотовары', templates: pet },
    { cat: 'Книги', templates: books },
    { cat: 'Автотовары', templates: auto },
  ];

  const products: string[][] = [];

  for (let i = 1; i <= 100; i++) {
    const idx = (i - 1) % allTemplates.length;
    const { cat, templates } = allTemplates[idx];
    const tmpl = templates[i % templates.length];
    const name = tmpl.replace('%d', String(i));
    const sku = `WB-${String(i).padStart(4, '0')}`;
    const ean = i <= 70 ? `200${String(i).padStart(10, '0')}` : '';
    const asin = i <= 30 ? `B0WB${String(i).padStart(6, '0')}` : '';
    const condition = conditions[i % conditions.length];
    const purchasePrice = (Math.random() * 9000 + 500).toFixed(2);
    const salePrice = (
      parseFloat(purchasePrice) *
      (1.5 + Math.random() * 1.5)
    ).toFixed(2);
    const cellLetter = String.fromCharCode(65 + (i % 8));
    const cellNum = String((i % 10) + 1).padStart(2, '0');
    const cellName =
      i % 7 !== 0 ? `${cellLetter}-${(i % 5) + 1}-${cellNum}` : '';
    const arrivalDate = new Date(2024, i % 12, (i % 28) + 1)
      .toISOString()
      .split('T')[0];
    // Реальные фото через picsum.photos (разные ID = разные изображения)
    let images = '';
    if (i % 3 === 0) {
      const img1 = i * 2 - 1;
      const img2 = i * 2;
      images = `https://picsum.photos/id/${img1}/400/400.jpg; https://picsum.photos/id/${img2}/400/400.jpg`;
    } else if (i % 5 === 0) {
      images = `https://picsum.photos/id/${i * 3}/400/400.jpg`;
    }

    // customFields в зависимости от категории
    let customFields = '';
    if (cat === 'Одежда')
      customFields = `размер=${['S', 'M', 'L', 'XL'][i % 4]}; материал=${['хлопок', 'полиэстер', 'лен'][i % 3]}`;
    else if (cat === 'Обувь')
      customFields = `размер=${38 + (i % 8)}; цвет=${['черный', 'белый', 'коричневый'][i % 3]}`;
    else if (cat === 'Электроника')
      customFields = `цвет=${['черный', 'белый', 'серый'][i % 3]}; гарантия=${12 + (i % 12)} мес`;
    else if (cat === 'Бытовая техника')
      customFields = `мощность=${800 + (i % 10) * 200} Вт; цвет=${['белый', 'черный', 'серебро'][i % 3]}`;
    else if (cat === 'Косметика')
      customFields = `объем=${30 + (i % 5) * 50} мл`;
    else if (cat === 'Игрушки') customFields = `возраст=${3 + (i % 10)}+`;

    // showcaseStatuses с WB
    const wbStatus = i % 20 === 0 ? 'HIDDEN' : 'VISIBLE';
    const ozonStatus = i % 2 === 0 ? 'VISIBLE' : 'HIDDEN';
    const showcaseStatuses = `wb=${wbStatus}; ozon=${ozonStatus}`;

    products.push([
      sku,
      name,
      ean,
      asin,
      cat,
      condition,
      purchasePrice,
      salePrice,
      cellName,
      arrivalDate,
      images,
      customFields,
      showcaseStatuses,
    ]);
  }

  return products;
}

function createProductsSheet() {
  const headers = [
    'sku *',
    'name *',
    'ean',
    'asin',
    'categoryName',
    'condition',
    'purchasePrice',
    'salePrice',
    'cellName',
    'arrivalDate',
    'images',
    'customFields',
    'showcaseStatuses',
  ];

  const wbProducts = generateWBProducts();
  const data = [headers, ...wbProducts];

  const cols: XLSX.ColInfo[] = headers.map((h, i) => ({
    wch: Math.min(
      Math.max(
        h.length,
        ...wbProducts.slice(0, 50).map((r) => String(r[i] ?? '').length),
      ) + 4,
      42,
    ),
  }));

  return { data, cols };
}

// ============ Лист 3: Справочники ============

function createReferenceSheet() {
  const data: any[][] = [];

  data.push(['СПРАВОЧНИКИ ДОПУСТИМЫХ ЗНАЧЕНИЙ']);
  data.push(['']);
  data.push(['Состояние (condition)']);
  data.push(['Новый']);
  data.push(['Б/у']);
  data.push(['Бракованный']);
  data.push(['']);
  data.push(['Статус на витрине (showcaseStatuses)']);
  data.push(['VISIBLE — Видимый']);
  data.push(['HIDDEN — Скрытый']);
  data.push(['']);
  data.push([
    'Категории — заполняются из системы, указывайте существующее название',
  ]);
  data.push([
    'Ячейки — заполняются из системы, указывайте существующее название',
  ]);

  return { data };
}

// ============ Сборка книги ============

function buildWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // --- Лист: Инструкция ---
  const instr = createInstructionSheet();
  const wsInstr = XLSX.utils.aoa_to_sheet(instr.data);
  wsInstr['!merges'] = instr.merges;
  const cellA1 = wsInstr['A1'] as XLSX.CellObject | undefined;
  if (cellA1) cellA1.s = { font: { bold: true, sz: 14 } };
  XLSX.utils.book_append_sheet(wb, wsInstr, 'Инструкция');

  // --- Лист: ТОВАРЫ ---
  const prod = createProductsSheet();
  const wsProd = XLSX.utils.aoa_to_sheet(prod.data);
  wsProd['!cols'] = prod.cols;

  // Стилизация заголовков
  for (let c = 0; c < prod.data[0].length; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    const cell = wsProd[addr] as XLSX.CellObject | undefined;
    if (cell) {
      cell.s = {
        font: HEADER_FONT,
        fill: HEADER_FILL,
        border: BORDER,
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      };
    }
  }

  // Подсветка обязательных полей
  for (let c = 0; c < prod.data[0].length; c++) {
    const header = prod.data[0][c] as string;
    const isRequired = header.includes('*');

    for (let r = 1; r < prod.data.length; r++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = wsProd[addr] as XLSX.CellObject | undefined;
      if (cell) {
        cell.s = {
          font: { sz: 11 },
          fill: isRequired ? REQUIRED_FILL : r === 1 ? SAMPLE_FILL : undefined,
          border: BORDER,
        };
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, wsProd, 'ТОВАРЫ');

  // --- Лист: Справочники ---
  const ref = createReferenceSheet();
  const wsRef = XLSX.utils.aoa_to_sheet(ref.data);
  const cellRefA1 = wsRef['A1'] as XLSX.CellObject | undefined;
  if (cellRefA1) cellRefA1.s = { font: { bold: true, sz: 13 } };
  XLSX.utils.book_append_sheet(wb, wsRef, 'Справочники');

  return wb;
}

// ============ Запись ============

const wb = buildWorkbook();
const filename = 'EZON_Импорт_товаров.xlsx';
XLSX.writeFile(wb, filename);
console.log(`✅ Шаблон импорта сохранён: ${filename}`);
