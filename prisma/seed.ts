import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: String(process.env.DATABASE_URL),
  }),
});

async function main() {
  console.log('🌱 Начинаю заполнение базы...\n');

  // --- Пользователи ---
  const passwordHash = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@ezon.local' },
      update: {},
      create: {
        email: 'admin@ezon.local',
        password: passwordHash,
        userName: 'admin',
        displayName: 'Администратор',
        role: 'ADMIN',
      },
    }),
    prisma.user.upsert({
      where: { email: 'manager@ezon.local' },
      update: {},
      create: {
        email: 'manager@ezon.local',
        password: passwordHash,
        userName: 'manager',
        displayName: 'Менеджер склада',
        role: 'MANAGER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'worker@ezon.local' },
      update: {},
      create: {
        email: 'worker@ezon.local',
        password: passwordHash,
        userName: 'worker',
        displayName: 'Сотрудник',
      },
    }),
  ]);

  console.log(`✅ Пользователи: ${users.length} создано`);
  const adminId = users[0].id;
  console.log('   admin@ezon.local / password123');
  console.log('   manager@ezon.local / password123');
  console.log('   worker@ezon.local / password123\n');

  // --- Категории ---
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Электроника' },
      update: {},
      create: { name: 'Электроника' },
    }),
    prisma.category.upsert({
      where: { name: 'Периферия' },
      update: {},
      create: { name: 'Периферия' },
    }),
    prisma.category.upsert({
      where: { name: 'Комплектующие' },
      update: {},
      create: { name: 'Комплектующие' },
    }),
    prisma.category.upsert({
      where: { name: 'Мебель' },
      update: {},
      create: { name: 'Мебель' },
    }),
  ]);
  const [catElectronics, catPeriphery, catComponents, catFurniture] =
    categories;
  console.log(`✅ Категории: ${categories.length} создано\n`);

  // --- Настройки ---
  const settings = await Promise.all([
    prisma.setting.upsert({
      where: { key: 'system_name' },
      update: {},
      create: { key: 'system_name', value: 'Ezon', label: 'Название системы' },
    }),
    prisma.setting.upsert({
      where: { key: 'currency' },
      update: {},
      create: { key: 'currency', value: 'RUB', label: 'Валюта' },
    }),
    prisma.setting.upsert({
      where: { key: 's3_endpoint' },
      update: {},
      create: {
        key: 's3_endpoint',
        value: 'http://minio:9000',
        label: 'S3 Endpoint',
      },
    }),
    prisma.setting.upsert({
      where: { key: 's3_bucket' },
      update: {},
      create: { key: 's3_bucket', value: 'ezon-uploads', label: 'S3 Bucket' },
    }),
    prisma.setting.upsert({
      where: { key: 's3_region' },
      update: {},
      create: { key: 's3_region', value: 'us-east-1', label: 'S3 Region' },
    }),
    prisma.setting.upsert({
      where: { key: 'session_timeout_hours' },
      update: {},
      create: {
        key: 'session_timeout_hours',
        value: '24',
        label: 'Таймаут сессии',
      },
    }),
  ]);
  console.log(`✅ Настройки: ${settings.length} записей\n`);

  // --- Товары ---
  const products = await Promise.all([
    // Поступление
    prisma.product.upsert({
      where: { sku: 'SKU-001' },
      update: {},
      create: {
        sku: 'SKU-001',
        name: 'Монитор LG UltraFine 27"',
        categoryId: catElectronics.id,
        condition: 'Новый',
        purchasePrice: 35000,
        salePrice: 52000,
        status: 'ARRIVAL',
        cell: 'A-12',
        arrivalDate: new Date('2026-06-01'),
        images: [],
        showcaseStatuses: { ozon: 'HIDDEN', wb: 'HIDDEN' },
        customFields: { weight: '6.5 кг', color: 'Чёрный' },
        createdById: adminId,
      },
    }),
    // На складе
    prisma.product.upsert({
      where: { sku: 'SKU-002' },
      update: {},
      create: {
        sku: 'SKU-002',
        name: 'Клавиатура Logitech MX Keys',
        categoryId: catPeriphery.id,
        condition: 'Новый',
        purchasePrice: 8500,
        salePrice: 12990,
        status: 'IN_STOCK',
        cell: 'B-04',
        arrivalDate: new Date('2026-05-15'),
        images: [],
        showcaseStatuses: { ozon: 'VISIBLE' },
        customFields: { layout: 'RU', connection: 'Bluetooth' },
        createdById: adminId,
      },
    }),
    // Размещён
    prisma.product.upsert({
      where: { sku: 'SKU-003' },
      update: {},
      create: {
        sku: 'SKU-003',
        name: 'SSD Samsung 1TB',
        categoryId: catComponents.id,
        condition: 'Новый',
        purchasePrice: 7200,
        salePrice: 10990,
        status: 'PLACED',
        cell: 'C-07',
        arrivalDate: new Date('2026-04-20'),
        images: [],
        showcaseStatuses: { ozon: 'VISIBLE', wb: 'VISIBLE' },
        customFields: { speed: '7000 MB/s', formFactor: 'M.2 2280' },
        createdById: adminId,
      },
    }),
    // Продан
    prisma.product.upsert({
      where: { sku: 'SKU-004' },
      update: {},
      create: {
        sku: 'SKU-004',
        name: 'Мышь Razer DeathAdder',
        categoryId: catPeriphery.id,
        condition: 'Новый',
        purchasePrice: 4500,
        salePrice: 7900,
        status: 'SOLD',
        cell: null,
        arrivalDate: new Date('2026-03-10'),
        images: [],
        showcaseStatuses: {},
        customFields: {},
        createdById: adminId,
      },
    }),
    // Списан
    prisma.product.upsert({
      where: { sku: 'SKU-005' },
      update: {},
      create: {
        sku: 'SKU-005',
        name: 'Блок питания 500W (брак)',
        categoryId: catComponents.id,
        condition: 'Бракованный',
        purchasePrice: 3200,
        salePrice: 0,
        status: 'WRITTEN_OFF',
        cell: null,
        arrivalDate: new Date('2026-02-01'),
        images: [],
        showcaseStatuses: {},
        customFields: { reason: 'Не включается' },
        createdById: adminId,
      },
    }),
    // На складе — мебель
    prisma.product.upsert({
      where: { sku: 'SKU-006' },
      update: {},
      create: {
        sku: 'SKU-006',
        name: 'Стол компьютерный Ergolife',
        categoryId: catFurniture.id,
        condition: 'Новый',
        purchasePrice: 15000,
        salePrice: 24500,
        status: 'IN_STOCK',
        cell: 'D-01',
        arrivalDate: new Date('2026-05-28'),
        images: [],
        showcaseStatuses: { ozon: 'HIDDEN' },
        customFields: { width: '120 см', depth: '60 см', color: 'Белый' },
        createdById: adminId,
      },
    }),
  ]);

  console.log(`✅ Товары: ${products.length} создано`);
  console.log('   SKU-001 — Монитор LG (Поступление)');
  console.log('   SKU-002 — Клавиатура Logitech (На складе)');
  console.log('   SKU-003 — SSD Samsung (Размещён)');
  console.log('   SKU-004 — Мышь Razer (Продан)');
  console.log('   SKU-005 — БП 500W брак (Списан)');
  console.log('   SKU-006 — Стол Ergolife (На складе)\n');

  console.log('🎉 Заполнение завершено!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Ошибка при заполнении:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
