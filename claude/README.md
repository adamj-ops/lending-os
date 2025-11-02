# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lending OS** is a modern loan origination and portfolio management system built for private lenders. It enables tracking of borrowers, lenders, properties, loans, and related documents through a clean, responsive dashboard interface.

**Current Phase:** Sprint 2A - Borrower & Lender Management Module
**Tech Stack:** Next.js 16 (App Router), TypeScript, Drizzle ORM, Neon Postgres, Shadcn UI, TanStack Table/Query

## Essential Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### Database Operations
```bash
npm run db:generate  # Generate Drizzle migration files from schema changes
npm run db:migrate   # Apply migrations to database
npm run db:push      # Push schema changes directly (dev only, no migration files)
npm run db:studio    # Open Drizzle Studio (visual database browser)
npm run db:seed      # Seed database with sample data
npm run db:clear     # Clear all data from database
npm run db:reset     # Clear and re-seed database
```

**Important:** Always run `db:generate` after making schema changes, then `db:migrate` to apply them.

### Theme Management
```bash
npm run generate:presets  # Generate CSS theme presets
```

## Tech Stack Rules - CRITICAL

### BEFORE Installing ANY Package
1. Check `.cursor/rules/tech-stack-lock.md`
2. If package is NOT listed → **STOP and ASK user**
3. If compatibility issue → **PRESENT OPTIONS, don't improvise**

### Approved Stack
- **UI:** Shadcn UI (ALL components pre-approved) + Tailwind CSS v4
- **Framework:** Next.js 16 + React 19
- **Database:** Neon Postgres + Drizzle ORM
- **Auth:** iron-session (custom auth implementation)
- **Forms:** React Hook Form + Zod validation
- **State:** Zustand (minimal) + TanStack Query (server state)
- **Icons:** Lucide React (Shadcn default)
- **Fonts:** Open Sans (primary), Geist Mono (monospace)

### Explicitly Forbidden Without Approval
- Clerk (current)
- Prisma, TypeORM, Kysely
- Material UI, Chakra, Bootstrap, Ant Design
- Redux, MobX, Recoil
- Any CSS-in-JS libraries (styled-components, Emotion)

### Shadcn UI - Always Approved
```bash
# Use freely - NO approval needed
npx shadcn@latest add [component-name]
```
All Shadcn components and ecosystem libraries (Magic UI, Aceternity UI, Origin UI) are pre-approved.

## Architecture

