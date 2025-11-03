# Route Reorganization Migration Map

## Overview

This document provides a detailed migration map for reorganizing routes from `src/app/(main)` into portal-specific route groups: `(ops)`, `(investor)`, `(borrower)`, `(shared)`, and `(public)`.

## Migration Strategy

- **Phase 1**: Move standalone groups to (ops) portal
- **Phase 2**: Create portal-specific routes and view-only variants
- **Phase 3**: Implement conditional rendering for view-only components

## File Movement Map

### Operations Portal Routes (`(ops)`)

#### Analytics Routes

| Source | Destination | Notes |
|--------|-------------|-------|
| `src/app/(main)/analytics/page.tsx` | `src/app/(main)/(ops)/analytics/page.tsx` | Analytics overview (ops-only) |
| `src/app/(main)/analytics/analytics-kpis-with-export.tsx` | `src/app/(main)/(ops)/analytics/analytics-kpis-with-export.tsx` | Keep in same location |
| `src/app/(main)/analytics/analytics-with-export.tsx` | `src/app/(main)/(ops)/analytics/analytics-with-export.tsx` | Keep in same location |
| `src/app/(main)/analytics/overview-export-button.tsx` | `src/app/(main)/(ops)/analytics/overview-export-button.tsx` | Keep in same location |
| `src/app/(main)/analytics/loans/page.tsx` | `src/app/(main)/(ops)/analytics/loans/page.tsx` | Loan analytics |
| `src/app/(main)/analytics/loans/client-page.tsx` | `src/app/(main)/(ops)/analytics/loans/client-page.tsx` | Keep in same location |
| `src/app/(main)/analytics/collections/page.tsx` | `src/app/(main)/(ops)/analytics/collections/page.tsx` | Collections analytics |
| `src/app/(main)/analytics/collections/client-page.tsx` | `src/app/(main)/(ops)/analytics/collections/client-page.tsx` | Keep in same location |
| `src/app/(main)/analytics/inspections/page.tsx` | `src/app/(main)/(ops)/analytics/inspections/page.tsx` | Inspection analytics |
| `src/app/(main)/analytics/inspections/client-page.tsx` | `src/app/(main)/(ops)/analytics/inspections/client-page.tsx` | Keep in same location |

#### Inspector Route

| Source | Destination | Notes |
|--------|-------------|-------|
| `src/app/(main)/inspector/page.tsx` | `src/app/(main)/(ops)/inspector/page.tsx` | Field inspector dashboard (ops-only) |

#### Dashboard Routes (Ops-Only)

| Source | Destination | Notes |
|--------|-------------|-------|
| `src/app/(main)/dashboard/loans/page.tsx` | `src/app/(main)/(ops)/dashboard/loans/page.tsx` | Loan management with wizard |
| `src/app/(main)/dashboard/loans/_components/` | `src/app/(main)/(ops)/dashboard/loans/_components/` | All loan components |
| `src/app/(main)/dashboard/borrowers/page.tsx` | `src/app/(main)/(ops)/dashboard/borrowers/page.tsx` | Borrower profile management |
| `src/app/(main)/dashboard/borrowers/_components/` | `src/app/(main)/(ops)/dashboard/borrowers/_components/` | Borrower components |
| `src/app/(main)/dashboard/lenders/page.tsx` | `src/app/(main)/(ops)/dashboard/lenders/page.tsx` | Lender/capital provider management |
| `src/app/(main)/dashboard/lenders/_components/` | `src/app/(main)/(ops)/dashboard/lenders/_components/` | Lender components |
| `src/app/(main)/dashboard/properties/page.tsx` | `src/app/(main)/(ops)/dashboard/properties/page.tsx` | Property/collateral management |
| `src/app/(main)/dashboard/properties/_components/` | `src/app/(main)/(ops)/dashboard/properties/_components/` | Property components |
| `src/app/(main)/dashboard/finance/page.tsx` | `src/app/(main)/(ops)/dashboard/finance/page.tsx` | Financial overview |
| `src/app/(main)/dashboard/finance/_components/` | `src/app/(main)/(ops)/dashboard/finance/_components/` | Finance components |
| `src/app/(main)/dashboard/crm/page.tsx` | `src/app/(main)/(ops)/dashboard/crm/page.tsx` | CRM dashboard |
| `src/app/(main)/dashboard/crm/_components/` | `src/app/(main)/(ops)/dashboard/crm/_components/` | CRM components |
| `src/app/(main)/dashboard/default/page.tsx` | `src/app/(main)/(ops)/dashboard/default/page.tsx` | Demo dashboard template |
| `src/app/(main)/dashboard/default/_components/` | `src/app/(main)/(ops)/dashboard/default/_components/` | Demo components |

