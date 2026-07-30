<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-ED2945?style=flat&logo=nestjs&logoColor=white" alt="NestJS 11" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7.8-2D3748?style=flat&logo=prisma&logoColor=white" alt="Prisma 7.8" />
  <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL 17" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/EJS-3-8F0D0D?style=flat&logo=ejs&logoColor=white" alt="EJS" />
  <img src="https://img.shields.io/badge/MinIO-2D3748?style=flat&logo=minio&logoColor=white" alt="MinIO" />
  <img src="https://img.shields.io/badge/Playwright-45BA4B?style=flat&logo=playwright&logoColor=white" alt="Playwright" />
</p>

<h1 align="center">📦 EZON — Система управления складским учётом</h1>

<p align="center">
  <strong>Веб-приложение для учёта товаров, управления ячейками хранения, категориями и паллетами на складе.</strong>
</p>

---

## 📋 О проекте

**EZON** — это корпоративная система управления складскими запасами, построенная на NestJS. Приложение автоматизирует процессы приёмки, размещения, хранения и выбытия товаров, предоставляя сотрудникам склада удобный интерфейс (SSR) через EJS-шаблоны и Tailwind CSS.

### Основные возможности

| Модуль                        | Функциональность                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Товары (Products)**         | Создание, редактирование, массовый импорт/экспорт через Excel (XLSX), поиск, управление статусами (прибытие, на складе, размещён, продан, списан) |
| **Ячейки (Cells)**            | Управление складскими ячейками хранения                                                                                                           |
| **Категории (Categories)**    | Иерархическая структура категорий товаров                                                                                                         |
| **Паллеты (Pallets)**         | Импорт паллет и товаров из манифестов, интеграция с MinIO для загрузки изображений                                                                |
| **Пользователи (Users)**      | Ролевая модель (ADMIN / MANAGER / EMPLOYEE), регистрация, профили, аутентификация через сессии (PostgreSQL)                                       |
| **Доп. поля (Custom Fields)** | Гибкие пользовательские поля для товаров, привязанные к категориям                                                                                |
| **Настройки (Settings)**      | Системные настройки приложения                                                                                                                    |
| **Статусы витрин**            | Управление отображением товаров на витринах (видим/скрыт)                                                                                         |

### 🏗️ Технический стек

| Компонент            | Технология                                       |
| -------------------- | ------------------------------------------------ |
| **Бэкенд**           | NestJS 11 + TypeScript 5.7                       |
| **ORM**              | Prisma 7.8                                       |
| **База данных**      | PostgreSQL 17                                    |
| **Хранилище файлов** | MinIO (S3-совместимое объектное хранилище)       |
| **Шаблонизатор**     | EJS 3 (Server-Side Rendering)                    |
| **Стилизация**       | Tailwind CSS 4 + PostCSS                         |
| **Сессии**           | express-session + connect-pg-simple (PostgreSQL) |
| **Валидация**        | class-validator + class-transformer              |
| **API документация** | Swagger (OpenAPI)                                |
| **E2E тесты**        | Playwright                                       |
| **Unit тесты**       | Jest + ts-jest                                   |
| **Прокси-сервер**    | Nginx (с TLS через Certbot)                      |
| **Контейнеризация**  | Docker + Docker Compose                          |

---

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 22+
- Docker и Docker Compose
- npm

### 1. Клонирование и установка

```bash
git clone <repository-url>
cd ezon
npm install
```

### 2. Настройка окружения

Скопируйте `.env.example` в `.env` и заполните переменные:

```bash
cp .env.example .env
```

**Основные переменные окружения:**

| Переменная       | Описание                  | Пример                                           |
| ---------------- | ------------------------- | ------------------------------------------------ |
| `DATABASE_URL`   | Подключение к PostgreSQL  | `postgresql://ezon:password@localhost:5432/ezon` |
| `SESSION_SECRET` | Секрет для подписи сессий | (случайная строка)                               |
| `S3_ENDPOINT`    | Адрес MinIO               | `http://localhost:9000`                          |
| `S3_ACCESS_KEY`  | Ключ доступа MinIO        | `minioadmin`                                     |
| `S3_SECRET_KEY`  | Секретный ключ MinIO      | `minioadmin`                                     |
| `S3_BUCKET`      | Бакет для изображений     | `ezon-images`                                    |

### 3. Запуск через Docker (рекомендуется)

```bash
# Запуск всех сервисов (PostgreSQL, MinIO, Nginx, приложение)
docker compose up -d
```

### 4. ИЛИ локальный запуск

```bash
# Сборка CSS
npm run build:css

# Запуск в режиме разработки
npm run start:dev
```

