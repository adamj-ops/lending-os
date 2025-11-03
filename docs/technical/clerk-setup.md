# Clerk Setup Guide

This guide explains how Clerk authentication is configured in Lending OS.

## Overview

Lending OS uses Clerk for user authentication and session management. Clerk handles:
- User registration and login
- Session management
- Password reset and account management
- Multi-factor authentication (if enabled)

Our application adds:
- Custom organization management (via `organizations` table)
- Portal-based access control (via `user_portal_access` table)
- Role-based permissions within portals

## Configuration

### Environment Variables

Required environment variables:

```bash
# Clerk Authentication (Required)
CLERK_SECRET_KEY="sk_test_..." # Server-side secret key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..." # Client-side publishable key
```

### Getting Clerk API Keys

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Navigate to "API Keys" in the dashboard
4. Copy the "Secret Key" → Set as `CLERK_SECRET_KEY`
5. Copy the "Publishable Key" → Set as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

### Clerk Provider Setup

Clerk is initialized in `src/app/layout.tsx`:

```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      {/* ... */}
    </ClerkProvider>
  );
}
```

## Authentication Flow

### Login
1. User submits credentials to Clerk via `useSignIn()` hook
2. Clerk authenticates and creates session
3. App queries `user_portal_access` table with Clerk `userId`
4. App determines default organization and portal
5. App redirects to appropriate portal route

### API Authentication
1. Clerk middleware validates session
2. Server helper (`clerk-server.ts`) gets Clerk user via `auth()`
3. Server helper queries portal access for user
4. API route uses `requireOrganization()` to get org context
5. Service layer receives `organizationId` as parameter

## Server Utilities

### Location: `src/lib/clerk-server.ts`

Available functions:
- `getSession()` - Get current authenticated user with organization context
- `getSessionFromHeaders()` - Get session from request headers (for middleware)
- `requireAuth()` - Require authentication, redirect if not authenticated
- `requireOrganization()` - Require organization context
- `requirePortalAccess()` - Require specific portal access
- `getUserPortalAccess()` - Get user's portal access (with caching)

## Client Utilities

### Location: `src/providers/auth-provider.tsx`

The `AuthProvider` wraps Clerk's `useUser()` hook and adds organization/role data:

```tsx
const { user, isLoading, isAuthenticated } = useAuth();
```

### Clerk Hooks (Direct Access)

You can also use Clerk hooks directly:

```tsx
import { useUser, useSignIn, useSignUp, useClerk } from "@clerk/nextjs";

const { user } = useUser();
const { signOut } = useClerk();
```

## Organization Management

Organizations are stored in the custom `organizations` table (not Clerk Organizations).

### Creating Organizations

Organizations are created via `/api/auth/create-organization` endpoint:

```typescript
POST /api/auth/create-organization
Body: { name: "Organization Name" }
```

This creates:
1. Organization record in `organizations` table
2. Portal access entry in `user_portal_access` table (ops portal, admin role)

### Portal Access

Portal access is managed via the `user_portal_access` table:
- Links Clerk user IDs to organizations
- Defines portal type (ops, investor, borrower)
- Defines role (admin, manager, analyst, member)

## Migration from Better Auth

See [ADR-003: Clerk Migration](./../architecture/adr-003-clerk-migration.md) for migration details.

Key changes:
- User authentication: Better Auth → Clerk
- Organization management: Better Auth plugin → Custom system
- Portal access: Preserved (unchanged logic)

## Troubleshooting

### "User not authenticated" errors
- Check `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` are set
- Verify Clerk Dashboard shows the application is configured
- Check browser console for Clerk errors

### "User not in organization" errors
- User needs portal access assigned via `user_portal_access` table
- Check organization exists in `organizations` table

### Session issues
- Clerk manages sessions - no custom session table needed
- If issues persist, check Clerk Dashboard for session status

## References

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Integration](https://clerk.com/docs/nextjs/overview)
- [Migration ADR](./../architecture/adr-003-clerk-migration.md)

