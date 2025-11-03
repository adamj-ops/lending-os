# ADR-002: Session Management

> **Note:** This ADR is part of the unified auth series. Future ADRs should continue numbering in `.cursor/docs/architecture/`.

## Status
**DEPRECATED** - Superseded by ADR-003 (Clerk Migration)

This ADR describes the Better Auth session management system which has been replaced with Clerk authentication. See [ADR-003: Clerk Migration](./adr-003-clerk-migration.md) for the current authentication architecture.

## Context

Lending OS needs a robust session management system that:

- **Supports Multi-Organization**: Sessions must include organization context for data scoping
- **Handles Portal Access**: Sessions need to include portal access information
- **Maintains Security**: Sessions must be secure and resistant to attacks
- **Provides Performance**: Session validation should be fast and efficient
- **Supports Scalability**: Must work across multiple server instances

The system needs to decide between server-side session storage vs client-side JWT tokens, and how to handle session validation and refresh.

## Decision

Use JWT cookie-based sessions with BetterAuth's built-in session management, including organization context and automatic refresh.

### Session Configuration

```typescript
// src/lib/auth.ts lines 24-27
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  updateAge: 60 * 60 * 24, // Update session every 24 hours
},
```

### Session Structure

```typescript
// src/lib/auth-server.ts lines 13-28
export interface SessionData {
  userId: string;
  email: string;
  name: string;
  organizationId: string | null; // Active organization
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

### Session Validation Approach

**Middleware + API Helpers Pattern:**

1. **Middleware** (`src/middleware.ts`): Handles route protection and redirects
2. **API Helpers** (`src/lib/auth-server.ts`): Provide typed session access for server components and API routes

### Cookie Configuration

- **Cookie Name**: `better-auth.session_token`
- **Storage**: JWT in HTTP-only cookie (not accessible via JavaScript)
- **Security**: HTTP-only, secure, same-site protection
- **Expiry**: 7 days with 1-day refresh cycle

### Why JWT Cookie-Based Sessions

- **Stateless**: No server-side session storage required
- **Scalable**: Works across multiple server instances
- **Secure**: HTTP-only cookies prevent XSS attacks
- **Performance**: No database lookups for session validation
- **BetterAuth Integration**: Built-in JWT handling and validation

### Why BetterAuth Session Management

- **Built-in Security**: Handles JWT signing, validation, and refresh
- **Type Safety**: Full TypeScript inference for session data
- **Organization Integration**: Automatically includes organization context
- **Cookie Management**: Handles secure cookie setting and clearing
- **Session Refresh**: Automatic token rotation and refresh

### Middleware Redirect Behavior

The middleware issues redirects for unauthenticated users:

```typescript
// src/lib/auth-server.ts line 76
export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  
  if (!session) {
    redirect("/auth/v2/login"); // Redirects unauthenticated users
  }
  
  return session;
}
```

**Redirect Logic:**
- **Unauthenticated + Protected Route**: Redirect to `/auth/v2/login`
- **Authenticated + Auth Page**: Redirect to appropriate portal
- **Authenticated + Portal Route**: Check portal access, redirect if denied

## Consequences

### Positive

- **Stateless Architecture**: No server-side session storage needed
- **High Performance**: JWT validation is fast and doesn't require database lookups
- **Scalable**: Works across multiple server instances without shared state
- **Secure**: HTTP-only cookies prevent XSS attacks
- **Type Safe**: Full TypeScript support for session data
- **Automatic Refresh**: Sessions refresh automatically after 1 day of activity
- **Organization Context**: Sessions automatically include active organization
- **Built-in Security**: BetterAuth handles JWT signing and validation

### Negative

- **JWT Size**: Sessions include organization and portal data, increasing JWT size
- **Token Revocation**: Cannot immediately revoke sessions (must wait for expiry)
- **BetterAuth Dependency**: Relies on BetterAuth's JWT implementation
- **Cookie Size Limits**: Large sessions may hit browser cookie size limits
- **Client-Side Access**: Session data not easily accessible from client-side JavaScript

### Implementation Notes

#### Session Retrieval

```typescript
// src/lib/auth-server.ts lines 35-66
export async function getSession(): Promise<SessionData | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session || !session?.user) {
      return null;
    }

    // BetterAuth organization plugin provides activeOrganization automatically
    const activeOrg = (session.user as any).activeOrganization;

    return {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      organizationId: activeOrg?.id || null,
      activeOrganization: activeOrg
        ? {
            id: activeOrg.id,
            name: activeOrg.name,
            role: activeOrg.role, // From BetterAuth member table
          }
        : undefined,
      // Portal access will be loaded separately when needed
    };
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}
```

#### Session Refresh Mechanism

- **Update Age**: Sessions refresh after 1 day of activity
- **Automatic**: BetterAuth handles refresh automatically
- **Transparent**: Users don't need to re-login
- **Security**: New tokens are issued on refresh

#### Middleware Integration

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession();
  
  // Handle redirects based on authentication status
  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/auth/v2/login", request.url));
  }
  
  if (session && isAuthRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}
```

#### API Route Protection

```typescript
// Example API route with session validation
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    // Session is guaranteed to be valid
    const data = await getDataForUser(session.userId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

#### Organization Context

Sessions automatically include organization context from BetterAuth:

```typescript
// Organization context is automatically available
const session = await getSession();
if (session?.organizationId) {
  // User has active organization
  const orgData = await getDataForOrganization(session.organizationId);
}
```

#### Portal Access Loading

Portal access is loaded separately when needed to avoid bloating the JWT:

```typescript
// Portal access loaded on demand
const portalAccess = await getUserPortalAccess(session.userId, session.organizationId);
```

## Related ADRs

- [ADR-001: Multi-Organization Model](./adr-001-multi-organization-model.md) - How organization context is included in sessions
- [ADR-003: Portal Access Model](./adr-003-portal-access-model.md) - How portal access is validated
- [ADR-005: Migration Strategy](./adr-005-auth-migration-strategy.md) - Migration from old session patterns

## References

- [BetterAuth Session Documentation](https://www.better-auth.com/docs/session)
- [src/lib/auth.ts](../src/lib/auth.ts) - Session configuration
- [src/lib/auth-server.ts](../src/lib/auth-server.ts) - Session helpers and validation
- [src/middleware.ts](../src/middleware.ts) - Route protection and redirects
