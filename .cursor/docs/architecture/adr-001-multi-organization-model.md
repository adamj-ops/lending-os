# ADR-001: Multi-Organization Model

> **Note:** This ADR is part of the unified auth series. Future ADRs should continue numbering in `.cursor/docs/architecture/`.

## Status
Accepted

## Context

Lending OS needs to support multi-tenant architecture where users can belong to multiple lending organizations. This is essential for:

- **Consultants/Analysts**: May work with multiple lending companies
- **Investors**: May have investments across different lending organizations  
- **Service Providers**: May provide services to multiple lenders
- **Scalability**: Support growth from single-tenant to multi-tenant

The system previously used hardcoded `organizationId` values, which doesn't scale for users who need access to multiple organizations.

## Decision

Use BetterAuth's organization plugin with an "active organization" concept for multi-tenant support.

### Plugin Configuration

```typescript
// src/lib/auth.ts lines 18-22
plugins: [
  organization({
    allowUserToCreateOrganization: false, // Only admins can create orgs
    organizationLimit: 5, // Max organizations per user
  }),
],
```

### Active Organization Model

Each user session has one "active" organization that determines data scoping:

```typescript
interface SessionData {
  userId: string;
  email: string;
  name: string;
  organizationId: string | null; // Active organization
  activeOrganization?: {
    id: string;
    name: string;
    role: string; // Organization-level role from BetterAuth members table
  };
}
```

### Organization Switching Flow

1. User logs in
2. If user belongs to multiple organizations: show organization selection UI
3. User selects active organization
4. Session updated with active organization context
5. User redirected to appropriate portal based on access

### Why BetterAuth Organization Plugin

- **Built-in Management**: Handles organization creation, invitations, member management
- **Type Safety**: Full TypeScript inference for organization-related operations
- **Session Integration**: Automatically includes organization context in sessions
- **Invitation System**: Built-in email invitations for adding users to organizations
- **Database Tables**: Automatically creates `organizations`, `members`, `invitations` tables
- **Security**: Handles organization-scoped access control

### Organization Creation Restrictions

- `allowUserToCreateOrganization: false` - Only system admins can create organizations
- Prevents unauthorized organization creation
- Maintains control over organization onboarding process

### Organization Limit

- `organizationLimit: 5` - Maximum 5 organizations per user
- Prevents abuse and maintains performance
- Reasonable limit for typical use cases

## Consequences

### Positive

- **Built-in Organization Management**: No need to build custom organization CRUD
- **Automatic Session Context**: Organization data automatically available in sessions
- **Type Safety**: Full TypeScript support for organization operations
- **Invitation System**: Built-in email invitations for adding users
- **Scalable Architecture**: Supports unlimited organizations and users
- **Security**: Organization-scoped access control built-in
- **Database Consistency**: BetterAuth handles table relationships and constraints

### Negative

- **BetterAuth Dependency**: Relies on BetterAuth plugin updates and maintenance
- **Migration Required**: Existing hardcoded `organizationId` patterns need updating
- **Additional Tables**: BetterAuth creates `organizations`, `members`, `invitations` tables
- **Learning Curve**: Developers need to understand BetterAuth organization concepts
- **Plugin Limitations**: Bound by BetterAuth's organization model decisions

### Implementation Notes

#### Migration Path

1. **Update Services**: All services must use `session.organizationId` instead of hardcoded values
   ```typescript
   // ❌ Old pattern
   const loans = await getLoansForOrganization("hardcoded-org-id");
   
   // ✅ New pattern  
   const { organizationId } = await requireOrganization();
   const loans = await getLoansForOrganization(organizationId);
   ```

2. **Database Changes**: BetterAuth automatically creates required tables:
   - `organizations` - Organization records
   - `members` - User-organization relationships with roles
   - `invitations` - Pending organization invitations

3. **API Changes**: All routes must use `requireOrganization()`:
   ```typescript
   // All API routes need organization context
   const { organizationId } = await requireOrganization();
   ```

4. **Frontend Changes**: Components must handle organization switching:
   ```typescript
   // Organization switcher component needed
   <OrganizationSwitcher organizations={user.organizations} />
   ```

#### Cascade Deletion Behavior

- **Organizations**: When deleted, all related data (loans, users, etc.) is cascade deleted
- **Users**: When deleted, all organization memberships are removed
- **Members**: When removed, user loses access to that organization

#### Organization Scoping

All data queries must be scoped to the active organization:

```typescript
// Example: Get loans for active organization
export async function getLoansForOrganization(organizationId: string) {
  return await db.query.loans.findMany({
    where: eq(loans.organizationId, organizationId)
  });
}
```

#### Session Management

The active organization is stored in the session and automatically included in all auth helpers:

```typescript
// Session automatically includes organization context
const session = await getSession();
if (session?.organizationId) {
  // User has active organization
  const data = await getDataForOrganization(session.organizationId);
}
```

## Related ADRs

- [ADR-002: Session Management](./adr-002-session-management.md) - How organization context is included in sessions
- [ADR-003: Portal Access Model](./adr-003-portal-access-model.md) - How portals work with organizations
- [ADR-005: Migration Strategy](./adr-005-auth-migration-strategy.md) - Migration from hardcoded organizationId

## References

- [BetterAuth Organization Plugin Documentation](https://www.better-auth.com/plugins/organization)
- [src/lib/auth.ts](../src/lib/auth.ts) - Organization plugin configuration
- [src/lib/auth-server.ts](../src/lib/auth-server.ts) - Session helpers with organization context
- [src/db/schema/portal-roles.ts](../src/db/schema/portal-roles.ts) - Portal access table design
