# Lending OS - Setup Guide

Welcome to Lending OS! This guide will help you get the application running locally.

## Prerequisites

- Node.js 18+ and npm
- A Neon Postgres database (free tier available at [neon.tech](https://neon.tech))
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd lending-os
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Database Configuration
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# BetterAuth Configuration
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

**Get your DATABASE_URL:**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Paste it as the `DATABASE_URL` value

**Generate BETTER_AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Run Database Migrations

```bash
npm run db:generate   # Generate migration files
npm run db:migrate    # Apply migrations to database
```

### 5. Seed the Database (Optional)

```bash
npm run db:seed
```

This creates:
- Test organization: "Test Lending Company"
- Test user: admin@lendingos.com / password123
- 8 sample loans with various statuses

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Login

If you ran the seed script, you can login with:

- **Email:** admin@lendingos.com
- **Password:** password123

Otherwise, navigate to `/auth/v1/register` to create your first account.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Database scripts
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes (dev only)
npm run db:studio    # Open Drizzle Studio (database GUI)
npm run db:seed      # Seed database with sample data
```

## Project Structure

```
lending-os/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (main)/
│   │   │   ├── auth/          # Authentication pages
│   │   │   └── dashboard/     # Dashboard pages
│   │   ├── api/
│   │   │   ├── auth/          # BetterAuth API
│   │   │   └── v1/            # REST API v1
│   │   └── globals.css        # Global styles
│   ├── components/            # Shared UI components
│   ├── db/                    # Database layer
│   │   ├── schema/           # Drizzle schema
│   │   ├── client.ts         # DB connection
│   │   ├── migrate.ts        # Migration runner
│   │   └── seed.ts           # Seed script
│   ├── lib/                   # Utilities
│   │   ├── auth.ts           # BetterAuth config
│   │   ├── auth-client.ts    # Client auth SDK
│   │   └── auth-server.ts    # Server auth helpers
│   ├── services/              # Business logic
│   ├── types/                 # TypeScript types
│   └── navigation/            # Navigation config
├── .cursor/                   # Project documentation
│   ├── docs/                 # Technical docs
│   └── notes/                # Development notes
├── drizzle.config.ts         # Drizzle configuration
└── package.json
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Neon Postgres + Drizzle ORM
- **Authentication:** BetterAuth
- **UI:** Shadcn UI + Tailwind CSS v4
- **Typography:** Open Sans + Geist Mono
- **Language:** TypeScript

## Features

### Sprint 1 (Current)

- ✅ Email/password authentication
- ✅ Session management
- ✅ Portfolio dashboard with lending metrics
- ✅ Loan management API (CRUD)
- ✅ Responsive design
- ✅ Dark/light mode
- ✅ Multiple theme presets

### Coming in Sprint 2

- Borrower & lender management
- Property tracking
- Role-based access control (RBAC)
- Loan detail views
- File upload (AWS S3)
- Enhanced dashboard with real data

## API Documentation

API endpoints are documented in `.cursor/docs/api-endpoints.md`.

**Base URL:** `/api/v1`

**Example:**
```bash
# Get all loans (requires authentication)
curl http://localhost:3000/api/v1/loans \
  -H "Cookie: better-auth.session_token=<your-session-token>"
```

## Database Management

### Drizzle Studio

Open a visual database browser:

```bash
npm run db:studio
```

This opens a web interface at `https://local.drizzle.studio` where you can browse and edit data.

### Making Schema Changes

1. Edit schema files in `src/db/schema/`
2. Generate migration: `npm run db:generate`
3. Review generated SQL in `src/db/migrations/`
4. Apply migration: `npm run db:migrate`

## Troubleshooting

### "DATABASE_URL is not set"

Make sure you've created `.env.local` with a valid `DATABASE_URL`.

### "Unauthorized" errors

Check that:
1. `BETTER_AUTH_SECRET` is set in `.env.local`
2. Migrations have been run: `npm run db:migrate`
3. You're logged in (session cookie exists)

### Database connection fails

Verify your Neon database is:
1. Running and accessible
2. Connection string is correct
3. Includes `?sslmode=require`

### Port 3000 already in use

Kill the existing process or use a different port:
```bash
PORT=3001 npm run dev
```

## Development Tips

1. **Hot Reload:** The dev server automatically reloads on file changes
2. **Type Checking:** TypeScript errors show in the terminal and browser
3. **Database Changes:** Always run `db:generate` after schema changes
4. **API Testing:** Use Drizzle Studio or cURL to test API endpoints

## Documentation

Comprehensive documentation is available in `.cursor/docs/`:

- `database-schema.md` - Database structure and relationships
- `auth-flow.md` - Authentication implementation details
- `api-endpoints.md` - REST API reference
- `sprint-1-summary.md` - Sprint 1 implementation summary
- `environment-setup.md` - Environment variables guide

## Support

For questions or issues:
1. Check the documentation in `.cursor/docs/`
2. Review the project checklist in `.cursor/notes/project_checklist.md`
3. Open an issue on GitHub

## License

MIT

---

**Happy lending! 💰**

