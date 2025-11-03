# ADR-003: Clerk Authentication Migration

> **Note:** This ADR supersedes ADR-002 (Session Management) for the migration from Better Auth to Clerk.

## Status
Accepted

## Context

Lending OS currently uses Better Auth for authentication with a custom organization plugin and portal-based access control system. Due to login issues preventing users from accessing the application, we need to migrate to Clerk authentication while maintaining:

- Multi-organization support
- Portal-based access control (ops, investor, borrower)
- Role-based permissions within portals
- Organization-scoped data queries
- Session management with organization context

The migration must be clean and complete, removing all Better Auth traces to prevent future integration issues.

## Decision

Migrate from Better Auth to Clerk authentication using **Option B: Custom Portal System**.

### Organization Model

We will maintain the existing custom portal access system (`user_portal_access` table) while using Clerk for authentication. This approach:

- **Preserves existing portal access logic** - No need to redesign the portal system
- **Minimizes disruption** - Portal access table and queries remain unchanged
- **Provides flexibility** - Custom roles and portal types continue to work
- **Uses Clerk for auth only** - Clerk handles user authentication, sessions, and user management
- **Links via user IDs** - Clerk user IDs replace Better Auth user IDs in `user_portal_access.userId`

### Data Model Mapping

**Better Auth → Clerk:**

| Better Auth | Clerk | Notes |
|-------------|-------|-------|
| `user.id` | `clerkUser.id` | Text IDs, direct mapping |
| `session` table | Clerk managed | No custom session table needed |
| `organization` table (BetterAuth) | Custom `organizations` table | Keep existing custom organizations |
| `member` table (BetterAuth) | `user_portal_access` table | Portal access replaces Better Auth membership |
| `account.password` | Clerk managed | Passwords stored by Clerk |

**Custom Tables (Preserved):**
- `organizations` - Custom organization definitions
- `user_portal_access` - Portal access with roles (userId → Clerk IDs)
- All domain tables (loans, borrowers, lenders, etc.) - No changes

### Session Data Structure

The `ClerkSessionData` interface maintains compatibility with existing code:

```typescript
export interface ClerkSessionData {
  userId: string;              // Clerk user ID
  email: string;              // From Clerk user
  name: string;               // From Clerk user
  organizationId: string | null; // From user_portal_access or custom organizations
  activeOrganization?: {       // Organization context
    id: string;
    name: string;
    role: string;             // Role from user_portal_access
  };
  portalAccess?: Array<{       // Portal access for user
    portalType: PortalType;
    organizationId: string;
    role: string;
  }>;
}
```

### Organization Context Resolution

1. **Get Clerk User**: Use Clerk's `auth()` helper to get authenticated user
2. **Query Portal Access**: Query `user_portal_access` table with Clerk `userId`
3. **Determine Active Org**: 
   - If user has single organization: Use that
   - If user has multiple: Use first or user preference (future: org switcher)
   - Store active org in Clerk user metadata or separate table (future)
4. **Cache Result**: Use existing `portalAccessCache` with 5-minute TTL

### Authentication Flow

**Login:**
1. User submits email/password to Clerk
2. Clerk authenticates and creates session
3. App queries `user_portal_access` with Clerk `userId`
4. App determines default organization and portal
5. App redirects to appropriate portal route

**API Request:**
1. Clerk middleware validates session
2. Server helper gets Clerk user via `auth()`
3. Server helper queries portal access for user
4. API route uses `requireOrganization()` to get org context
5. Service layer receives `organizationId` as parameter

**Protected Route Access:**
1. Clerk middleware checks authentication
2. Middleware queries portal access for user
3. Middleware checks if user has required portal type
4. Allow/redirect based on portal access

## Implementation Strategy

### Phase 0: Pre-Migration (Current)
- ✅ Document architecture decisions (this ADR)
- ✅ Define type contracts (`clerk-server-types.ts`)
- ✅ Create interim shim for incremental migration
- ✅ Audit all auth consumers

### Phase 1: Clerk Setup
- Install Clerk package
- Configure Clerk provider in layout
- Set up environment variables

### Phase 2: Server Utilities
- Create `clerk-server.ts` with same interface as `auth-server.ts`
- Implement organization context resolution
- Maintain portal access cache

### Phase 3-11: Incremental Migration
- Update API routes
- Update middleware
- Update components
- Clean up Better Auth

## Consequences

### Positive

- **Clean Migration**: Complete removal of Better Auth prevents future conflicts
- **Proven Auth Solution**: Clerk is widely used and well-supported
- **Better DX**: Clerk provides better developer experience and tooling
- **Maintained Logic**: Portal access system preserved, minimal business logic changes
- **Type Safety**: Explicit contracts prevent signature drift during migration

### Negative

- **Migration Effort**: Significant code changes across 70+ API routes
- **User Migration**: If migrating existing users, need data migration scripts
- **Learning Curve**: Team needs to learn Clerk APIs
- **Temporary Complexity**: Both auth systems present during migration period

### Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Breaking changes during migration | Incremental migration with interim shim |
| Lost user data | Migration script with rollback mapping |
| Type mismatches | Explicit type contracts defined upfront |
| Portal access logic breaks | Preserve existing portal queries, only change userId source |
| Middleware edge cases | Thorough testing, feature flag for rollback |

## Alternatives Considered

### Option A: Clerk Organizations
**Pros:**
- Less custom code
- Clerk manages org membership
- Built-in org switching

**Cons:**
- Requires redesigning portal access system
- Less control over org structure
- Migration complexity higher

**Decision:** Rejected - Current portal system is well-established and complex.

### Option C: Hybrid (Clerk Orgs + Custom Portal)
**Pros:**
- Uses Clerk for org management
- Keeps custom portal roles

**Cons:**
- More complex data model
- Two org systems to maintain
- Sync complexity between systems

**Decision:** Rejected - Adds unnecessary complexity.

## Related ADRs

- [ADR-002: Session Management](./adr-002-session-management.md) - **DEPRECATED** (Better Auth)
- [ADR-001: Multi-Organization Model](./adr-001-multi-organization-model.md) - Still relevant (custom organizations)
- [ADR-003: Portal Access Model](./adr-003-portal-access-model.md) - Still relevant (portal system preserved)
- [ADR-004: RBAC Implementation](./adr-004-role-based-access-control.md) - Still relevant (role system preserved)
- [ADR-005: Auth Migration Strategy](./adr-005-auth-migration-strategy.md) - Referenced for migration approach

## References

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Integration](https://clerk.com/docs/nextjs/overview)
- [Migration Plan](../remove-better-auth-and-integrate-clerk.plan.md)
- Current portal access schema: `src/db/schema/portal-roles.ts`
- Current auth server: `src/lib/auth-server.ts` (to be replaced)

