# Исправление ошибки redirect_uri_mismatch

## Проблема

Ошибка `Error 400: redirect_uri_mismatch` возникает, когда redirect URI в Google Cloud Console не совпадает с тем, который использует NextAuth.

## Решение

### Шаг 1: Определите правильный redirect URI

NextAuth (Auth.js) использует следующий формат:
```
http://localhost:3000/api/auth/callback/google
```

**Важно:** 
- Используйте `http://` (не `https://`) для localhost
- Порт должен быть `3000` (или тот, на котором запущен ваш dev сервер)
- Путь должен быть точно `/api/auth/callback/google`

### Шаг 2: Настройте Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)

2. Выберите ваш проект (или создайте новый)

3. Перейдите в **APIs & Services** → **Credentials**

4. Найдите ваш OAuth 2.0 Client ID (или создайте новый):
   - Нажмите **Create Credentials** → **OAuth client ID**
   - Выберите **Web application**
   - Дайте имя (например, "GameStore Dev")

5. В разделе **Authorized redirect URIs** добавьте:

   **Для разработки (localhost):**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

   **Если используете другой порт (например, 3001):**
   ```
   http://localhost:3001/api/auth/callback/google
   ```

   **Для production (после деплоя на Vercel):**
   ```
   https://yourdomain.vercel.app/api/auth/callback/google
   ```

6. **Сохраните изменения** (кнопка Save внизу)

### Шаг 3: Проверьте переменные окружения

Убедитесь, что в `.env` указаны правильные значения:

```env
GOOGLE_CLIENT_ID="ваш-client-id-из-google-console"
GOOGLE_CLIENT_SECRET="ваш-client-secret-из-google-console"
AUTH_SECRET="ваш-секретный-ключ"
DATABASE_URL="postgresql://..."
```

### Шаг 4: Перезапустите dev сервер

После изменения настроек в Google Cloud Console:

```bash
# Остановите сервер (Ctrl+C) и запустите снова
npm run dev
```

### Шаг 5: Проверьте работу

1. Откройте http://localhost:3000/login
2. Нажмите "Войти через Google"
3. Должен открыться экран авторизации Google
4. После авторизации вы будете перенаправлены обратно в приложение

## Частые ошибки

### ❌ Неправильный URI
```
http://localhost:3000/auth/callback/google  # Неправильно!
http://localhost:3000/api/auth/google         # Неправильно!
```

### ✅ Правильный URI
```
http://localhost:3000/api/auth/callback/google  # Правильно!
```

### Проверка текущего redirect URI

Чтобы увидеть, какой redirect URI использует NextAuth, откройте консоль браузера (F12) и посмотрите на URL при редиректе на Google. Он должен содержать `redirect_uri=http://localhost:3000/api/auth/callback/google`

## Дополнительные настройки

### Если используете кастомный домен

Для production добавьте все возможные варианты:

```
https://yourdomain.com/api/auth/callback/google
https://www.yourdomain.com/api/auth/callback/google
https://yourdomain.vercel.app/api/auth/callback/google
```

### Если используете другой порт

Если ваш dev сервер запущен на порту 3001, 3002 и т.д., добавьте соответствующий URI:

```
http://localhost:3001/api/auth/callback/google
```

## Проверка настроек

После настройки проверьте:

1. ✅ Redirect URI в Google Console точно совпадает с `http://localhost:3000/api/auth/callback/google`
2. ✅ Нет лишних пробелов или символов в URI
3. ✅ Используется правильный протокол (`http://` для localhost, `https://` для production)
4. ✅ Порт совпадает с портом dev сервера
5. ✅ GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET правильно скопированы в `.env`
6. ✅ Dev сервер перезапущен после изменений

## Если проблема сохраняется

1. Убедитесь, что изменения в Google Cloud Console сохранены (может потребоваться несколько минут для применения)
2. Очистите кэш браузера
3. Проверьте, что используете правильный OAuth Client ID (не путайте с Service Account)
4. Убедитесь, что в Google Cloud Console включен Google+ API или Google Identity API
