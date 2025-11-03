# Authentication Flow Documentation

## Overview

Lending OS uses **BetterAuth** with organization plugin for unified authentication that supports multi-tenant organizations and portal-based access control. The system provides a single auth/session story that enables users to belong to multiple organizations while accessing different portals (ops, investor, borrower) with role-based permissions.

## Architecture

### Components

1. **BetterAuth Server** (`src/lib/auth.ts`)
   - Configured with Drizzle adapter
   - Email/password authentication provider
   - Organization plugin for multi-tenant support
   - Session management (7-day expiry)

2. **Client SDK** (`src/lib/auth-client.ts`)
   - React hooks for auth state
   - Sign in/up/out functions

3. **Server Utilities** (`src/lib/auth-server.ts`)
   - `getSession()` - Get current session with organization context
   - `requireAuth()` - Enforce authentication
   - `requireOrganization()` - Require organization context
   - `requirePortalAccess()` - Require specific portal access
   - `getUserPortalAccess()` - Get user's portal roles

4. **Middleware** (`src/middleware.ts`)
   - Route protection
   - Portal-based redirect logic
   - Organization context handling

5. **API Routes** (`src/app/api/auth/[...all]/route.ts`)
   - BetterAuth handler for all auth operations

6. **Portal Access System** (`src/db/schema/portal-roles.ts`)
   - Portal type definitions (ops, investor, borrower)
   - User portal access table
   - Role-based access control per portal

---

## Multi-Organization Support

### Organization Model

Users can belong to multiple organizations through BetterAuth's organization plugin:

```typescript
// src/lib/auth.ts - Organization plugin configuration
plugins: [
  organization({
    allowUserToCreateOrganization: false, // Only admins can create orgs
    organizationLimit: 5, // Max organizations per user
  }),
],
```

### Active Organization Concept

Each session has one "active" organization that determines data scoping:

```typescript
// Session includes active organization
interface SessionData {
  userId: string;
  email: string;
  name: string;
  organizationId: string | null; // Active organization
  activeOrganization?: {
    id: string;
    name: string;
    role: string; // Organization-level role
  };
}
```

### Organization Switching Flow

```
1. User logs in
   ↓
2. If user belongs to multiple organizations:
   - Show organization selection UI
   - User selects active organization
   ↓
3. Session updated with active organization
   ↓
4. User redirected to appropriate portal based on access
```

---

## Portal-Based Access Model

### Portal Types

The system supports three distinct portals:

- **ops**: Operations portal for admin/staff (full access to all features)
- **investor**: Investor/lender portal (view analytics, loans, distributions)
- **borrower**: Borrower portal (apply for loans, track applications)

### Portal Access Table

Portal access is managed through the `user_portal_access` table (`src/db/schema/portal-roles.ts`):

```typescript
export const userPortalAccess = pgTable("user_portal_access", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").notNull(),
  portalType: portalTypeEnum("portal_type").notNull(), // "ops" | "investor" | "borrower"
  role: text("role").notNull().default("member"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});
```

### Role Hierarchy

Each portal supports role-based access with the following hierarchy:

- **admin** (level 4): Full access, user management, org settings
- **manager** (level 3): Data management, user viewing, reports
- **analyst** (level 2): Read-only access, can view reports
- **member/viewer** (level 1): Limited read-only access

### Portal Access Helpers

```typescript
// Require specific portal access
export async function requirePortalAccess(
  portalType: PortalType,
  minRole?: string
): Promise<SessionData>

// Get user's portal access for UI/service layers
export async function getUserPortalAccess(
  userId: string,
  organizationId: string
): Promise<Array<{ portalType: PortalType; role: string }>>
```

---

## Authentication Flow

### Registration Flow

```
1. User fills out registration form
   ↓
2. Form submits to BetterAuth API (/api/auth/sign-up)
   ↓
3. BetterAuth:
   - Validates email uniqueness
   - Hashes password
   - Creates user record
   - Creates session
   - Sets session cookie
   ↓
4. User redirected to organization selection (if multiple orgs) or default portal
```

**Form Fields:**
- Name (required)
- Email (required, unique)
- Password (min 6 characters)
- Confirm Password (must match)

**Implementation:**
```typescript
const result = await signUp.email({
  name: data.name,
  email: data.email,
  password: data.password,
});
```

---

### Login Flow

```
1. User enters email and password
   ↓
2. Form submits to BetterAuth API (/api/auth/sign-in)
   ↓
3. BetterAuth:
   - Verifies email exists
   - Compares password hash
   - Creates new session
   - Sets session cookie
   ↓
4. System checks user's organizations:
   - If single org: Set as active, redirect to portal
   - If multiple orgs: Show organization selection
   ↓
5. User redirected to appropriate portal based on access
```

**Form Fields:**
- Email (required)
- Password (required)
- Remember me (optional, extends session)

**Implementation:**
```typescript
const result = await signIn.email({
  email: data.email,
  password: data.password,
});
```

---

### Portal Selection Flow

