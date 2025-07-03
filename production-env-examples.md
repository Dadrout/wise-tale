# Production Environment Variables Examples

Copy the appropriate sections below to create your `.env.production` files in each directory.

## Backend API (.env.production in wisetale-api/)

```bash
# WiseTale API Production Environment Variables
ENVIRONMENT=production
DEBUG=false

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Redis
REDIS_URL=redis://redis:6379
REDIS_DB=0

# AI Services
OPENAI_API_KEY=your-openai-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
RUNWAY_API_KEY=your-runway-api-key

# Media Services
PEXELS_API_KEY=your-pexels-api-key
PIXABAY_API_KEY=your-pixabay-api-key

# Security
SECRET_KEY=your-super-secret-key-for-jwt-tokens
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# API Settings
API_V1_PREFIX=/api/v1
MAX_REQUEST_SIZE=50MB
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60

# Storage
STORAGE_BUCKET=your-s3-bucket
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/wisetale-api.log

# Performance
WORKER_PROCESSES=4
MAX_CONNECTIONS=1000
KEEPALIVE_TIMEOUT=65

# Monitoring
SENTRY_DSN=your-sentry-dsn
ANALYTICS_ENABLED=true
```

## Frontend App (.env.production in wisetale-app/)

```bash
# WiseTale App Production Environment Variables
NODE_ENV=production
NEXT_PUBLIC_ENV=production

# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_VERSION=v1

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAaYnmkiIR01-kuFYQRR7RGK8HWVs7duLg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=time-capsule-d5a66.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=time-capsule-d5a66
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=time-capsule-d5a66.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=218071541143
NEXT_PUBLIC_FIREBASE_APP_ID=1:218071541143:web:c3eadd2c64274082ff50d2
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YWMXJ6FHD3

# App Configuration
NEXT_PUBLIC_APP_NAME=WiseTale
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SENTRY=true
NEXT_PUBLIC_ENABLE_HOTJAR=false

# Content
NEXT_PUBLIC_MAX_STORY_LENGTH=10
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,es,fr,de

# Performance
NEXT_PUBLIC_CACHE_DURATION=3600
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com

# Security
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
NEXT_PUBLIC_CSP_ENABLED=true

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_HOTJAR_ID=your-hotjar-id

# SEO
NEXT_PUBLIC_SITE_NAME=WiseTale - AI-Powered Educational Stories
NEXT_PUBLIC_SITE_DESCRIPTION=Create personalized educational stories with AI
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Social Media
NEXT_PUBLIC_TWITTER_HANDLE=@wisetale
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id

# Build Configuration
ANALYZE=false
BUNDLE_ANALYZE=false
```

## Landing Page (.env.production in wisetale-landing/)

```bash
# WiseTale Landing Production Environment Variables
NODE_ENV=production
NEXT_PUBLIC_ENV=production

# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_VERSION=v1

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAaYnmkiIR01-kuFYQRR7RGK8HWVs7duLg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=time-capsule-d5a66.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=time-capsule-d5a66
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=time-capsule-d5a66.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=218071541143
NEXT_PUBLIC_FIREBASE_APP_ID=1:218071541143:web:c3eadd2c64274082ff50d2
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YWMXJ6FHD3

# Landing Page Configuration
NEXT_PUBLIC_LANDING_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com

# Waitlist
NEXT_PUBLIC_WAITLIST_ENABLED=true
NEXT_PUBLIC_MAILCHIMP_API_KEY=your-mailchimp-api-key
NEXT_PUBLIC_MAILCHIMP_LIST_ID=your-mailchimp-list-id

# Content
NEXT_PUBLIC_DEMO_VIDEO_URL=https://yourdomain.com/demo-video.mp4
NEXT_PUBLIC_TESTIMONIALS_ENABLED=true

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SENTRY=true
NEXT_PUBLIC_ENABLE_HOTJAR=true

# Performance
NEXT_PUBLIC_CACHE_DURATION=3600
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com

# Security
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
NEXT_PUBLIC_CSP_ENABLED=true

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_HOTJAR_ID=your-hotjar-id

# SEO
NEXT_PUBLIC_SITE_NAME=WiseTale - AI-Powered Educational Stories
NEXT_PUBLIC_SITE_DESCRIPTION=Create personalized educational stories with AI-powered video generation
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_KEYWORDS=AI stories,educational content,personalized learning,video generation

# Social Media
NEXT_PUBLIC_TWITTER_HANDLE=@wisetale
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
NEXT_PUBLIC_LINKEDIN_COMPANY_ID=your-linkedin-company-id

# Marketing
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your-facebook-pixel-id

# Legal
NEXT_PUBLIC_PRIVACY_POLICY_URL=https://yourdomain.com/privacy
NEXT_PUBLIC_TERMS_OF_SERVICE_URL=https://yourdomain.com/terms
NEXT_PUBLIC_CONTACT_EMAIL=contact@yourdomain.com

# Build Configuration
ANALYZE=false
BUNDLE_ANALYZE=false
```

## Quick Setup Commands

```bash
# Copy examples to actual files
cp production-env-examples.md wisetale-api/.env.production
cp production-env-examples.md wisetale-app/.env.production
cp production-env-examples.md wisetale-landing/.env.production

# Then edit each file to include only the relevant section and fill in your actual values
``` 