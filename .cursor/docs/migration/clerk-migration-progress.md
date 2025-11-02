# Clerk Migration Progress

This document tracks the progress of the Better Auth → Clerk migration.

## Completed Phases

### Phase 0: Pre-Migration Setup ✅
- [x] Architecture documentation (ADR-003-clerk-migration.md)
- [x] Type contracts (clerk-server-types.ts)
- [x] Interim shim (clerk-server-stub.ts)
- [x] Audit checklist created

### Phase 1: Clerk Setup ✅
- [x] Installed @clerk/nextjs package
- [x] Created Clerk configuration file
- [x] Added ClerkProvider to layout
- [x] Updated environment documentation

### Phase 2: Server Utilities ✅
- [x] Created clerk-server.ts with full implementation
- [x] Implemented getSession() and getSessionFromHeaders()
- [x] Implemented requireAuth(), requireOrganization(), requirePortalAccess()
- [x] Implemented getUserPortalAccess() with caching

### Phase 3: API Routes ✅
- [x] Updated /api/auth/me route
- [x] Updated /api/auth/portal-access route
- [x] Batch updated all 70+ API routes to use clerk-server
- [x] Deleted Better Auth catch-all route

### Phase 4: Middleware ✅
- [x] Updated middleware to use clerkMiddleware
- [x] Replaced session checking with Clerk auth()
- [x] Preserved portal access logic

### Phase 5: Auth Components ✅
- [x] Updated login-form.tsx to use Clerk useSignIn
- [x] Updated register-form.tsx to use Clerk useSignUp
- [x] Updated organization-setup-form.tsx to use Clerk
- [x] Updated nav-user.tsx to use Clerk signOut

### Phase 6: Providers and Hooks ✅
- [x] Updated AuthProvider to use Clerk useUser()
- [x] Updated usePortalAccess hook to use Clerk useUser()

## Remaining Tasks

### Phase 7: Database Schema Cleanup
- [ ] Update portal-roles.ts comments (partially done)
- [ ] Mark Better Auth tables as deprecated in schema
- [ ] Create migration script (if migrating users) OR drop script (if starting fresh)

### Phase 8: Scripts Cleanup
- [ ] DELETE scripts/create-betterauth-org.ts
- [ ] DELETE scripts/setup-dev-org.ts
- [ ] DELETE src/scripts/check-better-auth-org-tables.ts
- [ ] Update scripts/create-dev-user.ts for Clerk
- [ ] Update scripts/assign-portal-access.ts
- [ ] Update scripts/complete-dev-setup.ts
- [ ] Update scripts/reset-dev-login.ts
- [ ] Create src/lib/clerk-script-auth.ts helper

### Phase 9: Documentation Cleanup
- [ ] Update all documentation files
- [ ] Remove Better Auth references from claude/ folder

### Phase 11: Final Cleanup
- [x] Removed better-auth from package.json
- [ ] Removed bcryptjs (if only used for Better Auth - need to verify)
- [ ] Search and remove all Better Auth code references
- [ ] Remove Better Auth environment variables from docs
- [ ] Update .env.example
- [ ] Remove Better Auth files: auth.ts, auth-client.ts, auth-server.ts

## Files Still Containing Better Auth References

1. `src/lib/auth.ts` - Better Auth configuration (to be deleted)
2. `src/lib/auth-client.ts` - Better Auth client (to be deleted)
3. `src/lib/auth-server.ts` - Better Auth server (to be deleted)
4. `src/app/api/admin/setup-dev/route.ts` - Uses Better Auth (needs update)
5. `src/db/schema/auth.ts` - Better Auth tables (mark deprecated)
6. `src/db/seed.ts` - May reference Better Auth
7. Various scripts - Need cleanup

## Notes

- All API routes have been migrated to use clerk-server
- All frontend components have been migrated to use Clerk hooks
- Middleware has been updated to use Clerk
- Organization creation now uses custom organizations table instead of Better Auth plugin

