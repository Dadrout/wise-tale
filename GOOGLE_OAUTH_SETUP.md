# Настройка Google OAuth для Wizetale

Эта инструкция поможет настроить Google OAuth так, чтобы он работал и локально, и в продакшене без ошибок COOP (Cross-Origin-Opener-Policy).

## Проблема

Ошибка `Cross-Origin-Opener-Policy policy would block the window.close call` возникает, когда браузер блокирует закрытие popup-окна из-за политик безопасности.

## Решение

### 1. Обновление кода (уже выполнено)

- ✅ Убраны проблемные COOP заголовки из `next.config.mjs`
- ✅ Добавлен fallback на redirect метод в `use-auth.ts`
- ✅ Добавлена обработка результата redirect

### 2. Настройка Firebase Console

1. Перейдите в [Firebase Console](https://console.firebase.google.com)
2. Выберите ваш проект
3. Authentication → Sign-in method → Google
4. Включите Google provider
5. В разделе "Authorized domains" добавьте:
   - `localhost`
   - Ваш production домен (например: `wizetale.com`)

### 3. Настройка Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com)
2. Выберите тот же проект, что и в Firebase
3. APIs & Services → Credentials
4. Найдите "OAuth 2.0 Client IDs" → Web client
5. Нажмите на него для редактирования

#### Authorized JavaScript origins:
```
http://localhost:3000
http://localhost:3001
https://your-domain.com
https://www.your-domain.com
```

#### Authorized redirect URIs:
```
http://localhost:3000
http://localhost:3001
https://your-domain.com
https://www.your-domain.com
https://your-project.firebaseapp.com/__/auth/handler
```

### 4. Переменные окружения

Создайте файл `.env.local` в папке `wizetale-app`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 5. Перезапуск приложения

После всех изменений перезапустите фронтенд:

```bash
# Если используете Docker
docker-compose -f docker-compose.dev.yml restart frontend

# Если локально
cd wizetale-app
npm run dev
```

### 6. Тестирование

1. Откройте браузер в режиме инкогнито
2. Перейдите на страницу логина/регистрации
3. Нажмите "Sign in with Google"
4. Если popup заблокирован, автоматически произойдёт redirect

## Дополнительные рекомендации

### Для production:

1. Используйте HTTPS (обязательно для OAuth)
2. Настройте правильные домены в Firebase и Google Console
3. Проверьте, что nginx не добавляет COOP заголовки

### Отладка:

Если проблема сохраняется:
1. Откройте DevTools → Network
2. Проверьте Response Headers на наличие `Cross-Origin-Opener-Policy`
3. Убедитесь, что этот заголовок отсутствует

### Альтернативное решение:

Если popup всё равно не работает, можно полностью перейти на redirect метод:

```typescript
// В use-auth.ts замените signInWithGoogle на:
const signInWithGoogle = async () => {
  setLoading(true)
  try {
    const provider = new GoogleAuthProvider()
    const { signInWithRedirect } = await import('firebase/auth')
    await signInWithRedirect(auth, provider)
  } catch (error) {
    console.error('Google sign-in error:', error)
    throw error
  }
}
```

## Проверка статуса

Команда для проверки запущенных контейнеров:
```bash
docker ps
```

Логи фронтенда:
```bash
docker-compose -f docker-compose.dev.yml logs frontend
``` 