```
1. User selects organization (if multiple)
   ↓
2. System loads user's portal access for that organization
   ↓
3. Portal routing logic:
   - If user has ops access: Default to /ops/dashboard
   - If user has investor access: Default to /investor/dashboard
   - If user has borrower access: Default to /borrower/dashboard
   - If multiple portals: Show portal selection UI
   ↓
4. User redirected to selected portal
```

---

## Session Management

### Session Configuration

- **Expiry**: 7 days
- **Update Age**: 1 day (session refreshes after 1 day of activity)
- **Cookie Cache**: 5 minutes
- **Storage**: JWT in HTTP-only cookie

**Cookie Name:**
```
better-auth.session_token
```

### Session Structure

```typescript
interface SessionData {
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

### Session Validation

```typescript
// Server-side
const session = await getSession();
if (!session) {
  // User not authenticated
}

// Client-side
const { data: session } = useSession();
```

### Legacy Helpers / Deprecated APIs

⚠️ **Deprecated**: `getSessionFromRequest()` is deprecated and will be removed in Phase 2+. Use `getSession()` or `requireOrganization()` instead.

```typescript
// ❌ Deprecated
const session = await getSessionFromRequest();

// ✅ Use instead
const session = await getSession();
// or
const session = await requireOrganization();
```

---

## Logout Flow

```
1. User clicks logout
   ↓
2. Client calls signOut()
   ↓
3. BetterAuth:
   - Deletes session from database
   - Clears session cookie
   ↓
4. User redirected to /auth/v2/login
```

**Implementation:**
```typescript
await signOut();
router.push("/auth/v2/login");
```

---

## Route Protection

### Middleware Protection

The middleware (`src/middleware.ts`) automatically handles route protection:

```typescript
// Protected routes: /dashboard/*, /ops/*, /investor/*, /borrower/*
// Auth routes: /auth/*
// Public routes: / (landing page)
```

**Logic:**
1. Check for session cookie
2. If authenticated + on auth page → redirect to appropriate portal
3. If unauthenticated + on protected page → redirect to `/auth/v2/login`
4. If authenticated + on portal route → check portal access
5. Otherwise → allow access

### API Route Protection

Protect API routes using the appropriate helper:

```typescript
import { requireAuth, requireOrganization, requirePortalAccess } from "@/lib/auth-server";

// Basic authentication
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    // User is authenticated
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// Organization-scoped data
export async function GET(request: NextRequest) {
  try {
    const { organizationId } = await requireOrganization();
    // User has active organization
    const data = await getDataForOrganization(organizationId);
  } catch (error) {
    return NextResponse.json({ error: "Organization required" }, { status: 403 });
  }
}

// Portal-specific access
export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalAccess("ops", "manager");
    // User has ops portal access with manager+ role
  } catch (error) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }
}
```

---

## Database Schema

### BetterAuth Tables

BetterAuth automatically creates these tables:

#### users
```typescript
{
  id: TEXT (PK)
  email: TEXT (unique)
  name: TEXT
  hashedPassword: TEXT
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### sessions
```typescript
{
  id: TEXT (PK)
  userId: TEXT (FK -> users.id)
  token: TEXT (unique)
  expiresAt: TIMESTAMP
  createdAt: TIMESTAMP
}
```

#### organizations (BetterAuth)
```typescript
{
  id: TEXT (PK)
  name: TEXT
  slug: TEXT (unique)
  logo: TEXT (nullable)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### members (BetterAuth)
```typescript
{
  id: TEXT (PK)
  organizationId: TEXT (FK -> organizations.id)
  userId: TEXT (FK -> users.id)
  role: TEXT (default "member")
  createdAt: TIMESTAMP
}
```

#### invitations (BetterAuth)
```typescript
{
  id: TEXT (PK)
  organizationId: TEXT (FK -> organizations.id)
  email: TEXT
  role: TEXT
  expiresAt: TIMESTAMP
  createdAt: TIMESTAMP
}
```

### Custom Tables

#### user_portal_access
```typescript
{
  id: UUID (PK)
  userId: TEXT (FK -> users.id)
  organizationId: TEXT (references BetterAuth organizations)
  portalType: ENUM("ops", "investor", "borrower")
  role: TEXT (default "member")
  isActive: BOOLEAN (default true)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

**Portal Type Enum:**
```typescript
export const portalTypeEnum = pgEnum("portal_type", ["ops", "investor", "borrower"]);
export type PortalType = (typeof portalTypeEnum.enumValues)[number];
```

---

## Security Features

### Password Handling
- ✅ Passwords hashed using bcrypt
- ✅ Minimum 6 characters
- ✅ Never stored in plain text
- ✅ Never sent in API responses

### Session Security
- ✅ HTTP-only cookies (not accessible via JavaScript)
- ✅ Automatic expiration
- ✅ Token rotation on activity
- ✅ Server-side session validation

### CSRF Protection
- ✅ BetterAuth includes built-in CSRF protection
- ✅ Tokens validated on state-changing operations

### Organization Isolation
- ✅ All data queries scoped to active organization
- ✅ Portal access checked per organization
- ✅ Role hierarchy enforced at API level

---

## Environment Variables

Required configuration in `.env.local`:

```bash
# BetterAuth secret for JWT signing
BETTER_AUTH_SECRET="ibNxolF8mIqcxbKjPljePIcdEkanopQa"

# Base URL for auth redirects
BETTER_AUTH_URL="http://localhost:3000"

# Database connection
DATABASE_URL="postgresql://..."
```

**Generate Secret:**
```bash
openssl rand -base64 32
```

---

## Client-Side Usage

### Check Authentication Status

```typescript
"use client";
import { useSession } from "@/lib/auth-client";

export function MyComponent() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;
  
  return (
    <div>
      Welcome, {session.user.name}
      {session.activeOrganization && (
        <p>Active Organization: {session.activeOrganization.name}</p>
      )}
    </div>
  );
}
```

### Organization Switching

```typescript
"use client";
import { useSession } from "@/lib/auth-client";

export function OrganizationSwitcher() {
  const { data: session } = useSession();
  
  if (!session?.user?.organizations || session.user.organizations.length <= 1) {
    return null; // No switching needed
  }
  
  return (
    <select onChange={handleOrganizationChange}>
      {session.user.organizations.map(org => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  );
}
```

### Portal Access Check

```typescript
"use client";
import { useSession } from "@/lib/auth-client";

export function PortalNav() {
  const { data: session } = useSession();
  
  if (!session?.portalAccess) return null;
  
  return (
    <nav>
      {session.portalAccess.map(access => (
        <a key={access.portalType} href={`/${access.portalType}/dashboard`}>
          {access.portalType} ({access.role})
        </a>
      ))}
    </nav>
  );
}
```

### Sign Out

```typescript
"use client";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  
  const handleLogout = async () => {
    await signOut();
    router.push("/auth/v2/login");
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

---

## Server-Side Usage

### Get Current User

```typescript
import { getSession } from "@/lib/auth-server";

export default async function MyPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/auth/v2/login");
  }
  
  return (
    <div>
      Welcome, {session.name}
      {session.activeOrganization && (
        <p>Organization: {session.activeOrganization.name}</p>
      )}
    </div>
  );
}
```

### Require Organization Context

```typescript
import { requireOrganization } from "@/lib/auth-server";

