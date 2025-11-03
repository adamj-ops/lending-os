# ADR-003: Portal Access Model

> **Note:** This ADR is part of the unified auth series. Future ADRs should continue numbering in `.cursor/docs/architecture/`.

## Status
Accepted

## Context

Lending OS needs to support different user types with distinct access patterns and feature sets:

- **Operations Staff**: Need full access to all features (loan management, borrower management, reporting)
- **Investors/Lenders**: Need access to investment data, loan performance, distributions
- **Borrowers**: Need access to loan applications, status tracking, document upload

A single application with role-based UI toggles would become complex and hard to maintain. The system needs a clear separation of concerns while allowing users to access multiple portals.

## Decision

Implement a three-portal architecture with portal-specific access control and role hierarchies.

### Portal Types

```typescript
// src/db/schema/portal-roles.ts lines 11
export const portalTypeEnum = pgEnum("portal_type", ["ops", "investor", "borrower"]);
export type PortalType = (typeof portalTypeEnum.enumValues)[number];
```

**Portal Definitions:**
- **ops**: Operations portal for admin/staff (full access to all features)
- **investor**: Investor/lender portal (view analytics, loans, distributions)  
- **borrower**: Borrower portal (apply for loans, track applications)

### Portal Access Table Design

```typescript
// src/db/schema/portal-roles.ts lines 23-51
export const userPortalAccess = pgTable("user_portal_access", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").notNull(), // References BetterAuth organizations
  portalType: portalTypeEnum("portal_type").notNull(),
  role: text("role").notNull().default("member"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});
```

### Why Portal-Based Over Single App

- **Clear Separation**: Each portal has distinct UI/UX optimized for its user type
- **Security**: Portal access can be granted/revoked independently
- **Scalability**: Portals can evolve independently without affecting others
- **User Experience**: Users see only relevant features for their role
- **Maintenance**: Easier to maintain and test portal-specific features

### Multi-Portal Access

Users can have access to multiple portals across multiple organizations:

```typescript
// Example: User with multiple portal access
const userAccess = [
  { portalType: "ops", organizationId: "org-a", role: "admin" },
  { portalType: "investor", organizationId: "org-b", role: "viewer" },
  { portalType: "borrower", organizationId: "org-c", role: "member" }
];
```

### Role Hierarchy Per Portal

Each portal supports role-based access with numeric hierarchy:

- **admin** (level 4): Full access, user management, portal settings
- **manager** (level 3): Data management, user viewing, reports
- **analyst** (level 2): Read-only access, can view reports
- **member/viewer** (level 1): Limited read-only access

### Portal Routing Logic

**Default Portal Selection:**
1. If user has ops access: Default to `/ops/dashboard`
2. If user has investor access: Default to `/investor/dashboard`  
3. If user has borrower access: Default to `/borrower/dashboard`
4. If multiple portals: Show portal selection UI

**Route Patterns:**
- `/ops/*` - Operations portal routes
- `/investor/*` - Investor portal routes
- `/borrower/*` - Borrower portal routes

### Enforcement Points

**Middleware vs Server Components:**

1. **Middleware** (`src/middleware.ts`): 
   - Handles initial route protection
   - Redirects to appropriate portal based on access
   - Checks for valid session

2. **Server Components**: 
   - Use `requirePortalAccess()` for fine-grained access control
   - Check specific portal permissions
   - Validate role requirements

### Portal Role Surfacing

The `getUserPortalAccess()` helper surfaces portal roles to UI/service layers:

```typescript
// src/lib/auth-server.ts lines 156-172
export async function getUserPortalAccess(
  userId: string,
  organizationId: string
): Promise<Array<{ portalType: PortalType; role: string }>> {
  const access = await db.query.userPortalAccess.findMany({
    where: and(
      eq(userPortalAccess.userId, userId),
      eq(userPortalAccess.organizationId, organizationId),
      eq(userPortalAccess.isActive, true)
    ),
  });

  return access.map((a) => ({
    portalType: a.portalType,
    role: a.role,
  }));
}
```

## Consequences

### Positive

- **Clear User Experience**: Each portal optimized for its user type
- **Fine-Grained Access Control**: Portal access can be granted/revoked independently
- **Scalable Architecture**: Portals can evolve independently
- **Security**: Portal access checked at multiple enforcement points
- **Multi-Organization Support**: Users can have different portal access per organization
- **Role Flexibility**: Portal roles can differ from organization roles
- **Independent Development**: Teams can work on portals independently

### Negative

- **Code Duplication**: Some features may need to be implemented across portals
- **Complexity**: More complex routing and access control logic
- **Portal Switching**: Users need UI to switch between portals
- **Database Queries**: Portal access requires additional database lookups
- **Maintenance**: More code paths to maintain and test

### Implementation Notes

#### Portal Access Checking

```typescript
// src/lib/auth-server.ts lines 106-131
export async function requirePortalAccess(
  portalType: PortalType,
  minRole?: string
): Promise<SessionData> {
  const session = await requireOrganization();

  // Query portal access from DB
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

  // Optional: Check minimum role level
  if (minRole && !hasMinimumRole(access.role, minRole)) {
    throw new Error(`Insufficient permissions: ${minRole} role required`);
  }

  return session;
}
```

#### Portal-Specific Route Protection

```typescript
// Example: Ops portal route
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

#### Portal Access UI

```typescript
// Portal switcher component
export function PortalSwitcher() {
  const { data: session } = useSession();
  const [portalAccess, setPortalAccess] = useState([]);
  
  useEffect(() => {
    if (session?.organizationId) {
      getUserPortalAccess(session.userId, session.organizationId)
        .then(setPortalAccess);
    }
  }, [session]);
  
  return (
    <nav>
      {portalAccess.map(access => (
        <a key={access.portalType} href={`/${access.portalType}/dashboard`}>
          {access.portalType} ({access.role})
        </a>
      ))}
    </nav>
  );
}
```

#### Middleware Portal Routing

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession();
  
  if (session && isPortalRoute(request.nextUrl.pathname)) {
    const portalType = getPortalTypeFromPath(request.nextUrl.pathname);
    const hasAccess = await checkPortalAccess(session.userId, session.organizationId, portalType);
    
    if (!hasAccess) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
}
```

#### Portal-Specific Features

Each portal can have distinct features and data views:

```typescript
// Ops portal: Full loan management
export function OpsLoanManagement() {
  return (
    <div>
      <LoanTable />
      <BorrowerManagement />
      <PaymentTracking />
      <Reports />
    </div>
  );
}

// Investor portal: Investment-focused view
export function InvestorDashboard() {
  return (
    <div>
      <InvestmentSummary />
      <LoanPerformance />
      <DistributionHistory />
    </div>
  );
}

// Borrower portal: Application-focused view
export function BorrowerPortal() {
  return (
    <div>
      <ApplicationStatus />
      <DocumentUpload />
      <PaymentSchedule />
    </div>
  );
}
```

## Related ADRs

- [ADR-001: Multi-Organization Model](./adr-001-multi-organization-model.md) - How organizations work with portals
- [ADR-002: Session Management](./adr-002-session-management.md) - How portal access is included in sessions
- [ADR-004: RBAC Implementation](./adr-004-role-based-access-control.md) - How roles work within portals

## References

- [src/db/schema/portal-roles.ts](../src/db/schema/portal-roles.ts) - Portal access table and types
- [src/lib/auth-server.ts](../src/lib/auth-server.ts) - Portal access helpers
- [src/middleware.ts](../src/middleware.ts) - Portal routing and protection
