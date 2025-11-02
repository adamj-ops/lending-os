# Project Context & Sprint Status

This file tracks the current state of the Lending OS project for Claude Code.

## Current Sprint: Sprint 2A

**Focus:** Borrower & Lender Management Module (Epic E2)

**Timeline:** 2 weeks

**Goal:** Build foundational borrower and lender management system with CRUD operations, relationship linking to loans, and search/filter capabilities.

---

## What's Complete ✅

### Sprint 1 (Completed)
- Authentication system (Clerk - migrated from BetterAuth)
- Database setup (Neon Postgres + Drizzle ORM)
- Basic loan CRUD operations
- Portfolio dashboard (basic version)
- Theme system (light/dark + presets)
- Responsive layout with sidebar

### Epic E2 - Already Implemented
- **Database schemas** - borrowers, lenders tables exist
- **Service layer** - BorrowerService, LenderService implemented
- **API routes** - Full CRUD endpoints for borrowers and lenders
- **Types** - TypeScript types defined

---

## What's In Progress 🚧

### Epic E2 - Current Work
- Frontend pages for borrowers and lenders
- Forms with validation
- Table views with TanStack Table
- Search and filter functionality

---

## What's Pending 📋

### Epic E2 - To Do
- [ ] Relationship linking (loan associations)
- [ ] Multi-select for loan assignments
- [ ] Search/filter enhancements
- [ ] Empty state designs
- [ ] Testing (unit + integration)
- [ ] Documentation updates

### Future Sprints
- Property management enhancements
- Document upload (S3 integration)
- Role-based access control (RBAC)
- Payment tracking
- Financial analytics
- Email notifications (Resend)

---

## Known Issues & Decisions

### Authentication
- **System:** Clerk (fully migrated November 2024)
- **Previous:** BetterAuth (deprecated - had login/FK violation issues)
- **Features:** 
  - Webhook sync (user.created, user.updated, user.deleted)
  - Defensive bootstrapping (auto-creates users in app_users)
  - Email verification flow
  - Organization setup
- **Status:** ✅ Production-ready, stable

### Database
- **Current Setup:** Neon Postgres serverless
- **ORM:** Drizzle (do not replace with Prisma)
- **Migrations:** Generated via `drizzle-kit generate`

### Multi-tenancy
- **Current:** Using `organizationId` for data scoping
- **Note:** Currently mapping to `userId` (will be proper org structure in future)

---

## File Organization

### Existing Structure
```
src/
├── app/(main)/dashboard/
│   ├── page.tsx                    # Portfolio dashboard
│   ├── borrowers/                  # ⚠️ Needs implementation
│   ├── lenders/                    # ⚠️ Needs implementation
│   ├── loans/                      # ✅ Complete
│   └── properties/                 # ✅ Complete
├── services/
│   ├── borrower.service.ts         # ✅ Complete
│   ├── lender.service.ts           # ✅ Complete
│   ├── loan.service.ts             # ✅ Complete
│   └── property.service.ts         # ✅ Complete
├── db/schema/
│   ├── borrowers.ts                # ✅ Complete
│   ├── lenders.ts                  # ✅ Complete
│   ├── loans.ts                    # ✅ Complete
│   └── properties.ts               # ✅ Complete
└── types/
    ├── borrower.ts                 # ✅ Complete
    ├── lender.ts                   # ✅ Complete
    ├── loan.ts                     # ✅ Complete
    └── property.ts                 # ✅ Complete
```

---

## Tech Stack Constraints

### Always Use
- Shadcn UI for all UI components (pre-approved)
- Tailwind CSS for styling
- React Hook Form + Zod for forms
- TanStack Query for data fetching
- Drizzle ORM for database

### Never Use (Without Approval)
- NextAuth, Clerk, Auth0
- Prisma, TypeORM
- Material UI, Bootstrap, Chakra
- Redux, MobX
- CSS-in-JS libraries

See `.cursor/rules/tech-stack-lock.md` for full details.

---

## Current API Endpoints

### Borrowers
- `GET /api/v1/borrowers` - List all
- `POST /api/v1/borrowers` - Create
- `GET /api/v1/borrowers/[id]` - Get one
- `PATCH /api/v1/borrowers/[id]` - Update
- `DELETE /api/v1/borrowers/[id]` - Delete
- `GET /api/v1/borrowers/[id]/loans` - Get related loans

### Lenders
- `GET /api/v1/lenders` - List all
- `POST /api/v1/lenders` - Create
- `GET /api/v1/lenders/[id]` - Get one
- `PATCH /api/v1/lenders/[id]` - Update
- `DELETE /api/v1/lenders/[id]` - Delete

### Loans
- `GET /api/v1/loans` - List all
- `POST /api/v1/loans` - Create
- `GET /api/v1/loans/[id]` - Get one
- `PATCH /api/v1/loans/[id]` - Update
- `DELETE /api/v1/loans/[id]` - Delete
- Plus: documents, notes, status endpoints

---

## Recent Changes

### 2025-10-25
- Created `/claude/` folder structure for Claude Code documentation
- Organized context files: README.md, QUICKSTART.md, PATTERNS.md, CONTEXT.md
- Established patterns for database schemas, services, API routes, and frontend

### Earlier
- Implemented borrower and lender backend (services + API routes)
- Created database schemas for borrowers and lenders
- Set up relationship tables for loan associations

---

## Next Steps

Based on Epic E2 plan, immediate next steps:

1. **Frontend Pages** - Create borrowers and lenders list views
   - Use TanStack Table
   - Include action buttons (Edit, Delete)
   - Add "New" button to open form modal

2. **Forms** - Build create/edit forms
   - Use React Hook Form + Zod
   - Modal-based (Dialog component)
   - Toast notifications on success/error

3. **Relationship Linking** - Enable loan associations
   - Multi-select component for loans
   - Update borrower/lender forms
   - Display loan count in tables

4. **Search & Filter** - Add table enhancements
   - Search by name/email
   - Filter by entity type
   - URL-based filter persistence

---

## Reference Documents

- **Full project setup:** `SETUP.md`
- **Tech stack rules:** `.cursor/rules/tech-stack-lock.md`
- **Agent rules:** `.cursor/rules/agent-rules.md`
- **Sprint checklist:** `.cursor/notes/project_checklist.md`
- **Code patterns:** `claude/PATTERNS.md`
- **Quick start:** `claude/QUICKSTART.md`

---

## Environment Setup

Required `.env.local` variables:
```bash
DATABASE_URL="postgresql://..."
SESSION_SECRET="..."
NODE_ENV="development"
```

Optional (for file uploads):
```bash
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET_NAME="..."
```

---

## Testing Status

**Unit Tests:** Not yet implemented (Sprint 6)
**Integration Tests:** Not yet implemented (Sprint 6)
**E2E Tests:** Not yet implemented (Sprint 6)

Planned tools: Vitest (unit), Playwright (E2E)

---

**Last Updated:** 2025-10-25
