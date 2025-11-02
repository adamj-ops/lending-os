# Portal-Specific Layouts Planning

## Overview

This document plans the layout structure for each portal type (ops, investor, borrower, shared, public). Each portal requires a distinct navigation structure optimized for its user type and use cases.

## Current Layout Structure

**Location**: `src/app/(main)/dashboard/layout.tsx`

**Current Components**:
- `DashboardLayout` wrapper
- `AppSidebar` with navigation
- `NavMain` for primary navigation
- `NavSecondary` for secondary navigation
- `NavUser` for user menu
- `AccountSwitcher` for organization switching

## Portal Layout Strategy

### Shared Layout (`(shared)/dashboard/layout.tsx`)

**Purpose**: Base layout shared across all portals with portal-specific customization

**Structure**:
```
(shared)/dashboard/
├── layout.tsx              # Base dashboard layout
└── _components/
    ├── sidebar/
    │   ├── app-sidebar.tsx     # Portal-aware sidebar
    │   ├── nav-main.tsx        # Primary navigation (portal-specific)
    │   ├── nav-secondary.tsx   # Secondary navigation (portal-specific)
    │   └── nav-user.tsx        # User menu (shared)
    └── ...
```

**Key Features**:
- Portal detection logic
- Conditional navigation based on portal type
- Shared user menu and account switcher
- Portal switcher (if user has multiple portal access)

**Implementation**:
```typescript
// (shared)/dashboard/layout.tsx
import { getSession } from "@/lib/auth-server";
import { getUserPortalAccess } from "@/lib/auth-server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { PortalAwareSidebar } from "./_components/sidebar/portal-aware-sidebar";

export default async function SharedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session || !session.organizationId) {
    redirect("/auth/v2/login");
  }

  const portalAccess = await getUserPortalAccess(
    session.userId,
    session.organizationId
  );

  // Determine current portal from pathname or default
  const portalType = getCurrentPortalType(); // ops | investor | borrower

  return (
    <DashboardLayout>
      <PortalAwareSidebar 
        portalType={portalType}
        portalAccess={portalAccess}
        user={session}
      />
      <main>{children}</main>
    </DashboardLayout>
  );
}
```

### Operations Portal Layout (`(ops)/layout.tsx`)

**Purpose**: Operations portal wrapper with ops-specific navigation

**Structure**:
```
(ops)/
├── layout.tsx              # Ops portal layout
├── analytics/
├── dashboard/
│   ├── loans/
│   ├── borrowers/
│   ├── lenders/
│   ├── funds/
│   ├── properties/
│   ├── finance/
│   └── crm/
├── inspector/
└── loans/
```

**Navigation Items** (Ops Portal):
```typescript
const opsNavItems = [
  {
    title: "Dashboard",
    items: [
      { title: "Portfolio", url: "/dashboard/portfolio", icon: "Chart" },
      { title: "Loans", url: "/dashboard/loans", icon: "FileText" },
      { title: "Borrowers", url: "/dashboard/borrowers", icon: "Users" },
      { title: "Lenders", url: "/dashboard/lenders", icon: "Building" },
      { title: "Funds", url: "/dashboard/funds", icon: "DollarSign" },
      { title: "Properties", url: "/dashboard/properties", icon: "Home" },
      { title: "Finance", url: "/dashboard/finance", icon: "Calculator" },
      { title: "CRM", url: "/dashboard/crm", icon: "Contact" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { title: "Overview", url: "/analytics", icon: "BarChart" },
      { title: "Loans", url: "/analytics/loans", icon: "TrendingUp" },
      { title: "Collections", url: "/analytics/collections", icon: "Coins" },
      { title: "Inspections", url: "/analytics/inspections", icon: "Clipboard" },
    ],
  },
  {
    title: "Tools",
    items: [
      { title: "Inspector", url: "/inspector", icon: "ClipboardCheck" },
    ],
  },
];
```

**Features**:
- Full CRUD navigation
- Analytics and reporting
- Inspector tools
- Multi-level navigation structure

### Investor Portal Layout (`(investor)/layout.tsx`)

**Purpose**: Investor portal wrapper with read-only navigation

**Structure**:
```
(investor)/
├── layout.tsx              # Investor portal layout
├── dashboard/
│   ├── portfolio/
│   └── funds/
└── loans/                   # View-only loan data
```

**Navigation Items** (Investor Portal):
```typescript
const investorNavItems = [
  {
    title: "Dashboard",
    items: [
      { title: "Portfolio", url: "/dashboard/portfolio", icon: "Chart" },
      { title: "Funds", url: "/dashboard/funds", icon: "DollarSign" },
      { title: "Loans", url: "/loans", icon: "FileText" },
    ],
  },
  {
    title: "Reports",
    items: [
      { title: "Fund Analytics", url: "/dashboard/funds/analytics", icon: "BarChart" },
      { title: "Performance", url: "/dashboard/portfolio", icon: "TrendingUp" },
    ],
  },
];
```

