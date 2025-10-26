# Authentication Flow Documentation

## Overview

Lending OS uses **BetterAuth** for authentication with email/password login. BetterAuth provides a secure, self-hosted authentication solution with session management via JWT cookies.

## Architecture

### Components

1. **BetterAuth Server** (`src/lib/auth.ts`)
   - Configured with Drizzle adapter
   - Email/password authentication provider
   - Session management (7-day expiry)

2. **Client SDK** (`src/lib/auth-client.ts`)
   - React hooks for auth state
   - Sign in/up/out functions

3. **Server Utilities** (`src/lib/auth-server.ts`)
   - `getSession()` - Get current session
   - `requireAuth()` - Enforce authentication

4. **Middleware** (`src/middleware.ts`)
   - Route protection
   - Redirect logic

5. **API Routes** (`src/app/api/auth/[...all]/route.ts`)
   - BetterAuth handler for all auth operations

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
4. User redirected to /dashboard
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
4. User redirected to /dashboard
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

### Session Management

**Session Configuration:**
- **Expiry**: 7 days
- **Update Age**: 1 day (session refreshes after 1 day of activity)
- **Cookie Cache**: 5 minutes
- **Storage**: JWT in HTTP-only cookie

**Cookie Name:**
```
better-auth.session_token
```

**Session Validation:**
```typescript
// Server-side
const session = await getSession();
if (!session) {
  // User not authenticated
}

// Client-side
const { data: session } = useSession();
```

---

### Logout Flow

```
1. User clicks logout
   ↓
2. Client calls signOut()
   ↓
3. BetterAuth:
   - Deletes session from database
   - Clears session cookie
   ↓
4. User redirected to /auth/v1/login
```

**Implementation:**
```typescript
await signOut();
router.push("/auth/v1/login");
```

---

## Route Protection

### Middleware Protection

The middleware (`src/middleware.ts`) automatically handles route protection:

```typescript
// Protected routes: /dashboard/*
// Auth routes: /auth/*
// Public routes: / (landing page)
```

**Logic:**
1. Check for session cookie
2. If authenticated + on auth page → redirect to /dashboard
3. If unauthenticated + on protected page → redirect to /auth/v1/login
4. Otherwise → allow access

---

### API Route Protection

Protect API routes using `requireAuth()`:

```typescript
import { requireAuth } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const { user, session } = await requireAuth();
    
    // User is authenticated
    // ...
  } catch (error) {
    // Unauthorized
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401 }
    );
  }
}
```

---

## Database Schema

BetterAuth uses the following tables:

### users
```typescript
{
  id: UUID
  email: TEXT (unique)
  name: TEXT
  hashedPassword: TEXT
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

### sessions
```typescript
{
  id: UUID
  userId: UUID (FK)
  token: TEXT (unique)
  expiresAt: TIMESTAMP
  createdAt: TIMESTAMP
}
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

---

## Environment Variables

Required configuration in `.env.local`:

```bash
# BetterAuth secret for JWT signing
BETTER_AUTH_SECRET="your-secret-key-here"

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
  
  return <div>Welcome, {session.user.name}</div>;
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
    router.push("/auth/v1/login");
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
    redirect("/auth/v1/login");
  }
  
  return <div>Welcome, {session.user.name}</div>;
}
```

### Require Authentication

```typescript
import { requireAuth } from "@/lib/auth-server";

export default async function ProtectedPage() {
  const { user } = await requireAuth(); // Throws if not authenticated
  
  return <div>Welcome, {user.name}</div>;
}
```

---

## Future Enhancements (Sprint 2+)

- [ ] Role-based access control (RBAC)
- [ ] Email verification
- [ ] Password reset flow
- [ ] Two-factor authentication (2FA)
- [ ] OAuth providers (Google, GitHub)
- [ ] Session management UI
- [ ] Activity logs
- [ ] Failed login tracking
- [ ] Account lockout after failed attempts

---

## Troubleshooting

### "Unauthorized" errors
- Check that `BETTER_AUTH_SECRET` is set
- Verify `DATABASE_URL` is correct
- Ensure migrations have run: `npm run db:migrate`

### Session not persisting
- Check browser cookies are enabled
- Verify `BETTER_AUTH_URL` matches your domain
- Check for CORS issues in production

### Can't login after registration
- Ensure seed script hasn't created conflicting user
- Check database for user record
- Verify password is at least 6 characters

