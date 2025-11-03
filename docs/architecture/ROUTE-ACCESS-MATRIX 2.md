# Route-Access Matrix for src/app/(main)

## Overview
This matrix maps all routes in `src/app/(main)` to their intended portals (ops/investor/borrower) and identifies pages requiring view-only variants for investor access.

## Legend
- **ops** = Operations portal (admin/staff with full CRUD)
- **investor** = Investor portal (view-only access to funds/analytics)
- **borrower** = Borrower portal (self-service loan applications)
- ⚠️ = Standalone route groups requiring reorganization
- 🔒 = Pages needing view-only variants for investor access
- ✅ = Pages already investor-friendly (read-only)

## Route-Access Matrix

| Route Path | Current Location | Page Type | Intended Portal(s) | View-Only Variant Needed? | Move Required? | Notes |
|------------|------------------|-----------|-------------------|---------------------------|----------------|-------|
| `/dashboard` | dashboard | Redirect | **ops**, investor, borrower | No | `(shared)` | Redirects to `/dashboard/portfolio` |
| `/dashboard/portfolio` | dashboard | Dashboard | **ops**, investor | No | `(shared)` | High-level portfolio metrics (already read-only) |
| `/dashboard/loans` | dashboard | CRUD List | **ops** | No | `(ops)` | Loan management with wizard (ops-only) |
| `/dashboard/borrowers` | dashboard | CRUD List | **ops** | No | `(ops)` | Borrower profile management (ops-only) |
| `/dashboard/lenders` | dashboard | CRUD List | **ops** | No | `(ops)` | Lender/capital provider management (ops-only) |
| `/dashboard/funds` | dashboard | CRUD List | **ops**, investor | 🔒 Yes | `(ops)` | Remove "New Fund" button for investor variant |
| `/dashboard/funds/[fundId]` | dashboard | Detail Page | **ops**, investor | 🔒 Yes | `(ops)` | All tabs need view-only variants (see details below) |
| `/dashboard/funds/analytics` | dashboard | Analytics | **ops**, investor | ✅ No | `(ops)` | Already read-only analytics |
| `/dashboard/properties` | dashboard | CRUD List | **ops** | No | `(ops)` | Property/collateral management (ops-only) |
| `/dashboard/finance` | dashboard | Dashboard | **ops** | No | `(ops)` | Financial overview (ops-only) |
| `/dashboard/crm` | dashboard | Dashboard | **ops** | No | `(ops)` | CRM dashboard (ops-only) |
| `/dashboard/default` | dashboard | Demo/Template | **ops** | No | `(ops)` | Demo dashboard template (ops-only) |
| `/dashboard/coming-soon` | dashboard | Placeholder | ops, investor, borrower | No | `(shared)` | Generic placeholder page |
| `/dashboard/[...not-found]` | dashboard | Error | ops, investor, borrower | No | `(shared)` | 404 handler for dashboard routes |
| ⚠️ `/analytics` | analytics | Analytics | **ops** | No | `(ops)` | Analytics overview (ops-only) |
| ⚠️ `/analytics/loans` | analytics | Analytics | **ops** | No | `(ops)` | Loan-specific analytics (ops-only) |
| ⚠️ `/analytics/collections` | analytics | Analytics | **ops** | No | `(ops)` | Collections analytics (ops-only) |
| ⚠️ `/analytics/inspections` | analytics | Analytics | **ops** | No | `(ops)` | Inspection analytics (ops-only) |
| ⚠️ `/inspector` | inspector | Mobile App | **ops** | No | `(ops)` | Field inspector dashboard (ops-only) |
| ⚠️ `/loans/draws` | loans | Feature Module | **ops**, borrower | No | Split | Draw approval (ops) + request (borrower) |
| ⚠️ `/loans/payments` | loans | Feature Module | **ops**, borrower | No | Split | Payment management (ops) + tracking (borrower) |
| `/auth/v1/login` | auth | Auth | public | No | `(public)` | Login page v1 |
| `/auth/v1/register` | auth | Auth | public | No | `(public)` | Registration page v1 |
| `/auth/v2/login` | auth | Auth | public | No | `(public)` | Login page v2 |
| `/auth/v2/register` | auth | Auth | public | No | `(public)` | Registration page v2 |
| `/unauthorized` | unauthorized | Error | public | No | `(public)` | Unauthorized access error |

## Detailed View-Only Variant Requirements

