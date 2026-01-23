# Инструкция по настройке проекта

## Шаг 1: Установка зависимостей

```bash
npm install
```

## Шаг 2: Настройка базы данных Neon

1. Зарегистрируйтесь на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. Скопируйте connection string (он выглядит как `postgresql://user:password@host:5432/database?sslmode=require`)

## Шаг 3: Создание .env файла

Создайте файл `.env` в корне проекта:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

Откройте `.env` и замените `DATABASE_URL` на ваш connection string из Neon:

```
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

## Шаг 4: Миграция базы данных

```bash
npm run db:migrate
```

При первом запуске Prisma спросит имя миграции - введите `init` или просто нажмите Enter.

## Шаг 5: Заполнение базы данных (seed)

```bash
npm run db:seed
```

Это добавит 3 тестовые заметки в базу данных.

## Шаг 6: Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) - вы должны увидеть список заметок из базы данных.

## Деплой на Vercel

### Вариант 1: Через Vercel CLI

```bash
# Установка Vercel CLI (если еще не установлен)
npm i -g vercel

# Деплой
vercel
```

### Вариант 2: Через GitHub

1. Создайте репозиторий на GitHub
2. Загрузите код:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
3. Подключите репозиторий к Vercel:
   - Зайдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Выберите ваш репозиторий
   - В разделе "Environment Variables" добавьте `DATABASE_URL` со значением из Neon
   - Нажмите "Deploy"

### После деплоя

Выполните миграции на production базе данных:

```bash
# Установите production DATABASE_URL локально или используйте Vercel CLI
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

Или выполните миграции через Neon Dashboard.

## Проверка работы

После деплоя откройте ваш сайт на Vercel. Главная страница должна показать список заметок из базы данных PostgreSQL (Neon).
