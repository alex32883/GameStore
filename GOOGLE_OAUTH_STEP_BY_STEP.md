# Пошаговая инструкция: Исправление redirect_uri_mismatch

## Текущая ошибка

```
Error 400: redirect_uri_mismatch
redirect_uri=http://localhost:3000/api/auth/callback/google
```

Это означает, что этот URI **НЕ** зарегистрирован в Google Cloud Console.

## Пошаговое решение

### Шаг 1: Откройте Google Cloud Console

1. Перейдите: https://console.cloud.google.com/
2. Войдите в свой Google аккаунт
3. Выберите проект (или создайте новый)

### Шаг 2: Включите необходимые API

1. В меню слева выберите **APIs & Services** → **Library**
2. Найдите и включите один из следующих API:
   - **Google Identity API** (рекомендуется)
   - ИЛИ **Google+ API** (если первый недоступен)
3. Нажмите **Enable**

### Шаг 3: Создайте OAuth 2.0 Client ID

1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **+ CREATE CREDENTIALS** вверху
3. Выберите **OAuth client ID**

### Шаг 4: Настройте OAuth consent screen (если еще не настроен)

Если видите предупреждение о OAuth consent screen:

1. Нажмите **CONFIGURE CONSENT SCREEN**
2. Выберите **External** (для тестирования)
3. Заполните обязательные поля:
   - **App name**: GameStore (или любое имя)
   - **User support email**: ваш email
   - **Developer contact information**: ваш email
4. Нажмите **SAVE AND CONTINUE**
5. На шаге "Scopes" нажмите **SAVE AND CONTINUE**
6. На шаге "Test users" (опционально) добавьте свой email для тестирования
7. Нажмите **SAVE AND CONTINUE**
8. Нажмите **BACK TO DASHBOARD**

### Шаг 5: Создайте OAuth Client ID

1. Вернитесь в **APIs & Services** → **Credentials**
2. Нажмите **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Выберите **Application type**: **Web application**
4. Введите **Name**: "GameStore Dev" (или любое имя)
5. **ВАЖНО:** В разделе **Authorized redirect URIs** нажмите **+ ADD URI**
6. Введите точно (скопируйте и вставьте):
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. **Проверьте, что нет лишних пробелов!**
8. Нажмите **CREATE**

### Шаг 6: Скопируйте Client ID и Client Secret

После создания вы увидите окно с:
- **Your Client ID** - скопируйте это значение
- **Your Client Secret** - скопируйте это значение

### Шаг 7: Обновите .env файл

Откройте файл `.env` в корне проекта и добавьте/обновите:

```env
GOOGLE_CLIENT_ID="вставьте-сюда-client-id"
GOOGLE_CLIENT_SECRET="вставьте-сюда-client-secret"
AUTH_SECRET="ваш-секретный-ключ"
DATABASE_URL="postgresql://..."
```

**Важно:**
- Не используйте кавычки внутри значений (если они уже есть в .env)
- Или используйте одинарные кавычки, если значения содержат специальные символы

### Шаг 8: Перезапустите dev сервер

1. Остановите текущий сервер (Ctrl+C в терминале)
2. Запустите снова:
   ```bash
   npm run dev
   ```

### Шаг 9: Проверьте работу

1. Откройте http://localhost:3000/login
2. Нажмите "Войти через Google"
3. Должен открыться экран авторизации Google

## Если все еще не работает

### Проверка 1: Убедитесь, что URI добавлен правильно

1. Вернитесь в Google Cloud Console → Credentials
2. Откройте ваш OAuth Client ID
3. Проверьте раздел **Authorized redirect URIs**
4. Должен быть точно такой URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Если его нет - добавьте и **сохраните**

### Проверка 2: Проверьте переменные окружения

Убедитесь, что в `.env` файле:
- `GOOGLE_CLIENT_ID` содержит правильный Client ID (без лишних пробелов)
- `GOOGLE_CLIENT_SECRET` содержит правильный Client Secret (без лишних пробелов)
- Нет лишних кавычек или символов

### Проверка 3: Убедитесь, что используете правильный Client ID

- Не путайте OAuth Client ID с Service Account
- Убедитесь, что используете Client ID из раздела "OAuth 2.0 Client IDs"

### Проверка 4: Подождите несколько минут

Иногда изменения в Google Cloud Console применяются с задержкой (1-5 минут). Подождите и попробуйте снова.

### Проверка 5: Очистите кэш браузера

1. Откройте DevTools (F12)
2. Правый клик на кнопке обновления
3. Выберите "Empty Cache and Hard Reload"

## Альтернативный способ: Проверка через Google Cloud Console API

Если хотите проверить, какие redirect URIs зарегистрированы:

1. В Google Cloud Console → Credentials
2. Откройте ваш OAuth Client ID
3. В разделе "Authorized redirect URIs" вы должны увидеть список URI
4. Убедитесь, что там есть `http://localhost:3000/api/auth/callback/google`

## Если используете другой порт

Если ваш dev сервер запущен на другом порту (например, 3001), добавьте соответствующий URI:

```
http://localhost:3001/api/auth/callback/google
```

И обновите `.env` если нужно.

## Для production (Vercel)

После деплоя на Vercel добавьте production URI:

```
https://your-app.vercel.app/api/auth/callback/google
```

Замените `your-app` на имя вашего приложения на Vercel.