export default async function OrganizationPage() {
  const { organizationId, activeOrganization } = await requireOrganization();
  
  return (
    <div>
      <h1>{activeOrganization.name}</h1>
      <p>Organization ID: {organizationId}</p>
    </div>
  );
}
```

### Require Portal Access

```typescript
import { requirePortalAccess } from "@/lib/auth-server";

export default async function OpsDashboard() {
  const session = await requirePortalAccess("ops", "manager");
  
  return (
    <div>
      <h1>Operations Dashboard</h1>
      <p>Welcome, {session.name}</p>
      <p>Role: {session.activeOrganization?.role}</p>
    </div>
  );
}
```

---

## Current Features

### Multi-Organization Support
- ✅ Users can belong to multiple organizations
- ✅ Active organization concept
- ✅ Organization switching
- ✅ Organization-scoped data access

### Portal-Based Access Control
- ✅ Three portal types (ops, investor, borrower)
- ✅ Portal-specific roles and permissions
- ✅ Multi-portal access per user
- ✅ Portal routing and access checks

### Role-Based Access Control (RBAC)
- ✅ Two-level RBAC (organization + portal roles)
- ✅ Role hierarchy with numeric levels
- ✅ Permission checking helpers
- ✅ Role-based UI rendering

---

## Future Enhancements (Sprint 2+)

- [ ] Email verification
- [ ] Password reset flow
- [ ] Two-factor authentication (2FA)
- [ ] OAuth providers (Google, GitHub)
- [ ] Session management UI
- [ ] Activity logs
- [ ] Failed login tracking
- [ ] Account lockout after failed attempts
- [ ] Permission-based access control (granular permissions)
- [ ] Organization-level settings and configuration
- [ ] Bulk user management
- [ ] Audit trail for organization changes

---

## Troubleshooting

### "Unauthorized" errors
- Check that `BETTER_AUTH_SECRET` is set
- Verify `DATABASE_URL` is correct
- Ensure migrations have run: `npm run db:migrate`
- Check if user has active organization

### Session not persisting
- Check browser cookies are enabled
- Verify `BETTER_AUTH_URL` matches your domain
- Check for CORS issues in production
- Ensure organization is set in session

### Portal access denied
- Verify user has `user_portal_access` record
- Check `isActive` flag is true
- Ensure correct `organizationId` in portal access
- Verify role meets minimum requirement

### Organization switching issues
- Check user belongs to multiple organizations
- Verify BetterAuth organization plugin is enabled
- Ensure session includes organization context
- Check middleware redirect logic

### Can't login after registration
- Ensure seed script hasn't created conflicting user
- Check database for user record
- Verify password is at least 6 characters
- Check if user needs organization assignment
