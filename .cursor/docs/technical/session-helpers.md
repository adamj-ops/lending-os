# Session Helper Usage Guide

## Overview

This guide documents the proper usage of session helpers in Lending OS. All session helpers are located in `src/lib/clerk-server.ts` and use Clerk authentication with custom organization support.

## Available Helpers

### `getSession()`

**Returns**: `Promise<ClerkSessionData | null>`

**Use Case**: When you need session data but the absence of a session is not an error.

**When to Use**:
- Optional authentication checks
- Displaying user info that may not be available
- Conditional rendering based on auth state

**Example**:
```typescript
const session = await getSession();
if (session) {
  // User is authenticated
  return <UserProfile user={session} />;
}
return <LoginPrompt />;
```

**Implementation**: Uses Clerk's `auth()` and `currentUser()` to get user data, then queries portal access for organization context.

### `requireAuth()`

**Returns**: `Promise<ClerkSessionData>`

**Use Case**: When you need an authenticated session and want to redirect to login if not authenticated.

**When to Use**:
- Protected routes that require authentication
- API endpoints that need user context
- Server components that display user-specific data

**Example**:
```typescript
const session = await requireAuth();
// Session is guaranteed to exist here
return <Dashboard user={session} />;
```

**Error Handling**: Automatically redirects to `/auth/v2/login` if not authenticated.

### `requireOrganization()`

**Returns**: `Promise<ClerkSessionData & { organizationId: string }>`

**Use Case**: When you need organization-scoped data and the user must be in an organization.

**When to Use**:
- API routes that query organization-scoped data
- Services that need organization context
- Components that display organization-specific content

**Example**:
```typescript
const { organizationId } = await requireOrganization();
const loans = await LoanService.getLoansByOrganization(organizationId);
```

**Error Handling**: Throws error if user not assigned to any organization.

### `requirePortalAccess(portalType, minRole?)`

**Returns**: `Promise<ClerkSessionData>`

**Use Case**: When you need to verify user has access to a specific portal.

**Parameters**:
- `portalType`: `"ops" | "investor" | "borrower"`
- `minRole?`: Optional minimum role (e.g., `"admin"`, `"manager"`)

**When to Use**:
- Portal-specific routes
- Components that require portal access
- API endpoints for portal-specific features

**Example**:
```typescript
// Require ops portal access
const session = await requirePortalAccess("ops");

// Require investor portal with manager+ role
const session = await requirePortalAccess("investor", "manager");
```

**Error Handling**: Throws error if user doesn't have required portal access.

### `getUserPortalAccess(userId, organizationId)`

**Returns**: `Promise<Array<{ portalType: PortalType; role: string }>>`

**Use Case**: When you need to check what portals a user can access (for UI rendering, portal switching, etc.).

**When to Use**:
- Portal switcher components
- Navigation menus showing available portals
- UI conditional rendering based on portal access

**Example**:
```typescript
const portalAccess = await getUserPortalAccess(userId, organizationId);
const hasOpsAccess = portalAccess.some(a => a.portalType === "ops");
```

## Migration from Deprecated Helpers

### ❌ Deprecated: `getSessionFromRequest()`

**Status**: Removed in Phase 1 of auth migration

**Replacement**: Use `getSession()` or `requireOrganization()` depending on your needs.

**Before**:
```typescript
const session = await getSessionFromRequest();
```

**After** (if you need organization):
```typescript
const session = await requireOrganization();
```

**After** (if session is optional):
```typescript
const session = await getSession();
if (!session) {
  // Handle unauthenticated state
}
```

## Common Patterns

### Pattern 1: Protected API Route

```typescript
import { requireOrganization } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const { organizationId } = await requireOrganization();
    const data = await getDataForOrganization(organizationId);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
```

### Pattern 2: Portal-Specific Route

```typescript
import { requirePortalAccess } from "@/lib/auth-server";

export default async function OpsDashboard() {
  const session = await requirePortalAccess("ops", "manager");
  
  return (
    <div>
      <h1>Operations Dashboard</h1>
      <p>Welcome, {session.name}</p>
    </div>
  );
}
```

### Pattern 3: Optional Session Check

```typescript
import { getSession } from "@/lib/auth-server";

export default async function PublicPage() {
  const session = await getSession();
  
  return (
    <div>
      {session ? (
        <UserMenu user={session} />
      ) : (
        <LoginButton />
      )}
    </div>
  );
}
```

## Session Data Structure

```typescript
interface SessionData {
  userId: string;
  email: string;
  name: string;
  organizationId: string | null;
  activeOrganization?: {
    id: string;
    name: string;
    role: string; // From BetterAuth member table
  };
  portalAccess?: Array<{
    portalType: PortalType;
    organizationId: string;
    role: string;
  }>;
}
```

## Performance Considerations

- `getSession()` and `requireAuth()` are fast (cached BetterAuth session)
- `requireOrganization()` is fast (uses cached session)
- `requirePortalAccess()` performs a database query (use caching in middleware)
- `getUserPortalAccess()` performs a database query (cached for 5 minutes)

## Best Practices

1. **Use the most specific helper**: If you need organization, use `requireOrganization()` not `requireAuth()`
2. **Handle errors gracefully**: Wrap calls in try-catch for API routes
3. **Avoid excessive portal access checks**: Cache results when possible
4. **Don't store session in state**: Always fetch fresh session data
5. **Use TypeScript types**: Import `SessionData` type for better type safety

## Related Documentation

- [Auth Flow Documentation](./auth-flow.md) - Complete authentication flow
- [ADR-002: Session Management](../architecture/adr-002-session-management.md) - Session architecture
- [ADR-005: Auth Migration Strategy](../architecture/adr-005-auth-migration-strategy.md) - Migration guide