**Features**:
- Simplified navigation (read-only)
- Focus on portfolio and fund data
- Performance metrics
- No CRUD operations in navigation

**Sidebar Style**:
- Simplified layout
- Fewer navigation items
- Emphasis on viewing and reporting

### Borrower Portal Layout (`(borrower)/layout.tsx`)

**Purpose**: Borrower portal wrapper with self-service navigation

**Structure**:
```
(borrower)/
├── layout.tsx              # Borrower portal layout
├── dashboard/
│   └── portfolio/          # Borrower-specific metrics
└── loans/
    ├── draws/              # Draw requests
    └── payments/           # Payment tracking
```

**Navigation Items** (Borrower Portal):
```typescript
const borrowerNavItems = [
  {
    title: "My Dashboard",
    items: [
      { title: "Overview", url: "/dashboard/portfolio", icon: "Home" },
      { title: "My Loans", url: "/loans", icon: "FileText" },
    ],
  },
  {
    title: "Actions",
    items: [
      { title: "Request Draw", url: "/loans/draws", icon: "ArrowDown" },
      { title: "Payment History", url: "/loans/payments", icon: "CreditCard" },
    ],
  },
];
```

**Features**:
- Self-service focused
- Loan status tracking
- Draw request forms
- Payment history and tracking
- Document upload (future)

**Sidebar Style**:
- Simple, user-friendly navigation
- Action-oriented menu items
- Status indicators for loans

### Public Layout (`(public)/layout.tsx`)

**Purpose**: Minimal layout for public/auth pages

**Structure**:
```
(public)/
├── layout.tsx              # Public layout (minimal)
├── auth/
│   ├── v1/
│   └── v2/
└── unauthorized/
```

**Features**:
- No sidebar or navigation
- Minimal header (logo only)
- Full-width content
- No authentication required

**Implementation**:
```typescript
// (public)/layout.tsx
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Logo />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

## Portal-Aware Sidebar Component

**Location**: `src/app/(main)/(shared)/dashboard/_components/sidebar/portal-aware-sidebar.tsx`

**Purpose**: Render navigation based on portal type

**Implementation**:
```typescript
"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/_components/sidebar/app-sidebar";
import { getNavItemsForPortal } from "./portal-nav-items";

interface PortalAwareSidebarProps {
  portalType: "ops" | "investor" | "borrower";
  portalAccess: Array<{ portalType: PortalType; role: string }>;
  user: SessionData;
}

export function PortalAwareSidebar({
  portalType,
  portalAccess,
  user,
}: PortalAwareSidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItemsForPortal(portalType);

  return (
    <AppSidebar
      navItems={navItems}
      portalType={portalType}
      portalAccess={portalAccess}
      user={user}
    />
  );
}
```

## Portal Switcher Component

**Location**: `src/components/shared/portal-switcher.tsx`

**Purpose**: Allow users with multiple portal access to switch between portals

**Implementation**:
```typescript
"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconBuilding, IconUsers, IconUser } from "@tabler/icons-react";

interface PortalSwitcherProps {
  portalAccess: Array<{ portalType: PortalType; role: string }>;
  currentPortal: PortalType;
}