### Colocation Pattern
Features are colocated within their route folders. Each feature keeps its pages, components, and logic together.

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/
│   │   ├── auth/          # Auth pages + components (_components/)
│   │   └── dashboard/     # Dashboard pages + feature modules
│   │       ├── borrowers/ # Borrower management feature
│   │       ├── lenders/   # Lender management feature
│   │       ├── loans/     # Loan management feature
│   │       └── portfolio/ # Portfolio analytics
│   └── api/v1/            # REST API routes
├── components/            # Shared UI components only
│   ├── ui/               # Shadcn components
│   └── [shared-feature]/ # Cross-feature components
├── db/
│   ├── schema/           # Drizzle schema files (one per entity)
│   ├── client.ts         # Database connection
│   └── migrate.ts        # Migration runner
├── services/             # Business logic layer (*.service.ts)
├── types/                # TypeScript types (one per entity)
├── lib/                  # Utilities and helpers
└── navigation/           # Navigation configuration
```

### Database Schema Organization
- One schema file per entity (borrowers.ts, lenders.ts, loans.ts, etc.)
- All schemas exported through `schema/index.ts`
- Use Drizzle ORM for all database operations
- Foreign keys cascade on delete where appropriate
- Add indexes on `organization_id` and frequently queried fields

### Service Layer Pattern
All business logic lives in service classes:
```typescript
// src/services/borrower.service.ts
export class BorrowerService {
  static async createBorrower(data: CreateBorrowerDTO): Promise<Borrower> { }
  static async getBorrowerById(id: string): Promise<Borrower | null> { }
  static async getBorrowersByOrganization(orgId: string): Promise<Borrower[]> { }
  static async updateBorrower(id: string, data: UpdateBorrowerDTO): Promise<Borrower | null> { }
  static async deleteBorrower(id: string): Promise<boolean> { }
}
```

### API Route Pattern
```typescript
// src/app/api/v1/[entity]/route.ts
import { requireAuth } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(); // Throws if not authenticated
    const data = await EntityService.getByOrganization(session.userId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
```

**Important:**
- All API routes require authentication via `requireAuth()`
- All data is scoped to `organizationId` (currently using `session.userId`)
- Use consistent error handling format

### Type Safety
- Define types in `src/types/[entity].ts`
- Export DTOs (CreateDTO, UpdateDTO) and entity types
- Use Zod schemas for validation (located in same file or `lib/validation/`)

### Authentication Flow
- Uses `iron-session` for encrypted session cookies
- Session helpers: `lib/session.ts` (server-side)
- Auth required on all `/dashboard/*` routes (via middleware)
- Session contains: `userId`, `email`, `organizationId`

## Frontend Patterns

### Form Handling
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  email: z.string().email("Invalid email"),
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { firstName: "", email: "" }
});
```

### Data Fetching with React Query
```typescript
// Custom hook pattern
export const useBorrowers = () => {
  return useQuery({
    queryKey: ["borrowers"],
    queryFn: async () => {
      const response = await fetch("/api/v1/borrowers");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });
};

// In component
const { data, isLoading, error } = useBorrowers();
```

### TanStack Table Pattern
Use the existing `SimpleDataTable` component for list views:
```typescript
import { SimpleDataTable } from "@/components/data-table/simple-data-table";

const columns: ColumnDef<Borrower>[] = [
  { accessorKey: "firstName", header: "First Name" },
  { accessorKey: "email", header: "Email" },
];

<SimpleDataTable columns={columns} data={data} />
```

## Styling Guidelines

### Use Tailwind Classes Only
```typescript
// Good
<div className="flex items-center gap-2 rounded-lg border p-4">

// Bad - no CSS files or inline styles
<div style={{ display: "flex" }}>
```

### Responsive Design
- Mobile-first approach
- Design targets: 768px+ (tablet), 1024px+ (desktop)
- Use Tailwind responsive prefixes: `md:`, `lg:`

### Theme System
- Supports light/dark mode via `next-themes`
- Theme presets: default, tangerine, brutalist, soft-pop
- Preferences stored in database (users table)

## Important Workflows

### Adding a New Entity (e.g., "Payment")

1. **Create database schema** (`src/db/schema/payments.ts`)
2. **Export from index** (`src/db/schema/index.ts`)
3. **Generate migration** (`npm run db:generate`)
4. **Apply migration** (`npm run db:migrate`)
5. **Create types** (`src/types/payment.ts`)
6. **Create service** (`src/services/payment.service.ts`)
7. **Create API routes** (`src/app/api/v1/payments/route.ts` and `[id]/route.ts`)
8. **Create frontend page** (`src/app/(main)/dashboard/payments/page.tsx`)
9. **Add navigation** (update `src/navigation/sidebar/sidebar-items.ts`)

### Making Schema Changes

```bash
# 1. Edit schema file
vim src/db/schema/borrowers.ts

# 2. Generate migration
npm run db:generate

# 3. Review generated SQL
cat src/db/migrations/0001_*.sql

# 4. Apply migration
npm run db:migrate

# 5. Update types if needed
vim src/types/borrower.ts
```

### Adding a Shadcn Component

```bash
# Install component (always approved)
npx shadcn@latest add dialog

# Import and use
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
```

## Environment Variables

Required in `.env.local`:
```bash
DATABASE_URL="postgresql://..."          # Neon Postgres connection string
SESSION_SECRET="your-secret-key"         # For iron-session encryption (generate with: openssl rand -base64 32)
NODE_ENV="development"                   # Environment mode
```

Optional:
```bash
AWS_REGION="us-east-1"                  # For S3 file uploads
AWS_ACCESS_KEY_ID="..."                 # AWS credentials
AWS_SECRET_ACCESS_KEY="..."             # AWS credentials
AWS_S3_BUCKET_NAME="..."                # S3 bucket for documents
```

## Common Gotchas

### Next.js 16 Compatibility
- Many auth libraries incompatible (use iron-session only)
- React Query v5+ required
- Prefer Server Components by default, use `"use client"` only when needed

### Database Queries
- Always filter by `organizationId` for multi-tenancy
- Use Drizzle's type-safe query builder
- Avoid raw SQL queries

### Form Submission
- Use `"use server"` for server actions when appropriate
- Invalidate React Query cache after mutations: `queryClient.invalidateQueries()`
- Show toast notifications on success/error using Sonner

### File Structure
- Keep feature code together (colocation)
- Shared components go in `src/components/`
- Use underscore prefix for feature-local folders: `_components/`, `_lib/`

## Project References

### Documentation
- `.cursor/rules/` - Development rules and tech stack lock
- `.cursor/docs/` - Technical documentation
- `.cursor/notes/` - Development notes and progress
- `SETUP.md` - Setup and installation guide

### Key Files
- `drizzle.config.ts` - Drizzle ORM configuration
- `src/config/app-config.ts` - Application configuration
- `src/navigation/sidebar/sidebar-items.ts` - Sidebar navigation items
- `src/middleware.ts` - Auth middleware for protected routes

## Testing (Future - Sprint 6)
- **Unit Tests:** Vitest
- **E2E Tests:** Playwright
- Not yet implemented - skip test setup for now

## Current Sprint Context

**Sprint 2A Goal:** Complete Borrower & Lender Management Module
- Database schemas ✅ (already exist, may need updates)
- API routes ✅ (CRUD endpoints exist)
- Service layer ✅ (BorrowerService, LenderService exist)
- Frontend pages (in progress)
- Forms and validation (pending)
- Relationship linking (pending)
- Search/filter (pending)

## Decision Process

When you encounter uncertainty:
1. Check if solution exists in tech stack lock
2. Look for similar patterns in existing code
3. If no pattern exists, ASK user before proceeding
4. Document approved decisions in agent notes

**Remember:** User prefers questions over bad assumptions.
