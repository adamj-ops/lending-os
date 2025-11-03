# Authentication Flow Documentation - Clerk

## Overview

Lending OS uses **Clerk** for authentication with a custom organization and portal-based access control system. The system provides unified authentication that enables users to belong to multiple organizations while accessing different portals (ops, investor, borrower) with role-based permissions.

## Architecture

### Components

1. **Clerk Authentication** (`@clerk/nextjs`)
   - User registration and login
   - Session management (handled by Clerk)
   - Password reset and account management

2. **Custom Organization System**
   - `organizations` table - Custom organization definitions
   - Portal access via `user_portal_access` table
   - Organization context resolved via server utilities

3. **Server Utilities** (`src/lib/clerk-server.ts`)
   - `getSession()` - Get current session with organization context
   - `requireAuth()` - Enforce authentication
   - `requireOrganization()` - Require organization context
   - `requirePortalAccess()` - Require specific portal access
   - `getUserPortalAccess()` - Get user's portal roles

4. **Middleware** (`src/middleware.ts`)
   - Route protection using `clerkMiddleware()`
   - Portal-based redirect logic
   - Organization context handling

5. **Portal Access System** (`src/db/schema/portal-roles.ts`)
   - Portal type definitions (ops, investor, borrower)
   - User portal access table
   - Role-based access control per portal

---

## Multi-Organization Support

### Organization Model

Users can belong to multiple organizations through the `user_portal_access` table:

- Each row links a Clerk user ID to an organization
- Users can have different roles in different portals
- Active organization determined by first portal access (future: org switcher)

### Active Organization Concept

Each session has one "active" organization that determines data scoping:

```typescript
// From clerk-server.ts - getOrganizationContext()
const access = await db.query.userPortalAccess.findMany({
  where: and(
    eq(userPortalAccess.userId, userId),
    eq(userPortalAccess.isActive, true)
  ),
});

// Uses first organization found (TODO: implement org switcher)
const firstOrgId = access[0].organizationId;
```

## Authentication Flow

### Registration

1. User submits registration form (`register-form.tsx`)
2. Clerk `useSignUp()` hook creates user account
3. On success, redirect to organization setup
4. Organization setup creates org and assigns portal access

### Login

1. User submits login form (`login-form.tsx`)
2. Clerk `useSignIn()` hook authenticates user
3. On success, `setActive()` establishes session
4. Middleware checks authentication and portal access
5. User redirected to appropriate portal route

### API Request Flow

1. **Clerk Middleware** (`clerkMiddleware`)
   - Validates Clerk session
   - Extracts `userId` from session

2. **Server Helper** (`clerk-server.ts`)
   - Gets Clerk user via `auth()` and `currentUser()`
   - Queries `user_portal_access` table for organization
   - Returns `ClerkSessionData` with organization context

3. **API Route**
   - Calls `requireOrganization()` to get org context
   - Uses `organizationId` to scope data queries

4. **Service Layer**
   - Receives `organizationId` as parameter
   - Queries database scoped to organization

## Session Data Structure

```typescript
export interface ClerkSessionData {
  userId: string;              // Clerk user ID
  email: string;               // From Clerk user
  name: string;                // From Clerk user
  organizationId: string | null; // From user_portal_access
  activeOrganization?: {       // Organization context
    id: string;
    name: string;
    role: string;              // Role from user_portal_access
  };
  portalAccess?: Array<{       // Portal access for user
    portalType: PortalType;
    organizationId: string;
    role: string;
  }>;
}
```

## Database Schema

### Auth Tables (Deprecated)

- `user` - Deprecated (kept for FK compatibility)
- `session` - Deprecated (Clerk manages)
- `account` - Deprecated (Clerk manages)
- `verification` - Deprecated (Clerk manages)

### Custom Tables (Active)

#### organizations
```typescript
{
  id: UUID (PK)
  name: TEXT
  logoUrl: TEXT (nullable)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### user_portal_access
```typescript
{
  id: UUID (PK)
  userId: TEXT (Clerk user ID)
  organizationId: TEXT (references organizations.id)
  portalType: ENUM("ops", "investor", "borrower")
  role: TEXT (default "member")
  isActive: BOOLEAN (default true)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

## Security Features

### Authentication Security
- ✅ Clerk handles password hashing and storage
- ✅ Sessions managed by Clerk (secure, HTTP-only cookies)
- ✅ Built-in CSRF protection
- ✅ Multi-factor authentication support (if enabled)

### Organization Isolation
- ✅ All data queries scoped to active organization
- ✅ Portal access checked per organization
- ✅ Role hierarchy enforced at API level

## Environment Variables

Required configuration in `.env.local`:

```bash
# Clerk Authentication
CLERK_SECRET_KEY="sk_test_..." # Get from Clerk Dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..." # Get from Clerk Dashboard
```

## References

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Integration](https://clerk.com/docs/nextjs/overview)
- [Setup Guide](./clerk-setup.md)
- [Migration ADR](../architecture/adr-003-clerk-migration.md)

