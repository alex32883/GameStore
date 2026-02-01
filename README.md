# Next.js + Prisma + NeonDB

Минимальный рабочий проект на Next.js (App Router) с TypeScript, Prisma и NeonDB (PostgreSQL), готовый к деплою на Vercel.

## Структура проекта

- **Next.js 14** с App Router и TypeScript
- **Prisma** как ORM
- **NeonDB** (PostgreSQL) как база данных
- Готовность к деплою на Vercel

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

1. Создайте проект в [Neon](https://neon.tech/)
2. Скопируйте connection string из панели Neon
3. Создайте файл `.env` в корне проекта:

```bash
cp .env.example .env
```

4. Добавьте в `.env` ваш connection string:

```
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

### 3. Миграция базы данных

```bash
npm run db:migrate
```

Эта команда создаст таблицу `notes` в вашей базе данных.

### 4. Заполнение базы данных (seed)

```bash
npm run db:seed
```

Эта команда добавит 3 тестовые записи в базу данных.

### 5. Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Доступные команды

- `npm run dev` - запуск dev сервера
- `npm run build` - сборка проекта для production
- `npm run start` - запуск production сервера
- `npm run db:migrate` - создание миграции базы данных
- `npm run db:generate` - генерация Prisma Client
- `npm run db:seed` - заполнение базы данных тестовыми данными
- `npm run db:studio` - открытие Prisma Studio для просмотра данных

## Деплой на Vercel

### 1. Подготовка

1. Убедитесь, что все изменения закоммичены в Git
2. Убедитесь, что `.env` файл не закоммичен (он уже в `.gitignore`)

### 2. Деплой через Vercel CLI

```bash
npm i -g vercel
vercel
```

### 3. Деплой через GitHub

1. Загрузите проект на GitHub
2. Подключите репозиторий к Vercel
3. Добавьте переменную окружения `DATABASE_URL` в настройках проекта Vercel:
   - Settings → Environment Variables
   - Добавьте `DATABASE_URL` со значением из Neon

### 4. Настройка Build Command

Vercel автоматически использует команду `npm run build` из `package.json`, которая включает:
- `prisma generate` - генерация Prisma Client
- `next build` - сборка Next.js приложения

### 5. Запуск миграций на Vercel

После первого деплоя, выполните миграцию базы данных:

```bash
# Локально с production DATABASE_URL
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

Или используйте Prisma Migrate в Neon Dashboard.

### 6. Заполнение базы данных (опционально)

Если нужно заполнить production базу данных:

```bash
DATABASE_URL="your-production-url" npm run db:seed
```

## Модель данных

### Note

- `id` (String, UUID) - уникальный идентификатор
- `title` (String) - заголовок заметки
- `createdAt` (DateTime) - дата создания

## Структура файлов

```
.
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Главная страница с запросом к БД
│   ├── globals.css             # Глобальные стили
│   ├── view-db/                # Database Viewer приложение
│   │   ├── page.tsx            # Выбор БД и список таблиц
│   │   └── [table]/page.tsx    # Просмотр таблицы с CRUD
│   └── api/
│       └── view-db/            # API routes для Database Viewer
│           ├── tables/route.ts
│           ├── table/route.ts
│           ├── create/route.ts
│           ├── update/route.ts
│           └── delete/route.ts
├── lib/
│   ├── prisma.ts               # Prisma Client instance
│   └── db-utils.ts             # Утилиты для работы с БД
├── prisma/
│   ├── schema.prisma           # Prisma schema
│   └── seed.ts                 # Seed скрипт
├── .env.example                # Пример переменных окружения
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── README.md
└── VIEW_DB_README.md           # Документация Database Viewer
```

## Database Viewer

Проект включает тестовую программу **view-db** для просмотра и управления данными в базе данных.

**Доступ**: http://localhost:3000/view-db

**Возможности**:
- Выбор базы данных (локальная/рабочая)
- Просмотр списка таблиц
- Просмотр данных с пагинацией
- CRUD операции (Create, Read, Update, Delete)

Подробная документация: [VIEW_DB_README.md](./VIEW_DB_README.md)

## Важные замечания

1. **Переменные окружения**: Никогда не коммитьте `.env` файл с реальными credentials
2. **Prisma Client**: Генерируется автоматически при `npm run build` на Vercel
3. **Миграции**: Выполняйте миграции перед деплоем или используйте `prisma migrate deploy` для production
4. **Connection Pooling**: Neon автоматически предоставляет connection pooling через свой connection string
5. **Database Viewer**: Для работы с рабочей БД добавьте `DATABASE_URL_PROD` в `.env` (опционально)

## Troubleshooting

### Ошибка "Prisma Client not generated"

```bash
npm run db:generate
```

### Ошибка подключения к базе данных

- Проверьте `DATABASE_URL` в `.env`
- Убедитесь, что connection string включает `?sslmode=require`
- Проверьте, что база данных доступна из вашей сети

### Ошибка при деплое на Vercel

- Убедитесь, что `DATABASE_URL` добавлен в Environment Variables в Vercel
- Проверьте, что команда `npm run build` выполняется успешно локально
- Убедитесь, что миграции применены к production базе данных