Приложение будет доступно по адресу: [http://localhost:3000](http://localhost:3000)

Swagger-документация API: [http://localhost:3000/api](http://localhost:3000/api)

### 5. Наполнение базы начальными данными

```bash
npm run seed
```

---

## 📁 Структура проекта

```
ezon/
├── src/
│   ├── main.ts                  # Точка входа (сессии, EJS, Swagger)
│   ├── app.module.ts            # Главный модуль приложения
│   ├── modules/
│   │   ├── auth/                # Аутентификация (логин/регистрация)
│   │   ├── users/               # Пользователи (CRUD, роли, профили)
│   │   ├── products/            # Товары (CRUD, импорт/экспорт, статусы)
│   │   ├── pallets/             # Паллеты (импорт манифестов, изображения)
│   │   ├── categories/          # Категории товаров
│   │   ├── cells/               # Ячейки хранения
│   │   ├── custom-fields/       # Пользовательские поля товаров
│   │   └── settings/            # Системные настройки
│   ├── shared/                  # Общие компоненты
│   │   ├── guards/              # Guard'ы аутентификации и ролей
│   │   ├── decorators/          # Декораторы (Match, и др.)
│   │   ├── types/               # Общие типы
│   │   └── utils/               # Утилиты
│   └── tools/                   # Инфраструктура
│       ├── prisma/              # Prisma-сервис
│       ├── minio/               # MinIO (S3) клиент
│       ├── config/              # Конфигурация
│       └── logger/              # Логирование
├── views/                       # EJS-шаблоны (SSR)
│   ├── layouts/                 # Основные макеты страниц
│   ├── partials/                # Переиспользуемые фрагменты
│   ├── auth/                    # Страницы логина/регистрации
│   ├── warehouse/               # Страницы управления товарами
│   ├── categories/              # Страницы категорий
│   ├── cells/                   # Страницы ячеек
│   ├── custom-fields/           # Страницы доп. полей
│   ├── users/                   # Страницы пользователей
│   └── settings/                # Страницы настроек
├── public/                      # Статические файлы
│   ├── css/                     # Стили Tailwind
│   ├── js/                      # Клиентские скрипты
│   └── images/                  # Изображения
├── prisma/
│   └── schema.prisma            # Схема базы данных
├── tests/                       # E2E-тесты (Playwright + API)
├── nginx/                       # Конфигурация Nginx
└── docker-compose.yml           # Docker Compose (все сервисы)
```

---

## 🧪 Тестирование

```bash
# Unit-тесты
npm run test

# Unit-тесты с покрытием
npm run test:cov

# E2E-тесты (Playwright + API)
npm run test:e2e
```

Проект содержит:

- **Unit-тесты** — Jest + ts-jest (моки Prisma)
- **E2E-тесты (Playwright)** — сценарии аутентификации, профиля, каталога, создания товаров
- **API-тесты** — Supertest (регистрация, авторизация)

---

## 📜 Скрипты

| Команда             | Описание                           |
| ------------------- | ---------------------------------- |
| `npm run start`     | Запуск приложения                  |
| `npm run start:dev` | Запуск в режиме разработки (watch) |
| `npm run build`     | Сборка проекта                     |
| `npm run build:css` | Сборка Tailwind CSS                |
| `npm run build:all` | Сборка CSS и TypeScript            |
| `npm run seed`      | Наполнение БД начальными данными   |
| `npm run lint`      | Проверка кода ESLint               |
| `npm run format`    | Форматирование кода Prettier       |
| `npm run test`      | Unit-тесты                         |
| `npm run test:e2e`  | E2E-тесты                          |

---

## 🐳 Docker

Проект запускается через **Docker Compose** с четырьмя контейнерами:

| Сервис     | Назначение                        | Порт                           |
| ---------- | --------------------------------- | ------------------------------ |
| `app`      | NestJS-приложение                 | `3000`                         |
| `postgres` | PostgreSQL 17                     | `5432`                         |
| `minio`    | S3-хранилище изображений          | `9000` (API), `9001` (Console) |
| `nginx`    | Reverse-proxy (TLS через Certbot) | `8080`, `443`                  |

```bash
# Запуск всех сервисов
docker compose up -d

# Просмотр логов
docker compose logs -f app

# Остановка
docker compose down
```

---

## 🔒 Безопасность

- Сессии хранятся в PostgreSQL через `connect-pg-simple`
- Пароли хешируются с помощью `bcrypt`
- Ролевая модель доступа (ADMIN / MANAGER / EMPLOYEE)
- Валидация входящих данных через `class-validator`
- HTTPS и TLS через Nginx + Certbot (в production)
- Защита от подделки сессий (httpOnly, secure, sameSite)

---

## 🛠️ Разработка

### Добавление нового модуля

```bash
# Создание модуля через NestJS CLI
npx nest g module modules/<name>
npx nest g controller modules/<name>
npx nest g service modules/<name>
```

### Схема базы данных

После изменений в `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name <migration-name>
npx prisma generate
```

---

## 📄 Лицензия

Проект является частным (UNLICENSED).
