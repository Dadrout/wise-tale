# Stripe Setup Instructions

## 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the account setup process

## 2. Get API Keys
1. Go to Stripe Dashboard → Developers → API Keys
2. Copy your **Publishable Key** and **Secret Key**
3. For webhook secret, go to Webhooks → Add endpoint

## 3. Environment Variables
Create `.env.local` file in `wizetale-app/` with:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Webhook Setup
1. In Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://your-domain.com/api/subscription/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## 5. Test the Integration
1. Use Stripe test cards for testing
2. Test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any 3-digit CVC

## 6. Production Setup
1. Switch to live keys in production
2. Update webhook URL to production domain
3. Test with real payment methods

## Features Implemented
- ✅ Premium badge in profile
- ✅ Subscription card with upgrade button
- ✅ Stripe checkout integration
- ✅ Webhook handling for subscription events
- ✅ User profile updates on payment
- ✅ Success/cancel message handling 