### `/dashboard/funds/[fundId]` - Fund Detail Page

| Tab | Current Actions | Investor View-Only Changes |
|-----|----------------|---------------------------|
| **Overview** | "Close Fund" button with AlertDialog | Hide "Close Fund" button |
| **Commitments** | "New Commitment" button, "Cancel" per-row action | Remove all action buttons, show read-only table |
| **Calls** | "New Capital Call" button | Remove "New Capital Call" button |
| **Allocations** | "Allocate to Loan" button | Remove "Allocate to Loan" button |
| **Distributions** | "New Distribution" button | Remove "New Distribution" button |

### `/dashboard/funds` - Fund List Page

| Current Feature | Investor View-Only Changes |
|----------------|---------------------------|
| "New Fund" button in header | Remove "New Fund" button |
| Edit action in table columns | Remove edit actions from table |
| Fund creation drawer | Hide fund creation functionality |

## Recommended Route Group Reorganization

### Current Structure
```
src/app/(main)/
├── analytics/          # ⚠️ Standalone group
├── auth/              # Public auth pages
├── dashboard/         # Mixed ops/investor content
├── inspector/         # ⚠️ Standalone page
├── loans/            # ⚠️ Standalone group
└── unauthorized/     # Public error page
```

### Proposed Structure
```
src/app/(main)/
├── (ops)/                    # Operations portal routes
│   ├── analytics/            # Move from standalone
│   ├── dashboard/
│   │   ├── borrowers/        # ops-only
│   │   ├── lenders/         # ops-only
│   │   ├── loans/           # ops-only
│   │   ├── properties/      # ops-only
│   │   ├── finance/         # ops-only
│   │   ├── crm/            # ops-only
│   │   └── funds/          # ops CRUD + investor view-only
│   ├── inspector/           # Move from standalone
│   └── loans/              # ops approval workflows
├── (investor)/              # Investor portal routes
│   ├── dashboard/
│   │   ├── portfolio/      # High-level metrics
│   │   └── funds/          # View-only fund access
│   └── loans/              # investor view-only loan data
├── (borrower)/              # Borrower portal routes
│   ├── dashboard/
│   │   └── portfolio/      # Borrower-specific metrics
│   └── loans/              # borrower self-service
├── (shared)/                # Shared across portals
│   ├── dashboard/
│   │   ├── page.tsx        # Role-based redirect
│   │   ├── portfolio/      # Shared portfolio view
│   │   └── coming-soon/    # Generic placeholder
│   └── dashboard/[...not-found]/
└── (public)/                # Public routes
    ├── auth/
    └── unauthorized/
```

## Implementation Priority

### Phase 1: Critical Reorganization
1. **Move standalone groups to (ops)**
   - `/analytics` → `(ops)/analytics`
   - `/inspector` → `(ops)/inspector`
   - `/loans` → `(ops)/loans` (ops approval workflows)

### Phase 2: Portal-Specific Routes
2. **Create investor portal routes**
   - `(investor)/dashboard/funds` (view-only variant)
   - `(investor)/dashboard/funds/[fundId]` (view-only tabs)

3. **Create borrower portal routes**
   - `(borrower)/loans/draws` (request forms)
   - `(borrower)/loans/payments` (payment tracking)

### Phase 3: View-Only Components
4. **Implement view-only variants**
   - Fund list page (remove CRUD buttons)
   - Fund detail tabs (remove action buttons)
   - Conditional rendering based on portal access

## Portal Access Control Implementation

### Database Schema (Already Exists)
```sql
-- Portal types: "ops", "investor", "borrower"
portal_type_enum

-- User portal access with roles
user_portal_access (
  userId,
  organizationId,
  portalType,
  role, -- "admin", "manager", "viewer", "member"
  isActive
)
```

### Middleware Enhancement Needed
Current middleware only checks authentication. Need to add:
1. Portal access verification
2. Role-based route access
3. Component-level permission checks

### Component-Level Changes
1. **Conditional rendering** based on portal type
2. **View-only props** for investor components
3. **Permission hooks** for action buttons

## Notes

- **Current State**: All routes are ops-focused with no portal enforcement
- **Database Ready**: Portal schema exists but not enforced
- **Components Ready**: Most components can be easily modified for view-only variants
- **Critical Gap**: No middleware enforcement of portal-level RBAC

This matrix provides the foundation for implementing proper portal-based access control and route organization.
