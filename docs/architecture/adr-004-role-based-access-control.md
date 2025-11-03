# ADR-004: Role-Based Access Control (RBAC)

> **Note:** This ADR is part of the unified auth series. Future ADRs should continue numbering in `.cursor/docs/architecture/`.

## Status
Accepted

## Context

Lending OS needs a comprehensive role-based access control system that:

- **Supports Multi-Organization**: Users can have different roles in different organizations
- **Supports Multi-Portal**: Users can have different roles in different portals
- **Provides Clear Hierarchy**: Roles need clear permission levels for easy management
- **Enables Fine-Grained Control**: Different features require different permission levels
- **Scales with Growth**: System must support new roles and permissions as the platform grows

The system needs to decide between a simple role-based system vs a more complex permission-based system, and how to handle role inheritance and hierarchy.

## Decision

Implement a two-level RBAC system with organization roles and portal-specific roles, using numeric hierarchy for role comparison.

### Two-Level RBAC Architecture

**Level 1: Organization Role** (from BetterAuth members table)
- Stored in BetterAuth's `members` table
- Determines organization-level permissions
- Examples: "admin", "manager", "member"

**Level 2: Portal Role** (from user_portal_access table)
- Stored in custom `user_portal_access` table
- Determines portal-specific permissions
- Examples: "admin", "manager", "analyst", "viewer"

### Role Hierarchy Implementation

```typescript
// src/lib/auth-server.ts lines 137-150
function hasMinimumRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    admin: 4,
    manager: 3,
    analyst: 2,
    member: 1,
    viewer: 1,
  };

  const userLevel = roleHierarchy[userRole.toLowerCase()] || 0;
  const requiredLevel = roleHierarchy[requiredRole.toLowerCase()] || 0;

  return userLevel >= requiredLevel;
}
```

### Role Definitions

**admin** (level 4):
- Full access to all features
- User management capabilities
- Organization/portal settings
- Can grant/revoke access to other users

**manager** (level 3):
- Data management capabilities
- Can view and edit most data
- User viewing (but not management)
- Access to reports and analytics

**analyst** (level 2):
- Read-only access to data
- Can view reports and analytics
- Cannot modify data or settings
- Limited to viewing permissions

**member/viewer** (level 1):
- Limited read-only access
- Basic feature access only
- Cannot access sensitive data
- Minimal permissions

### Why Portal-Specific Roles vs Global Roles

- **Flexibility**: Users can have different roles in different portals
- **Security**: Portal access can be granted/revoked independently
- **User Experience**: Users see features appropriate to their portal role
- **Scalability**: New portals can define their own role requirements
- **Multi-Organization**: Users can have different portal roles per organization

### Role Storage Strategy

**Organization Roles** (BetterAuth):
```typescript
// Stored in BetterAuth members table
interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: string; // "admin", "manager", "member"
  createdAt: Date;
}
```

**Portal Roles** (Custom Table):
```typescript
// Stored in user_portal_access table
interface UserPortalAccess {
  id: string;
  userId: string;
  organizationId: string;
  portalType: PortalType; // "ops", "investor", "borrower"
  role: string; // "admin", "manager", "analyst", "viewer"
  isActive: boolean;
}
```

### Role Checking Helpers

**Central Role Comparison**:
```typescript
// src/lib/auth-server.ts lines 137-150
function hasMinimumRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    admin: 4,
    manager: 3,
    analyst: 2,
    member: 1,
    viewer: 1,
  };

  const userLevel = roleHierarchy[userRole.toLowerCase()] || 0;
  const requiredLevel = roleHierarchy[requiredRole.toLowerCase()] || 0;

  return userLevel >= requiredLevel;
}
```

**Portal Access with Role Check**:
```typescript
// src/lib/auth-server.ts lines 106-131
export async function requirePortalAccess(
  portalType: PortalType,
  minRole?: string
): Promise<SessionData> {
  const session = await requireOrganization();

  const access = await db.query.userPortalAccess.findFirst({
    where: and(
      eq(userPortalAccess.userId, session.userId),
      eq(userPortalAccess.portalType, portalType),
      eq(userPortalAccess.isActive, true)
    ),
  });

  if (!access) {
    throw new Error(`No ${portalType} portal access for this user`);
  }

  // Check minimum role level
  if (minRole && !hasMinimumRole(access.role, minRole)) {
    throw new Error(`Insufficient permissions: ${minRole} role required`);
  }

  return session;
}
```

