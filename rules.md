# Project Structure & Architecture Conventions

## Project Structure

```txt

ezon/
├── backend/                       # NestJS API (TypeScript)
│   ├── src/
│   │   ├── main.ts                # Точка входа (session, Swagger, порт)
│   │   ├── app.module.ts          # Корневой модуль
│   │   ├── app.controller.ts      # Корневой контроллер (редирект / → /api)
│   │   ├── app.service.ts
│   │   ├── modules/               # Business domains / bounded contexts
│   │   │   ├── auth/              #   controllers/, dto/, entities/, filters/, services/
│   │   │   ├── users/             #   пользователи + сотрудники (employees)
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── cells/
│   │   │   ├── pallets/
│   │   │   ├── custom-fields/
│   │   │   └── settings/
│   │   ├── shared/                # Общий код: guards/, decorators/
│   │   └── tools/                 # Инфраструктура: config/, minio/, prisma/
│   ├── prisma/
│   │   ├── schema.prisma          # Схема БД (PostgreSQL)
│   │   ├── seed.ts                # Сид данных
│   │   └── migrations/            # Миграции
│   ├── tests/                     # Playwright API-тесты (api-guest)
│   ├── scripts/                   # Вспомогательные скрипты
│   ├── Dockerfile
│   └── package.json
├── frontend/                      # Next.js (React) клиент
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── styles.css
│   │   │   ├── components/        # AuthPanel.tsx
│   │   │   └── sections/          # CatalogSection.tsx, EmployeesSection.tsx и др.
│   │   └── lib/                   # api.ts (клиент API)
│   ├── public/                    # Статические файлы
│   ├── next.config.ts
│   ├── Dockerfile
│   └── package.json
├── nginx/                         # Reverse-proxy (TLS через Certbot)
│   ├── nginx.conf
│   └── templates/
├── .github/workflows/             # CI (Playwright)
├── docker-compose.yml             # Сервисы: PostgreSQL, MinIO, frontend, backend, Nginx
├── .env / .env.example
├── README.md
├── rules.md
└── technology.md
```

---

# Directory Responsibilities

## `tools/`

`backend/src/tools/` — Infrastructure-level tools used by the application.

Examples:

- database client
- Redis/cache client
- config loader
- logger
- event bus wrapper

Rules:

- no business logic
- no pure helper functions
- may depend on frameworks, SDKs, or runtime configuration

---

## `modules/`

`backend/src/modules/` — Nest modules

Rules

- Path: All files (module, controller, service, dto) must be located in `backend/src/modules/<name>/`.
- Validation: Create DTO files using class-validator to validate incoming REST requests.

---

## `shared/`

`backend/src/shared/` — Examples:

- types
- utils
- decorators
- guards

---

При верстке формы используй правила:

- Выводи ошибки под полем ввода
- не выводи ошибки ввода в tooltip,
- отменяй стандартное поведение поля ввода
- добавляй валидацию формы
- если форма не валидна выводи ошибки под под соответствующим полем, и делай кнопку неактивной, форму на сервер не отправляй
- если форма ниразу не отправлялась делать кнопку неактивной, ошибки не выводить
- ошибки показывать только после ввода некорректной информации
- ошибки с сервера выводи вверху формы если ошибка не отностся к конкретному полю, и под полем ввода если она относится к полю
