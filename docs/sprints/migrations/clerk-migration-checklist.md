# Clerk Migration Checklist

This checklist tracks all files that need to be updated during the Better Auth → Clerk migration.

## Phase 0: Pre-Migration ✅

- [x] Architecture documentation (ADR-003-clerk-migration.md)
- [x] Type contracts (clerk-server-types.ts)
- [x] Interim shim (clerk-server-stub.ts)
- [x] Audit checklist (this file)

## Phase 1: Clerk Setup

- [ ] Install @clerk/nextjs package
- [ ] Create src/lib/clerk.ts configuration
- [ ] Add ClerkProvider to src/app/layout.tsx
- [ ] Update SETUP.md with Clerk env vars
- [ ] Update .cursor/docs/technical/environment-setup.md
- [ ] Create .env.example with Clerk variables

## Phase 2: Server Utilities

- [ ] Create src/lib/clerk-server.ts with full implementation
- [ ] Implement getSession()
- [ ] Implement getSessionFromHeaders()
- [ ] Implement requireAuth()
- [ ] Implement requireOrganization()
- [ ] Implement requirePortalAccess()
- [ ] Implement getUserPortalAccess()
- [ ] Update portalAccessCache to use Clerk user IDs

## Phase 3: API Routes (77 files found)

### Critical Auth Routes (Update First)
- [ ] src/app/api/auth/me/route.ts
- [ ] src/app/api/auth/portal-access/route.ts
- [ ] src/app/api/auth/setup-organization/route.ts
- [ ] src/app/api/admin/assign-portal-access/route.ts

### V1 API Routes (70+ files)
- [ ] src/app/api/v1/events/recent/route.ts
- [ ] src/app/api/v1/alerts/[alertId]/read/route.ts
- [ ] src/app/api/v1/payments/analytics/route.ts
- [ ] src/app/api/v1/funds/analytics/route.ts
- [ ] src/app/api/v1/alerts/route.ts
- [ ] src/app/api/v1/properties/route.ts
- [ ] src/app/api/v1/inspections/analytics/route.ts
- [ ] src/app/api/v1/loans/analytics/route.ts
- [ ] src/app/api/v1/analytics/snapshots/[date]/route.ts
- [ ] src/app/api/v1/events/stream/route.ts
- [ ] src/app/api/v1/analytics/forecast/route.ts
- [ ] src/app/api/v1/funds/analytics/portfolio/route.ts
- [ ] src/app/api/v1/funds/[fundId]/analytics/route.ts
- [ ] src/app/api/v1/funds/[fundId]/distributions/route.ts
- [ ] src/app/api/v1/funds/[fundId]/route.ts
- [ ] src/app/api/v1/funds/[fundId]/allocations/route.ts
- [ ] src/app/api/v1/funds/[fundId]/commitments/route.ts
- [ ] src/app/api/v1/funds/[fundId]/close/route.ts
- [ ] src/app/api/v1/funds/[fundId]/calls/route.ts
- [ ] src/app/api/v1/funds/route.ts
- [ ] src/app/api/v1/borrowers/[id]/route.ts
- [ ] src/app/api/v1/borrowers/[id]/loans/route.ts
- [ ] src/app/api/v1/borrowers/route.ts
- [ ] src/app/api/v1/ai/document-process/route.ts
- [ ] src/app/api/v1/ai/chat/route.ts
- [ ] src/app/api/v1/ai/forecast/route.ts
- [ ] src/app/api/v1/allocations/[id]/return/route.ts
- [ ] src/app/api/v1/properties/[id]/route.ts
- [ ] src/app/api/v1/inspections/[inspectionId]/route.ts
- [ ] src/app/api/v1/inspections/[inspectionId]/complete/route.ts
- [ ] src/app/api/v1/uploads/sign/route.ts
- [ ] src/app/api/v1/lenders/[id]/route.ts
- [ ] src/app/api/v1/lenders/[id]/loans/route.ts
- [ ] src/app/api/v1/lenders/route.ts
- [ ] src/app/api/v1/commitments/[id]/cancel/route.ts
- [ ] src/app/api/v1/draws/[drawId]/route.ts
- [ ] src/app/api/v1/draws/[drawId]/inspections/route.ts
- [ ] src/app/api/v1/draws/[drawId]/status/route.ts
- [ ] src/app/api/v1/payments/[paymentId]/route.ts
- [ ] src/app/api/v1/loans/[id]/borrowers/route.ts
- [ ] src/app/api/v1/loans/[id]/documents/route.ts
- [ ] src/app/api/v1/loans/[id]/documents/[docId]/route.ts
- [ ] src/app/api/v1/loans/[id]/parties/route.ts
- [ ] src/app/api/v1/loans/[id]/payment-schedule/route.ts
- [ ] src/app/api/v1/loans/[id]/route.ts
- [ ] src/app/api/v1/loans/[id]/notes/route.ts
- [ ] src/app/api/v1/loans/[id]/notes/[noteId]/route.ts
- [ ] src/app/api/v1/loans/[id]/status/route.ts
- [ ] src/app/api/v1/loans/[id]/lenders/route.ts
- [ ] src/app/api/v1/loans/[id]/draws/route.ts
- [ ] src/app/api/v1/loans/[id]/payments/route.ts
- [ ] src/app/api/v1/loans/route.ts
- [ ] src/app/api/v1/loans/v2/route.ts
- [ ] src/app/api/v1/loans/wizard/route.ts

### V2 API Routes
- [ ] src/app/api/v2/loans/[id]/draws/route.ts
- [ ] src/app/api/v2/loans/[id]/route.ts
- [ ] src/app/api/v2/loans/[id]/payments/route.ts
- [ ] src/app/api/v2/loans/route.ts