## Consequences

### Positive

- **Clear Permission Model**: Numeric hierarchy makes role comparison simple
- **Central Role Logic**: `hasMinimumRole()` provides single source of truth
- **Flexible Access Control**: Portal roles can differ from organization roles
- **Scalable**: Easy to add new roles by updating hierarchy
- **Type Safe**: Full TypeScript support for role checking
- **Multi-Level Security**: Organization + portal role checking
- **Independent Management**: Portal roles managed independently

### Negative

- **Complexity**: Two-level role system is more complex than single-level
- **Database Queries**: Portal role checking requires additional database lookups
- **Role Management**: More complex user role assignment process
- **Permission Granularity**: Role-based system less granular than permission-based
- **Role Proliferation**: Risk of creating too many role types

### Implementation Notes

#### Role Checking in API Routes

```typescript
// Example: Require manager+ role for ops portal
export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalAccess("ops", "manager");
    // User has ops portal access with manager+ role
    const data = await getManagerData(session.organizationId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }
}
```

#### Role-Based UI Rendering

```typescript
// Example: Show admin features only to admins
export function AdminPanel() {
  const { data: session } = useSession();
  const [portalRole, setPortalRole] = useState<string | null>(null);
  
  useEffect(() => {
    if (session?.organizationId) {
      getUserPortalAccess(session.userId, session.organizationId)
        .then(access => {
          const opsAccess = access.find(a => a.portalType === "ops");
          setPortalRole(opsAccess?.role || null);
        });
    }
  }, [session]);
  
  if (!portalRole || !hasMinimumRole(portalRole, "admin")) {
    return <div>Access denied</div>;
  }
  
  return (
    <div>
      <h1>Admin Panel</h1>
      <UserManagement />
      <SystemSettings />
    </div>
  );
}
```

#### Role Assignment

```typescript
// Example: Assign portal role to user
export async function assignPortalRole(
  userId: string,
  organizationId: string,
  portalType: PortalType,
  role: string
) {
  await db.insert(userPortalAccess).values({
    userId,
    organizationId,
    portalType,
    role,
    isActive: true,
  });
}
```

#### Role Hierarchy Updates

When adding new roles, update the central hierarchy:

```typescript
// Adding new role: "super-admin" (level 5)
const roleHierarchy: Record<string, number> = {
  "super-admin": 5, // New highest level
  admin: 4,
  manager: 3,
  analyst: 2,
  member: 1,
  viewer: 1,
};
```

#### Organization vs Portal Role Interaction

```typescript
// Example: Check both organization and portal roles
export async function requireAdminAccess(portalType: PortalType) {
  const session = await requireOrganization();
  
  // Check organization role
  if (!hasMinimumRole(session.activeOrganization?.role || "", "admin")) {
    throw new Error("Organization admin role required");
  }
  
  // Check portal role
  const portalAccess = await db.query.userPortalAccess.findFirst({
    where: and(
      eq(userPortalAccess.userId, session.userId),
      eq(userPortalAccess.portalType, portalType),
      eq(userPortalAccess.isActive, true)
    ),
  });
  
  if (!portalAccess || !hasMinimumRole(portalAccess.role, "admin")) {
    throw new Error(`${portalType} admin role required`);
  }
  
  return session;
}
```

#### Future: Permission-Based System

The current role-based system can evolve to permission-based:

```typescript
// Future: Permission-based system
interface Permission {
  id: string;
  name: string;
  resource: string; // "loan", "borrower", "payment"
  action: string; // "read", "write", "delete"
}

interface RolePermission {
  roleId: string;
  permissionId: string;
}

// Check specific permission
export async function hasPermission(
  userId: string,
  organizationId: string,
  portalType: PortalType,
  resource: string,
  action: string
): Promise<boolean> {
  // Implementation for permission-based checking
}
```

## Related ADRs

- [ADR-001: Multi-Organization Model](./adr-001-multi-organization-model.md) - How organization roles work
- [ADR-003: Portal Access Model](./adr-003-portal-access-model.md) - How portal roles work
- [ADR-005: Migration Strategy](./adr-005-auth-migration-strategy.md) - Migration from simple roles

## References

- [src/lib/auth-server.ts](../src/lib/auth-server.ts) - Role checking helpers and hierarchy
- [src/db/schema/portal-roles.ts](../src/db/schema/portal-roles.ts) - Portal role table design
- [BetterAuth Members Documentation](https://www.better-auth.com/plugins/organization#members)
