# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Database Configuration
# Get your Neon Postgres connection string from: https://neon.tech
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# BetterAuth Configuration
# Generate a secure secret with: openssl rand -base64 32
BETTER_AUTH_SECRET="your-secret-key-here-change-this-in-production"
BETTER_AUTH_URL="http://localhost:3000"

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

2. **Generate Auth Secret**
   ```bash
   openssl rand -base64 32
   ```
   - Copy the output and paste it as BETTER_AUTH_SECRET

3. **Set Auth URL**
   - For local development: `http://localhost:3000`
   - For production: Your actual domain URL

## Next Steps

After setting up the environment variables:
1. Run database migrations: `npm run db:migrate`
2. Seed the database: `npm run db:seed`
3. Start the development server: `npm run dev`

