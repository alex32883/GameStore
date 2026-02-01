# Настройка аутентификации

Проект использует Auth.js (NextAuth v5) с Google OAuth для аутентификации пользователей.

## Переменные окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# Обязательные переменные
AUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
DATABASE_URL="postgresql://..."
```

### Генерация AUTH_SECRET

Сгенерируйте секретный ключ для Auth.js:

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Или используйте онлайн генератор: https://generate-secret.vercel.app/32

### Настройка Google OAuth

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API
4. Перейдите в "Credentials" → "Create Credentials" → "OAuth client ID"
5. Выберите "Web application"
6. Добавьте Authorized redirect URIs:
   - Для разработки: `http://localhost:3000/api/auth/callback/google`
   - Для production: `https://yourdomain.com/api/auth/callback/google`
7. Скопируйте Client ID и Client Secret в `.env`

## Структура аутентификации

### Файлы

- `auth.ts` - основная конфигурация Auth.js с Prisma adapter
- `auth.config.ts` - конфигурация провайдеров и callbacks
- `middleware.ts` - защита страниц `/dashboard` и `/my-prompts`
- `app/api/auth/[...nextauth]/route.ts` - API routes для Auth.js
- `app/login/page.tsx` - страница входа
- `app/dashboard/page.tsx` - личный кабинет (защищено)
- `app/my-prompts/page.tsx` - мои игры (защищено)

### Защищенные страницы

Следующие страницы требуют аутентификации:
- `/dashboard` - личный кабинет
- `/my-prompts` - мои игры

Неавторизованные пользователи автоматически перенаправляются на `/login`.

### Использование в коде

#### Server Components

```typescript
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }
  
  // session.user содержит: id, email, name, image
  return <div>Hello {session.user.name}</div>
}
```

#### Client Components

```typescript
'use client'
import { signIn, signOut } from 'next-auth/react'

// Вход
await signIn('google', { callbackUrl: '/dashboard' })

// Выход
await signOut({ callbackUrl: '/' })
```

#### Server Actions

```typescript
'use server'
import { signOut } from '@/auth'

export async function logoutAction() {
  await signOut({ redirectTo: '/' })
}
```

## База данных

Auth.js автоматически создает следующие таблицы:
- `users` - пользователи (расширена модель User)
- `accounts` - OAuth аккаунты
- `sessions` - сессии пользователей
- `verification_tokens` - токены для верификации

При первом входе через Google пользователь автоматически создается в БД.

## Проверка работы

1. Убедитесь, что все переменные окружения установлены
2. Запустите проект: `npm run dev`
3. Откройте http://localhost:3000/login
4. Нажмите "Войти через Google"
5. После входа вы будете перенаправлены на `/dashboard`