#### Funds Routes (Ops CRUD + Investor View-Only)

| Source | Destination | Notes |
|--------|-------------|-------|
| `src/app/(main)/dashboard/funds/page.tsx` | `src/app/(main)/(ops)/dashboard/funds/page.tsx` | Fund list (with CRUD actions) |
| `src/app/(main)/dashboard/funds/_components/` | `src/app/(main)/(ops)/dashboard/funds/_components/` | Fund components (will be shared) |
| `src/app/(main)/dashboard/funds/[fundId]/page.tsx` | `src/app/(main)/(ops)/dashboard/funds/[fundId]/page.tsx` | Fund detail (with all actions) |
| `src/app/(main)/dashboard/funds/[fundId]/_components/` | `src/app/(main)/(ops)/dashboard/funds/[fundId]/_components/` | Fund detail components |
| `src/app/(main)/dashboard/funds/analytics/page.tsx` | `src/app/(main)/(ops)/dashboard/funds/analytics/page.tsx` | Fund analytics (read-only) |

**Note**: Fund components will need conditional rendering for view-only mode.

#### Loan Feature Routes (Ops Approval Workflows)

| Source | Destination | Notes |
|--------|-------------|-------|
| `src/app/(main)/loans/draws/page.tsx` | `src/app/(main)/(ops)/loans/draws/page.tsx` | Draw approval workflow (ops) |
| `src/app/(main)/loans/draws/_components/` | `src/app/(main)/(ops)/loans/draws/_components/` | Draw approval components |
| `src/app/(main)/loans/draws/schema.ts` | `src/app/(main)/(ops)/loans/draws/schema.ts` | Draw schemas |
| `src/app/(main)/loans/payments/page.tsx` | `src/app/(main)/(ops)/loans/payments/page.tsx` | Payment management (ops) |
| `src/app/(main)/loans/payments/_components/` | `src/app/(main)/(ops)/loans/payments/_components/` | Payment management components |
| `src/app/(main)/loans/payments/schema.ts` | `src/app/(main)/(ops)/loans/payments/schema.ts` | Payment schemas |
| `src/app/(main)/loans/schema.ts` | `src/app/(main)/(ops)/loans/schema.ts` | Loan schemas |

### Investor Portal Routes (`(investor)`)

#### Dashboard Routes

| Source | Destination | Notes |
|--------|-------------|-------|
| N/A | `src/app/(main)/(investor)/dashboard/funds/page.tsx` | **NEW** - View-only fund list |
| N/A | `src/app/(main)/(investor)/dashboard/funds/[fundId]/page.tsx` | **NEW** - View-only fund detail |
| N/A | `src/app/(main)/(investor)/dashboard/funds/analytics/page.tsx` | **NEW** - Fund analytics (can reuse ops version) |

**Implementation Notes**:
- Investor fund pages should reuse components from ops with `viewOnly={true}` prop
- Remove all CRUD action buttons for investor portal
- Fund detail tabs should be read-only variants

### Borrower Portal Routes (`(borrower)`)

#### Dashboard Routes

| Source | Destination | Notes |
|--------|-------------|-------|
| N/A | `src/app/(main)/(borrower)/dashboard/portfolio/page.tsx` | **NEW** - Borrower-specific metrics |

#### Loan Feature Routes (Borrower Self-Service)

| Source | Destination | Notes |
|--------|-------------|-------|
| N/A | `src/app/(main)/(borrower)/loans/draws/page.tsx` | **NEW** - Draw request form (borrower) |
| N/A | `src/app/(main)/(borrower)/loans/draws/_components/` | **NEW** - Draw request components |
| N/A | `src/app/(main)/(borrower)/loans/payments/page.tsx` | **NEW** - Payment tracking (borrower) |
| N/A | `src/app/(main)/(borrower)/loans/payments/_components/` | **NEW** - Payment tracking components |

**Implementation Notes**:
- Borrower draws: Create request form (different from ops approval workflow)
- Borrower payments: Payment tracking and history (different from ops payment management)

### Shared Routes (`(shared)`)

#### Dashboard Routes (Accessible from All Portals)

