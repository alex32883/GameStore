# Диагностика проблем на Vercel

## Если видите только "Deployment Overview"

Это означает, что деплой либо не завершился, либо есть ошибки. Выполните следующие шаги:

## Шаг 1: Проверьте статус деплоя

1. Откройте ваш проект на Vercel: https://vercel.com/dashboard
2. Перейдите в раздел **Deployments**
3. Найдите последний деплой и проверьте его статус:
   - ✅ **Ready** - деплой успешен
   - ⏳ **Building** - деплой в процессе
   - ❌ **Error** - есть ошибки

## Шаг 2: Проверьте логи сборки

Если деплой завершился с ошибкой:

1. Откройте последний деплой
2. Нажмите на **Build Logs** или **View Function Logs**
3. Найдите ошибки (обычно выделены красным)

### Частые ошибки сборки:

#### Ошибка 1: "Prisma Client not generated"
```
Error: @prisma/client did not initialize yet
```

**Решение:**
- Убедитесь, что в `package.json` есть `postinstall: "prisma generate"`
- Проверьте, что `prisma` установлен (не только в devDependencies)

#### Ошибка 2: "Module not found"
```
Error: Cannot find module 'xxx'
```

**Решение:**
- Проверьте, что все зависимости указаны в `package.json`
- Убедитесь, что `node_modules` не закоммичены в Git

#### Ошибка 3: "Environment variable not found"
```
Error: DATABASE_URL is not defined
```

**Решение:**
- Добавьте все переменные окружения в Vercel (см. ниже)

#### Ошибка 4: "Tailwind CSS error"
```
Error: PostCSS plugin error
```

**Решение:**
- Убедитесь, что `postcss.config.js` настроен правильно
- Проверьте, что `tailwindcss` установлен

## Шаг 3: Проверьте переменные окружения

**КРИТИЧЕСКИ ВАЖНО:** Убедитесь, что все переменные добавлены:

1. В Vercel: **Settings** → **Environment Variables**
2. Добавьте для **Production**, **Preview**, **Development**:

```
DATABASE_URL=postgresql://...
AUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

3. После добавления: **Deployments** → последний деплой → **...** → **Redeploy**

## Шаг 4: Проверьте Build Settings

1. В Vercel: **Settings** → **General**
2. Убедитесь:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (или пусто)
   - **Output Directory**: `.next` (или пусто)
   - **Install Command**: `npm install` (или пусто)
   - **Node.js Version**: 18.x или 20.x

## Шаг 5: Проверьте локальную сборку

Убедитесь, что проект собирается локально:

```bash
npm run build
```

Если есть ошибки - исправьте их перед деплоем.

## Шаг 6: Проверьте Runtime Logs

Если сборка успешна, но сайт не работает:

1. В Vercel: **Deployments** → последний деплой
2. Перейдите в **Functions**
3. Откройте функцию с ошибкой
4. Посмотрите **Logs** для runtime ошибок

## Быстрая проверка

### ✅ Чеклист:

- [ ] Все переменные окружения добавлены в Vercel
- [ ] Проект собирается локально (`npm run build`)
- [ ] Нет ошибок в Build Logs на Vercel
- [ ] Миграции применены к production БД
- [ ] Production redirect URI добавлен в Google Cloud Console

## Если проблема сохраняется

1. **Скопируйте полный текст ошибки** из Build Logs
2. **Проверьте**, что все зависимости установлены:
   ```bash
   npm install
   ```
3. **Проверьте**, что нет проблем с TypeScript:
   ```bash
   npm run lint
   ```

## Полезные команды для диагностики

```bash
# Проверить локальную сборку
npm run build

# Проверить типы
npx tsc --noEmit

# Проверить линтер
npm run lint

# Сгенерировать Prisma Client
npx prisma generate
```
