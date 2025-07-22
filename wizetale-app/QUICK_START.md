# Quick Start - Subscription System

## ✅ Что уже готово:

1. **Премиум бейдж** - отображается в профиле и header
2. **Карточка подписки** - в профиле пользователя
3. **Stripe интеграция** - API endpoints для оплаты
4. **Webhook обработчики** - автоматическое обновление статуса
5. **UI компоненты** - красивые кнопки и формы

## 🚀 Быстрый запуск:

### 1. Настройка Stripe
```bash
# Создайте аккаунт на stripe.com
# Получите тестовые ключи в Dashboard → Developers → API Keys
```

### 2. Создайте .env.local
```bash
# В папке wizetale-app/
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Настройте Webhook
```
URL: https://your-domain.com/api/subscription/webhook
Events: checkout.session.completed, customer.subscription.*
```

### 4. Запустите приложение
```bash
npm run dev
```

## 🧪 Тестирование:

1. Зайдите в профиль пользователя
2. Перейдите на вкладку "Subscription"
3. Нажмите "Upgrade to Premium"
4. Используйте тестовую карту: `4242 4242 4242 4242`

## 📱 Что работает:

- ✅ Отображение премиум статуса в профиле
- ✅ Красивая карточка подписки
- ✅ Stripe Checkout интеграция
- ✅ Автоматическое обновление статуса после оплаты
- ✅ Премиум бейдж в header
- ✅ Обработка успешных/отмененных платежей

## 🔧 Настройка для продакшена:

1. Переключитесь на live ключи Stripe
2. Обновите webhook URL на продакшен домен
3. Протестируйте с реальными картами

## 💡 Следующие шаги:

- Добавить управление подпиской (отмена, изменение плана)
- Интеграция с ограничениями генерации историй
- Аналитика платежей
- Система промокодов 