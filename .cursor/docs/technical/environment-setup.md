# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Database Configuration
# Get your Neon Postgres connection string from: https://neon.tech
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Clerk Authentication Configuration
# Get these from https://dashboard.clerk.com
# Create an application and go to "API Keys" section
CLERK_SECRET_KEY="sk_test_..." # Server-side secret key (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..." # Client-side publishable key (required)

# Optional: App URL for production
# NEXT_PUBLIC_APP_URL="https://your-app.com"

# AWS S3 Configuration (Deferred to Sprint 2)
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
# AWS_REGION=""
# AWS_S3_BUCKET=""

# App Configuration
NODE_ENV="development"
```

## Setup Steps

1. **Get Neon Postgres Connection String**
   - Sign up at https://neon.tech
   - Create a new project
   - Copy the connection string and paste it as DATABASE_URL

2. **Get Clerk API Keys**
   - Sign up at https://clerk.com
   - Create a new application
   - Navigate to "API Keys" in the dashboard
   - Copy the "Secret Key" → Set as `CLERK_SECRET_KEY`
   - Copy the "Publishable Key" → Set as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

3. **Set App URL (Optional)**
   - `NEXT_PUBLIC_APP_URL`: Optional - used for production deployments
     - For local development: Not required (automatically detected)
     - For production: Set to your actual domain URL (e.g., `https://your-app.com`)

## Next Steps

After setting up the environment variables:
1. Run database migrations: `npm run db:migrate`
2. Seed the database: `npm run db:seed`
3. Start the development server: `npm run dev`

