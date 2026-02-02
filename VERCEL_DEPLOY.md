# Деплой на Vercel - Пошаговая инструкция

## Проблема: Server error на Vercel

Если вы видите ошибку "Server error" на Vercel, проверьте следующие пункты:

## Шаг 1: Переменные окружения на Vercel

**КРИТИЧЕСКИ ВАЖНО:** Все переменные окружения должны быть добавлены в настройках проекта Vercel.

### Как добавить переменные окружения:

1. Откройте ваш проект на Vercel: https://vercel.com/dashboard
2. Выберите ваш проект
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте следующие переменные:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
AUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Важно:**
- Добавьте переменные для всех окружений: **Production**, **Preview**, **Development**
- Используйте те же значения, что и в локальном `.env` файле
- Для `AUTH_SECRET` используйте тот же ключ, что и локально (или сгенерируйте новый)

### Генерация AUTH_SECRET (если нужно):

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Или используйте: https://generate-secret.vercel.app/32

## Шаг 2: Добавьте Production Redirect URI в Google Cloud Console

**КРИТИЧЕСКИ ВАЖНО:** Нужно добавить redirect URI для вашего Vercel домена.

1. Откройте [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Выберите ваш проект
3. Откройте ваш OAuth 2.0 Client ID
4. В разделе **Authorized redirect URIs** добавьте:

```
https://your-app-name.vercel.app/api/auth/callback/google
```

Замените `your-app-name` на имя вашего приложения на Vercel.

**Если используете кастомный домен:**
```
https://yourdomain.com/api/auth/callback/google
https://www.yourdomain.com/api/auth/callback/google
```

5. **Сохраните изменения**

## Шаг 3: Проверьте Build Settings

1. В Vercel перейдите в **Settings** → **General**
2. Убедитесь, что:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (или оставьте пустым - Vercel определит автоматически)
   - **Output Directory**: `.next` (или оставьте пустым)
   - **Install Command**: `npm install` (или оставьте пустым)

## Шаг 4: Примените миграции базы данных

После первого деплоя нужно применить миграции к production базе данных:

### Вариант 1: Через Vercel CLI (рекомендуется)

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Войдите в Vercel
vercel login

# Примените миграции
vercel env pull .env.production
npx prisma migrate deploy
```

### Вариант 2: Локально с production DATABASE_URL

```bash
# Используйте DATABASE_URL из Vercel Environment Variables
DATABASE_URL="your-production-database-url" npx prisma migrate deploy
```

### Вариант 3: Через Neon Dashboard

1. Откройте ваш проект в Neon
2. Перейдите в SQL Editor
3. Выполните миграции вручную или используйте Prisma Migrate

## Шаг 5: Пересоберите проект

После добавления переменных окружения:

1. В Vercel перейдите в **Deployments**
2. Найдите последний деплой
3. Нажмите **...** (три точки) → **Redeploy**
4. Или сделайте новый commit и push в репозиторий

## Шаг 6: Проверка логов

Если ошибка сохраняется:

1. В Vercel перейдите в **Deployments**
2. Откройте последний деплой
3. Перейдите в **Functions** → выберите функцию с ошибкой
4. Посмотрите **Logs** для деталей ошибки

## Частые проблемы и решения

### Проблема 1: "AUTH_SECRET is not defined"

**Решение:** Добавьте `AUTH_SECRET` в Environment Variables на Vercel

### Проблема 2: "DATABASE_URL is not defined"

**Решение:** 
- Добавьте `DATABASE_URL` в Environment Variables
- Убедитесь, что используете production connection string из Neon

### Проблема 3: "redirect_uri_mismatch" на Vercel

**Решение:** 
- Добавьте production redirect URI в Google Cloud Console
- Формат: `https://your-app.vercel.app/api/auth/callback/google`

### Проблема 4: "Prisma Client not generated"

**Решение:** 
- Убедитесь, что в `package.json` команда `build` включает `prisma generate`
- Проверьте, что `prisma` установлен как зависимость (не только devDependency)

### Проблема 5: "Table does not exist"

**Решение:** 
- Примените миграции к production базе данных (см. Шаг 4)

## Проверочный список перед деплоем

- [ ] Все переменные окружения добавлены в Vercel (DATABASE_URL, AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [ ] Production redirect URI добавлен в Google Cloud Console
- [ ] Миграции применены к production базе данных
- [ ] Build команда включает `prisma generate`
- [ ] Проект успешно собирается локально (`npm run build`)

## После успешного деплоя

1. Откройте ваш сайт на Vercel
2. Перейдите на `/login`
3. Попробуйте войти через Google
4. Должно работать без ошибок

## Дополнительная информация

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