### Delete Better Auth Route
- [ ] DELETE src/app/api/auth/[...all]/route.ts

### Test Files (Update imports/mocks)
- [ ] src/app/api/v1/funds/[fundId]/analytics/__tests__/route.test.ts
- [ ] src/app/api/v1/funds/analytics/portfolio/__tests__/route.test.ts
- [ ] src/app/api/v1/inspections/analytics/__tests__/route.test.ts
- [ ] src/app/api/v1/payments/analytics/__tests__/route.test.ts
- [ ] src/app/api/v1/analytics/forecast/__tests__/route.test.ts
- [ ] src/app/api/v1/funds/analytics/__tests__/route.test.ts
- [ ] src/app/api/v1/funds/[fundId]/distributions/__tests__/route.test.ts
- [ ] src/app/api/v1/loans/analytics/__tests__/route.test.ts

## Phase 4: Middleware

- [ ] Update src/middleware.ts to use clerkMiddleware
- [ ] Replace getSessionFromHeaders with Clerk auth()
- [ ] Update organization context resolution
- [ ] Test Next.js matcher configuration
- [ ] Verify ISR/SSG compatibility

## Phase 5: Auth Components

- [ ] src/app/(main)/(public)/auth/_components/login-form.tsx
- [ ] src/app/(main)/(public)/auth/_components/register-form.tsx
- [ ] src/app/(main)/(public)/auth/_components/organization-setup-form.tsx
- [ ] src/app/(main)/(ops)/dashboard/_components/sidebar/nav-user.tsx

## Phase 6: Providers and Hooks

- [ ] src/providers/auth-provider.tsx - Update to use Clerk useUser()
- [ ] src/hooks/usePortalAccess.ts - Replace useSession with Clerk useUser()
- [ ] Components using useAuth() hook (audit needed)
- [ ] Components using useSession() from auth-client (audit needed)

### Frontend Auth Consumers Audit
- [ ] Search for components using `useAuth()`
- [ ] Search for components using `useSession()`
- [ ] Search for components reading `session.userId`
- [ ] Search for components reading `session.organizationId`

## Phase 7: Database Schema

- [ ] Update src/db/schema/portal-roles.ts - Update userId foreign key reference
- [ ] Update src/db/schema/auth.ts - Mark Better Auth tables as deprecated/remove
- [ ] Create migration to drop Better Auth tables (if starting fresh)
- [ ] OR create migration script to migrate users (if migrating existing data)
- [ ] Update all schema files referencing user.id to use text type

## Phase 8: Scripts

### Delete
- [ ] DELETE scripts/create-betterauth-org.ts
- [ ] DELETE scripts/setup-dev-org.ts
- [ ] DELETE src/scripts/check-better-auth-org-tables.ts

### Rewrite
- [ ] scripts/create-dev-user.ts - Use Clerk Backend SDK
- [ ] scripts/assign-portal-access.ts - Use Clerk user IDs
- [ ] scripts/complete-dev-setup.ts - Rewrite for Clerk
- [ ] scripts/reset-dev-login.ts - Use Clerk API
- [ ] Create src/lib/clerk-script-auth.ts helper

## Phase 9: Documentation

- [ ] SETUP.md - Remove Better Auth, add Clerk
- [ ] README.md - Update auth references
- [ ] .cursor/docs/technical/auth-flow.md - Rewrite for Clerk
- [ ] .cursor/docs/technical/environment-setup.md - Update env vars
- [ ] .cursor/docs/technical/session-helpers.md - Update for Clerk
- [ ] docs/vercel-deployment-guide.md - Update deployment vars
- [ ] .cursor/docs/architecture/adr-002-session-management.md - Mark deprecated
- [ ] Create .cursor/docs/technical/clerk-setup.md
- [ ] Create .cursor/docs/operations/clerk-dashboard.md
- [ ] Create .cursor/docs/operations/clerk-webhooks.md
- [ ] Update all files in claude/ folder referencing Better Auth

## Phase 10: Testing

### Unit Tests
- [ ] Update auth-related unit tests
- [ ] Mock Clerk instead of Better Auth
- [ ] Test clerk-server.ts utilities
- [ ] Test middleware logic
- [ ] Test portal access functions

### Integration Tests
- [ ] Test login flow end-to-end
- [ ] Test registration flow
- [ ] Test organization creation
- [ ] Test portal access enforcement
- [ ] Test API route authentication

### E2E Tests
- [ ] Update Playwright tests
- [ ] Test Register → Create Org → Access Portal
- [ ] Test Login → Switch Organization flow
- [ ] Test API route access with different roles

### Regression Tests
- [ ] All protected routes work
- [ ] Analytics pages work (useAnalyticsEventListener)
- [ ] Data queries scoped to organization
- [ ] Portal access controls work

## Phase 11: Final Cleanup

- [ ] Search codebase for "better-auth"
- [ ] Search codebase for "betterAuth"
- [ ] Search codebase for "BETTER_AUTH"
- [ ] Search codebase for "from.*auth-server"
- [ ] Search codebase for "from.*auth-client"
- [ ] Remove better-auth from package.json
- [ ] Remove bcryptjs if only used for Better Auth
- [ ] Remove BETTER_AUTH_SECRET from env files
- [ ] Remove BETTER_AUTH_URL from env files
- [ ] Update .env.example
- [ ] Update Vercel environment variables
- [ ] Final verification: Login flow works
- [ ] Final verification: Registration flow works
- [ ] Final verification: Organization/portal access works
- [ ] Final verification: Protected routes secured
- [ ] Final verification: API routes authenticate correctly

## Notes

- Total API routes to update: ~77 files
- Total components to update: ~6 files
- Total hooks to update: ~2 files
- Total scripts to update/delete: ~7 files
- Estimated migration time: Multi-day effort

