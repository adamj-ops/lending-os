# Quick Start Guide for Claude Code

This guide helps Claude Code get productive immediately in the Lending OS codebase.

## First Steps (Do This First!)

1. **Read the main guide:** [README.md](./README.md)
2. **Check tech stack rules:** `/.cursor/rules/tech-stack-lock.md`
3. **Review current sprint:** `/.cursor/notes/project_checklist.md`

## Most Common Tasks

### 1. Adding a New Shadcn Component (Always Approved ✅)
```bash
npx shadcn@latest add [component-name]
```
No approval needed! All Shadcn components are pre-approved.

### 2. Making Database Schema Changes
```bash
# 1. Edit schema file
vim src/db/schema/[entity].ts

# 2. Generate migration
npm run db:generate

# 3. Apply migration
npm run db:migrate
```

### 3. Creating a New API Endpoint
Pattern: `src/app/api/v1/[entity]/route.ts`
```typescript
import { requireAuth } from "@/lib/session";
import { EntityService } from "@/services/entity.service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
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

### 4. Creating a Form with Validation
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";

const schema = z.object({
  email: z.string().email(),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

## Before Installing Any Package

⚠️ **STOP AND CHECK:**
1. Is it in `/.cursor/rules/tech-stack-lock.md`?
2. If NO → ASK user first
3. If Shadcn component → Install freely (pre-approved)

## Tech Stack (Quick Reference)

**Approved:**
- UI: Shadcn UI ✅ (always approved)
- Framework: Next.js 16 + React 19
- Database: Drizzle ORM + Neon Postgres
- Auth: iron-session
- Forms: React Hook Form + Zod
- State: TanStack Query + Zustand

**Forbidden:**
- ❌ NextAuth, Clerk, Auth0, Better Auth
- ❌ Prisma, TypeORM
- ❌ Material UI, Bootstrap, Chakra
- ❌ Redux, MobX

## Essential Commands

```bash
# Development
npm run dev              # Start dev server

# Database
npm run db:generate      # After schema changes
npm run db:migrate       # Apply migrations
npm run db:studio        # Visual database browser

# Code Quality
npm run lint            # Run linting
npm run format          # Format code
```

## Project Structure (Quick Map)

```
src/
├── app/
│   ├── (main)/dashboard/     # Dashboard pages (colocated features)
│   └── api/v1/               # API routes
├── components/ui/            # Shadcn components
├── db/schema/                # Database schemas
├── services/                 # Business logic (*.service.ts)
├── types/                    # TypeScript types
└── lib/                      # Utilities

Key concepts:
- Colocation: Feature code stays together
- Service layer: All business logic in services
- Type safety: Zod validation + TypeScript
```

## Common Patterns (Copy-Paste Ready)

### React Query Hook
```typescript
export const useEntity = () => {
  return useQuery({
    queryKey: ["entities"],
    queryFn: async () => {
      const res = await fetch("/api/v1/entities");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
};
```

### Service Class
```typescript
export class EntityService {
  static async create(data: CreateDTO): Promise<Entity> {
    const [entity] = await db.insert(entities).values(data).returning();
    return entity as Entity;
  }

  static async getById(id: string): Promise<Entity | null> {
    const [entity] = await db.select().from(entities).where(eq(entities.id, id)).limit(1);
    return (entity as Entity) || null;
  }

  static async getByOrganization(orgId: string): Promise<Entity[]> {
    return await db.select().from(entities).where(eq(entities.organizationId, orgId));
  }

  static async update(id: string, data: UpdateDTO): Promise<Entity | null> {
    const [entity] = await db.update(entities).set({ ...data, updatedAt: new Date() }).where(eq(entities.id, id)).returning();
    return (entity as Entity) || null;
  }

  static async delete(id: string): Promise<boolean> {
    await db.delete(entities).where(eq(entities.id, id));
    return true;
  }
}
```

## When In Doubt

1. **Check existing patterns** - Look at borrowers or lenders as examples
2. **Check tech stack lock** - `.cursor/rules/tech-stack-lock.md`
3. **Ask user** - Better to ask than make wrong assumptions

## Current Sprint Focus

**Sprint 2A:** Borrower & Lender Management Module

Status:
- ✅ Database schemas (exist)
- ✅ Service layer (exist)
- ✅ API routes (exist)
- 🚧 Frontend pages (in progress)
- 📋 Forms & validation (pending)
- 📋 Search/filter (pending)

See: `/.cursor/notes/project_checklist.md` for full sprint details.
