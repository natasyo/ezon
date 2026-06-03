
# Project Structure & Architecture Conventions

## Project Structure


```txt

ezon/
├── public/                 # Статические файлы (отдаются клиенту напрямую)
│   ├── css/                # Стили (Tailwind, Bootstrap или кастомный CSS)
│   ├── js/                 # Скрипты (htmx.min.js, кастомный JS)
│   └── images/             # Картинки, логотипы, иконки
├── src/                    # Исходный код сервера NestJS
│   ├── app.module.ts       # Главный модуль приложения
│   ├── main.ts             # Точка входа (здесь настраивается шаблонизатор)
├── modules                       # Business domains / bounded contexts
│   └── [domain-name]
│       ├── controllers           # HTTP/API transport layer
│       ├── dto                   # DTOs and validation schemas
│       ├── entities              # Database entities/models
│       ├── services              # Public domain services / module API
│       └── internal              # Private module implementation
├── views/                  # Папка со всеми HTML-шаблонами (Handlebars/EJS)
│   ├── layouts/            # Общие каркасы страниц
│   │   └── main.hbs        # Главный шаблон (html, head, body, подключение HTMX)
│   ├── partials/           # Переиспользуемые фрагменты (кусочки для HTMX)
│   │   ├── header.hbs      # Шапка сайта
│   │   └── user-row.hbs    # Строка таблицы (возвращается по AJAX через HTMX)
│   ├── index.hbs           # Главная страница сайта
│   └── profile.hbs         # Страница профиля пользователя
└── .dockerfile
```
---

# Directory Responsibilities

## `tools/`

Infrastructure-level tools used by the application.

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

Nest modules

Rules
- Path: All files (module, controller, service, dto) must be located in `src/modules/<name>/`.
-  Validation: Create DTO files using class-validator to validate incoming REST requests.

---


## `shared/`

Examples:
- types
- utils
- decorators
- guards
---