export function PortalSwitcher({ portalAccess, currentPortal }: PortalSwitcherProps) {
  const router = useRouter();

  const portalIcons = {
    ops: IconBuilding,
    investor: IconUsers,
    borrower: IconUser,
  };

  const portalNames = {
    ops: "Operations",
    investor: "Investor",
    borrower: "Borrower",
  };

  if (portalAccess.length <= 1) {
    return null; // Don't show switcher if only one portal
  }

  const handleSwitch = (portalType: PortalType) => {
    // Redirect to default route for selected portal
    const defaultRoutes = {
      ops: "/dashboard/portfolio",
      investor: "/dashboard/portfolio",
      borrower: "/dashboard/portfolio",
    };
    router.push(defaultRoutes[portalType]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {React.createElement(portalIcons[currentPortal], { className: "mr-2 size-4" })}
          {portalNames[currentPortal]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {portalAccess.map((access) => {
          const Icon = portalIcons[access.portalType];
          return (
            <DropdownMenuItem
              key={access.portalType}
              onClick={() => handleSwitch(access.portalType)}
              disabled={access.portalType === currentPortal}
            >
              <Icon className="mr-2 size-4" />
              {portalNames[access.portalType]}
              {access.portalType === currentPortal && " (Current)"}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Navigation Item Helper

**Location**: `src/app/(main)/(shared)/dashboard/_components/sidebar/portal-nav-items.ts`

**Purpose**: Provide navigation items based on portal type

**Implementation**:
```typescript
import type { PortalType } from "@/db/schema/portal-roles";

export interface NavItem {
  title: string;
  url: string;
  icon: string;
  badge?: string | number;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export function getNavItemsForPortal(portalType: PortalType): NavGroup[] {
  switch (portalType) {
    case "ops":
      return getOpsNavItems();
    case "investor":
      return getInvestorNavItems();
    case "borrower":
      return getBorrowerNavItems();
    default:
      return [];
  }
}

function getOpsNavItems(): NavGroup[] {
  return [
    {
      title: "Dashboard",
      items: [
        { title: "Portfolio", url: "/dashboard/portfolio", icon: "Chart" },
        { title: "Loans", url: "/dashboard/loans", icon: "FileText" },
        { title: "Borrowers", url: "/dashboard/borrowers", icon: "Users" },
        { title: "Lenders", url: "/dashboard/lenders", icon: "Building" },
        { title: "Funds", url: "/dashboard/funds", icon: "DollarSign" },
        { title: "Properties", url: "/dashboard/properties", icon: "Home" },
        { title: "Finance", url: "/dashboard/finance", icon: "Calculator" },
        { title: "CRM", url: "/dashboard/crm", icon: "Contact" },
      ],
    },
    {
      title: "Analytics",
      items: [
        { title: "Overview", url: "/analytics", icon: "BarChart" },
        { title: "Loans", url: "/analytics/loans", icon: "TrendingUp" },
        { title: "Collections", url: "/analytics/collections", icon: "Coins" },
        { title: "Inspections", url: "/analytics/inspections", icon: "Clipboard" },
      ],
    },
    {
      title: "Tools",
      items: [
        { title: "Inspector", url: "/inspector", icon: "ClipboardCheck" },
      ],
    },
  ];
}

function getInvestorNavItems(): NavGroup[] {
  return [
    {
      title: "Dashboard",
      items: [
        { title: "Portfolio", url: "/dashboard/portfolio", icon: "Chart" },
        { title: "Funds", url: "/dashboard/funds", icon: "DollarSign" },
        { title: "Loans", url: "/loans", icon: "FileText" },
      ],
    },
    {
      title: "Reports",
      items: [
        { title: "Fund Analytics", url: "/dashboard/funds/analytics", icon: "BarChart" },
        { title: "Performance", url: "/dashboard/portfolio", icon: "TrendingUp" },
      ],
    },
  ];
}

function getBorrowerNavItems(): NavGroup[] {
  return [
    {
      title: "My Dashboard",
      items: [
        { title: "Overview", url: "/dashboard/portfolio", icon: "Home" },
        { title: "My Loans", url: "/loans", icon: "FileText" },
      ],
    },
    {
      title: "Actions",
      items: [
        { title: "Request Draw", url: "/loans/draws", icon: "ArrowDown" },
        { title: "Payment History", url: "/loans/payments", icon: "CreditCard" },
      ],
    },
  ];
}
```

## Layout Migration Steps

1. **Create shared layout** (`(shared)/dashboard/layout.tsx`)
   - Move current dashboard layout
   - Add portal detection logic
   - Add portal-aware sidebar

2. **Create portal-specific layouts**
   - `(ops)/layout.tsx` - Wraps ops routes
   - `(investor)/layout.tsx` - Wraps investor routes
   - `(borrower)/layout.tsx` - Wraps borrower routes
   - `(public)/layout.tsx` - Wraps public routes

3. **Update sidebar components**
   - Create `portal-aware-sidebar.tsx`
   - Create `portal-nav-items.ts`
   - Update `nav-main.tsx` to use portal-specific items

4. **Add portal switcher**
   - Create `portal-switcher.tsx` component
   - Add to sidebar header (when multiple portals)

5. **Update navigation logic**
   - Remove hardcoded navigation items
   - Use portal-based navigation configuration

## Testing Checklist

- [ ] Ops portal shows full navigation menu
- [ ] Investor portal shows simplified navigation
- [ ] Borrower portal shows self-service navigation
- [ ] Portal switcher appears for multi-portal users
- [ ] Portal switcher hidden for single-portal users
- [ ] Navigation items link to correct portal routes
- [ ] Layouts maintain consistent styling
- [ ] Sidebar collapses/expands correctly
- [ ] User menu works in all portals
- [ ] Account switcher works in all portals

## Notes

- **Shared Components**: Sidebar components can be shared but navigation items are portal-specific
- **Portal Detection**: Determine portal from pathname prefix (`/ops/`, `/investor/`, `/borrower/`)
- **Fallback**: Default to ops portal if portal cannot be determined
- **Future**: Portal-specific branding/theming could be added later