| Source | Destination | Notes |
|--------|-------------|-------|
| `src/app/(main)/dashboard/page.tsx` | `src/app/(main)/(shared)/dashboard/page.tsx` | Role-based redirect to appropriate portal |
| `src/app/(main)/dashboard/portfolio/page.tsx` | `src/app/(main)/(shared)/dashboard/portfolio/page.tsx` | High-level portfolio metrics (read-only) |
| `src/app/(main)/dashboard/portfolio/_components/` | `src/app/(main)/(shared)/dashboard/portfolio/_components/` | Portfolio components |
| `src/app/(main)/dashboard/coming-soon/page.tsx` | `src/app/(main)/(shared)/dashboard/coming-soon/page.tsx` | Generic placeholder page |
| `src/app/(main)/dashboard/[...not-found]/page.tsx` | `src/app/(main)/(shared)/dashboard/[...not-found]/page.tsx` | 404 handler for dashboard routes |

#### Shared Dashboard Components

| Source | Destination | Notes |
|--------|-------------|-------|
| `src/app/(main)/dashboard/_components/` | `src/app/(main)/(shared)/dashboard/_components/` | Shared sidebar, layout, etc. |
| `src/app/(main)/dashboard/layout.tsx` | `src/app/(main)/(shared)/dashboard/layout.tsx` | Shared dashboard layout |

**Note**: Dashboard layout and sidebar components are shared but may need portal-specific customization.

### Public Routes (`(public)`)

#### Auth Routes

| Source | Destination | Notes |
|--------|-------------|-------|
| `src/app/(main)/auth/v1/login/page.tsx` | `src/app/(main)/(public)/auth/v1/login/page.tsx` | Login page v1 |
| `src/app/(main)/auth/v1/register/page.tsx` | `src/app/(main)/(public)/auth/v1/register/page.tsx` | Registration page v1 |
| `src/app/(main)/auth/v2/login/page.tsx` | `src/app/(main)/(public)/auth/v2/login/page.tsx` | Login page v2 |
| `src/app/(main)/auth/v2/register/page.tsx` | `src/app/(main)/(public)/auth/v2/register/page.tsx` | Registration page v2 |
| `src/app/(main)/auth/v2/layout.tsx` | `src/app/(main)/(public)/auth/v2/layout.tsx` | Auth v2 layout |
| `src/app/(main)/auth/_components/` | `src/app/(main)/(public)/auth/_components/` | Auth components |

#### Error Routes

| Source | Destination | Notes |
|--------|-------------|-------|
| `src/app/(main)/unauthorized/page.tsx` | `src/app/(main)/(public)/unauthorized/page.tsx` | Unauthorized access error |

## Component Changes Required

### Funds Components (View-Only Variants)

#### Fund List Page (`dashboard/funds/page.tsx`)

**Current Features**:
- "New Fund" button in header
- Edit actions in table columns
- Fund creation drawer

**Investor View-Only Changes**:
- Remove "New Fund" button
- Remove edit actions from table
- Hide fund creation drawer

**Implementation**:
```typescript
// Use portal access hook
const { portalType } = usePortalAccess();
const canEdit = portalType === "ops";

{canEdit && <Button>New Fund</Button>}
```

#### Fund Detail Page (`dashboard/funds/[fundId]/page.tsx`)

**Tabs Requiring Changes**:

1. **Overview Tab**:
   - Remove "Close Fund" button (AlertDialog)

2. **Commitments Tab**:
   - Remove "New Commitment" button
   - Remove "Cancel" per-row action

3. **Calls Tab**:
   - Remove "New Capital Call" button

4. **Allocations Tab**:
   - Remove "Allocate to Loan" button

5. **Distributions Tab**:
   - Remove "New Distribution" button

**Implementation**:
```typescript
// Pass viewOnly prop to tab components
<Tabs>
  <OverviewTab viewOnly={portalType === "investor"} />
  <CommitmentsTab viewOnly={portalType === "investor"} />
  {/* ... */}
</Tabs>
```

## Migration Scripts

### Phase 1: Move Standalone Groups

```bash
# Move analytics to (ops)
mv src/app/\(main\)/analytics src/app/\(main\)/\(ops\)/analytics

# Move inspector to (ops)
mv src/app/\(main\)/inspector src/app/\(main\)/\(ops\)/inspector

# Move loans to (ops) (for ops approval workflows)
mv src/app/\(main\)/loans src/app/\(main\)/\(ops\)/loans
```

### Phase 2: Move Dashboard Routes

```bash
# Move ops-only dashboard routes
mv src/app/\(main\)/dashboard/loans src/app/\(main\)/\(ops\)/dashboard/loans
mv src/app/\(main\)/dashboard/borrowers src/app/\(main\)/\(ops\)/dashboard/borrowers
mv src/app/\(main\)/dashboard/lenders src/app/\(main\)/\(ops\)/dashboard/lenders
mv src/app/\(main\)/dashboard/properties src/app/\(main\)/\(ops\)/dashboard/properties
mv src/app/\(main\)/dashboard/finance src/app/\(main\)/\(ops\)/dashboard/finance
mv src/app/\(main\)/dashboard/crm src/app/\(main\)/\(ops\)/dashboard/crm
mv src/app/\(main\)/dashboard/default src/app/\(main\)/\(ops\)/dashboard/default

# Move funds (ops CRUD version)
mv src/app/\(main\)/dashboard/funds src/app/\(main\)/\(ops\)/dashboard/funds

# Move shared dashboard routes
mv src/app/\(main\)/dashboard/portfolio src/app/\(main\)/\(shared\)/dashboard/portfolio
mv src/app/\(main\)/dashboard/coming-soon src/app/\(main\)/\(shared\)/dashboard/coming-soon
mv src/app/\(main\)/dashboard/\[...not-found\] src/app/\(main\)/\(shared\)/dashboard/\[...not-found\]
mv src/app/\(main\)/dashboard/page.tsx src/app/\(main\)/\(shared\)/dashboard/page.tsx
mv src/app/\(main\)/dashboard/layout.tsx src/app/\(main\)/\(shared\)/dashboard/layout.tsx
mv src/app/\(main\)/dashboard/_components src/app/\(main\)/\(shared\)/dashboard/_components
```

### Phase 3: Move Public Routes

```bash
# Move auth routes
mv src/app/\(main\)/auth src/app/\(main\)/\(public\)/auth

# Move unauthorized
mv src/app/\(main\)/unauthorized src/app/\(main\)/\(public\)/unauthorized
```

## Import Path Updates

After moving files, update import paths:

### Global Find/Replace

1. `from "@/app/(main)/analytics` → `from "@/app/(main)/(ops)/analytics`
2. `from "@/app/(main)/inspector` → `from "@/app/(main)/(ops)/inspector`
3. `from "@/app/(main)/dashboard/loans` → `from "@/app/(main)/(ops)/dashboard/loans`
4. `from "@/app/(main)/dashboard/borrowers` → `from "@/app/(main)/(ops)/dashboard/borrowers`
5. `from "@/app/(main)/dashboard/lenders` → `from "@/app/(main)/(ops)/dashboard/lenders`
6. `from "@/app/(main)/dashboard/properties` → `from "@/app/(main)/(ops)/dashboard/properties`
7. `from "@/app/(main)/dashboard/finance` → `from "@/app/(main)/(ops)/dashboard/finance`
8. `from "@/app/(main)/dashboard/crm` → `from "@/app/(main)/(ops)/dashboard/crm`
9. `from "@/app/(main)/dashboard/default` → `from "@/app/(main)/(ops)/dashboard/default`
10. `from "@/app/(main)/dashboard/portfolio` → `from "@/app/(main)/(shared)/dashboard/portfolio`
11. `from "@/app/(main)/auth` → `from "@/app/(main)/(public)/auth`
12. `from "@/app/(main)/unauthorized` → `from "@/app/(main)/(public)/unauthorized`

## Testing Checklist

After migration, verify:

- [ ] All routes accessible after migration
- [ ] Portal access enforcement working correctly
- [ ] View-only variants hide edit actions
- [ ] Split routes (draws/payments) work in both portals
- [ ] Shared routes accessible from all portals
- [ ] Public routes accessible without authentication
- [ ] Import paths updated correctly
- [ ] No broken links or navigation
- [ ] Middleware redirects working correctly

## Rollback Plan

If issues arise:

1. Keep backup of current `src/app/(main)` structure
2. Git branch before migration: `git checkout -b route-reorganization-backup`
3. Document exact file movements for reverse migration
4. Feature flag for new routes: `NEXT_PUBLIC_ENABLE_PORTAL_ROUTES`

## Timeline

- **Phase 1**: Move standalone groups (1-2 hours)
- **Phase 2**: Move dashboard routes (2-3 hours)
- **Phase 3**: Create investor/borrower routes (3-4 hours)
- **Phase 4**: Implement view-only variants (4-6 hours)
- **Phase 5**: Testing and fixes (2-3 hours)

**Total Estimated Time**: 12-18 hours

