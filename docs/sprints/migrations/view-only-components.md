# View-Only Component Requirements for Investor Portal

## Overview

This document details the specific changes required to create view-only variants of fund components for the investor portal. The investor portal should provide read-only access to fund data without any CRUD operations.

## Strategy

1. **Create `usePortalAccess()` hook** for client components to check portal type
2. **Add `viewOnly` prop** to components that need conditional rendering
3. **Conditionally hide/show action buttons** based on portal access
4. **Reuse existing components** with props rather than duplicating code

## Components Requiring Changes

### 1. Fund List Page (`dashboard/funds/page.tsx`)

**Current Location**: `src/app/(main)/dashboard/funds/page.tsx`

**Changes Required**:

1. **"New Fund" Button** (Line 125-128)
   - **Action**: Hide for investor portal
   - **Location**: Header section
   - **Implementation**:
   ```typescript
   const { portalType } = usePortalAccess();
   const canEdit = portalType === "ops";
   
   {canEdit && (
     <Button onClick={() => setIsCreateDialogOpen(true)}>
       <IconPlus size={20} stroke={2} className="mr-2 size-4" />
       New Fund
     </Button>
   )}
   ```

2. **Create Fund Drawer** (Lines 208-222)
   - **Action**: Hide drawer trigger logic for investor portal
   - **Implementation**: Already hidden via button condition above
   - **Note**: Keep drawer component (may be needed for error handling)

3. **Edit Fund Drawer** (Lines 224-240)
   - **Action**: Hide edit drawer for investor portal
   - **Implementation**: Remove edit handlers from columns (see columns.tsx)

4. **Empty State "Create First Fund" Button** (Lines 196-201)
   - **Action**: Hide for investor portal
   - **Implementation**:
   ```typescript
   {canEdit && (
     <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
       <IconPlus size={20} stroke={2} className="mr-2 size-4" />
       Create your first fund
     </Button>
   )}
   ```

**File Changes**:
- Import `usePortalAccess` hook
- Add conditional rendering for all edit/create buttons
- Pass `viewOnly` prop to `createColumns()` function

### 2. Fund Columns (`dashboard/funds/_components/columns.tsx`)

**Current Location**: `src/app/(main)/dashboard/funds/_components/columns.tsx`

**Changes Required**:

1. **Edit Action Button**
   - **Action**: Remove edit action from table columns for investor portal
   - **Implementation**:
   ```typescript
   // Update createColumns signature
   export function createColumns(
     handleEdit: (fund: Fund) => void,
     handleView: (fund: Fund) => void,
     viewOnly: boolean = false
   ) {
     // In column definition:
     {
       id: "actions",
       header: "Actions",
       cell: ({ row }) => {
         if (viewOnly) {
           return (
             <Button variant="ghost" onClick={() => handleView(row.original)}>
               View
             </Button>
           );
         }
         return (
           <div className="flex gap-2">
             <Button variant="ghost" onClick={() => handleEdit(row.original)}>
               Edit
             </Button>
             <Button variant="ghost" onClick={() => handleView(row.original)}>
               View
             </Button>
           </div>
         );
       },
     }
   }
   ```

**File Changes**:
- Add `viewOnly` parameter to `createColumns()` function
- Conditionally render edit button based on `viewOnly` prop

### 3. Fund Detail Page (`dashboard/funds/[fundId]/page.tsx`)

**Current Location**: `src/app/(main)/dashboard/funds/[fundId]/page.tsx`

**Changes Required**:

1. **Pass `viewOnly` prop to all tabs**
   - **Implementation**:
   ```typescript
   const { portalType } = usePortalAccess();
   const viewOnly = portalType === "investor";
   
   <TabsContent value="overview" className="space-y-4">
     <OverviewTab fund={fund} viewOnly={viewOnly} />
   </TabsContent>
   
   <TabsContent value="commitments" className="space-y-4">
     <CommitmentsTab fundId={fund.id} viewOnly={viewOnly} />
   </TabsContent>
   
   {/* ... similar for all tabs */}
   ```

**File Changes**:
- Import `usePortalAccess` hook
- Calculate `viewOnly` boolean
- Pass `viewOnly` prop to all tab components

### 4. Overview Tab (`dashboard/funds/[fundId]/_components/overview-tab.tsx`)

**Current Location**: `src/app/(main)/dashboard/funds/[fundId]/_components/overview-tab.tsx`

**Changes Required**:

1. **"Close Fund" Button**
   - **Action**: Hide AlertDialog with "Close Fund" button for investor portal
   - **Implementation**:
   ```typescript
   interface OverviewTabProps {
     fund: Fund;
     viewOnly?: boolean;
   }
   
   export function OverviewTab({ fund, viewOnly = false }: OverviewTabProps) {
     // ... existing code ...
     
     {!viewOnly && (
       <AlertDialog>
         <AlertDialogTrigger asChild>
           <Button variant="destructive">Close Fund</Button>
         </AlertDialogTrigger>
         {/* ... AlertDialog content ... */}
       </AlertDialog>
     )}
   }
   ```

**File Changes**:
- Add `viewOnly?: boolean` prop
- Conditionally render "Close Fund" button

### 5. Commitments Tab (`dashboard/funds/[fundId]/_components/commitments-tab.tsx`)

**Current Location**: `src/app/(main)/dashboard/funds/[fundId]/_components/commitments-tab.tsx`

**Changes Required**:

1. **"New Commitment" Button** (Header section)
   - **Action**: Hide for investor portal
   - **Implementation**:
   ```typescript
   interface CommitmentsTabProps {
     fundId: string;
     viewOnly?: boolean;
   }
   
   export function CommitmentsTab({ fundId, viewOnly = false }: CommitmentsTabProps) {
     // ... existing code ...
     
     {!viewOnly && (
       <Button onClick={() => setIsAddDrawerOpen(true)}>
         <IconPlus className="mr-2 size-4" />
         New Commitment
       </Button>
     )}
   }
   ```

2. **"Cancel" Action in Table** (Per-row action)
   - **Action**: Remove cancel button from commitment rows
   - **Implementation**: Update table columns to conditionally show cancel button:
   ```typescript
   {
     id: "actions",
     cell: ({ row }) => {
       if (viewOnly) return null;
       return (
         <Button
           variant="ghost"
           onClick={() => handleCancel(row.original.id)}
         >
           Cancel
         </Button>
       );
     },
   }
   ```

3. **Add Commitment Drawer** (Lines 193-207)
   - **Action**: Hide drawer for investor portal
   - **Implementation**: Already hidden via button condition above

**File Changes**:
- Add `viewOnly?: boolean` prop
- Conditionally render "New Commitment" button
- Conditionally render cancel actions in table
- Update commitment table columns to accept `viewOnly` prop

### 6. Calls Tab (`dashboard/funds/[fundId]/_components/calls-tab.tsx`)

**Current Location**: `src/app/(main)/dashboard/funds/[fundId]/_components/calls-tab.tsx`

**Changes Required**:

1. **"New Capital Call" Button** (Header section)
   - **Action**: Hide for investor portal
   - **Implementation**:
   ```typescript
   interface CallsTabProps {
     fundId: string;
     viewOnly?: boolean;
   }
   
   export function CallsTab({ fundId, viewOnly = false }: CallsTabProps) {
     // ... existing code ...
     
     {!viewOnly && (
       <Button onClick={() => setIsIssueDrawerOpen(true)}>
         <IconPlus className="mr-2 size-4" />
         New Capital Call
       </Button>
     )}
   }
   ```

2. **Issue Capital Call Drawer** (Lines 141-155)
   - **Action**: Hide drawer for investor portal
   - **Implementation**: Already hidden via button condition above

**File Changes**:
- Add `viewOnly?: boolean` prop
- Conditionally render "New Capital Call" button

### 7. Allocations Tab (`dashboard/funds/[fundId]/_components/allocations-tab.tsx`)

**Current Location**: `src/app/(main)/dashboard/funds/[fundId]/_components/allocations-tab.tsx`

**Changes Required**:

1. **"Allocate to Loan" Button**
   - **Action**: Hide for investor portal
   - **Implementation**:
   ```typescript
   interface AllocationsTabProps {
     fundId: string;
     viewOnly?: boolean;
   }
   
   export function AllocationsTab({ fundId, viewOnly = false }: AllocationsTabProps) {
     // ... existing code ...
     
     {!viewOnly && (
       <Button onClick={() => setIsAllocateDrawerOpen(true)}>
         <IconPlus className="mr-2 size-4" />
         Allocate to Loan
       </Button>
     )}
   }
   ```

2. **Allocation Drawer**
   - **Action**: Hide drawer for investor portal
   - **Implementation**: Already hidden via button condition above

**File Changes**:
- Add `viewOnly?: boolean` prop
- Conditionally render "Allocate to Loan" button

### 8. Distributions Tab (`dashboard/funds/[fundId]/_components/distributions-tab.tsx`)

**Current Location**: `src/app/(main)/dashboard/funds/[fundId]/_components/distributions-tab.tsx`

**Changes Required**:

1. **"New Distribution" Button**
   - **Action**: Hide for investor portal
   - **Implementation**:
   ```typescript
   interface DistributionsTabProps {
     fundId: string;
     viewOnly?: boolean;
   }
   
   export function DistributionsTab({ fundId, viewOnly = false }: DistributionsTabProps) {
     // ... existing code ...
     
     {!viewOnly && (
       <Button onClick={() => setIsNewDistributionOpen(true)}>
         <IconPlus className="mr-2 size-4" />
         New Distribution
       </Button>
     )}
   }
   ```

2. **New Distribution Drawer/Form**
   - **Action**: Hide for investor portal
   - **Implementation**: Already hidden via button condition above

**File Changes**:
- Add `viewOnly?: boolean` prop
- Conditionally render "New Distribution" button

## Implementation: `usePortalAccess()` Hook

**Location**: `src/hooks/usePortalAccess.ts`

**Purpose**: Client-side hook to check portal access and type for conditional rendering

**Implementation**:
```typescript
"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import type { PortalType } from "@/db/schema/portal-roles";

interface PortalAccess {
  portalType: PortalType | null;
  canEdit: boolean;
  role: string | null;
}

export function usePortalAccess(): PortalAccess {
  const { data: session } = useSession();
  const [portalAccess, setPortalAccess] = useState<PortalAccess>({
    portalType: null,
    canEdit: false,
    role: null,
  });

  useEffect(() => {
    if (!session?.user?.id || !session.organizationId) {
      return;
    }

    // Fetch portal access from API
    fetch(`/api/auth/portal-access`)
      .then((res) => res.json())
      .then((data) => {
        // Determine current portal type from pathname
        const pathname = window.location.pathname;
        let portalType: PortalType | null = null;
        
        if (pathname.startsWith("/dashboard/funds")) {
          // Check if user has investor access for fund routes
          portalType = data.portals.includes("investor") ? "investor" : "ops";
        } else if (pathname.startsWith("/ops/")) {
          portalType = "ops";
        } else if (pathname.startsWith("/investor/")) {
          portalType = "investor";
        } else if (pathname.startsWith("/borrower/")) {
          portalType = "borrower";
        }

        const canEdit = portalType === "ops";
        const role = data.portals.find((p: any) => p.portalType === portalType)?.role || null;

        setPortalAccess({ portalType, canEdit, role });
      })
      .catch((error) => {
        console.error("Failed to fetch portal access:", error);
      });
  }, [session]);

  return portalAccess;
}
```

**Alternative**: Server-side approach (recommended)

Create API endpoint `/api/auth/portal-access`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserPortalAccess } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  const session = await getSession();
  
  if (!session || !session.organizationId) {
    return NextResponse.json({ portals: [] }, { status: 401 });
  }

  const portalAccess = await getUserPortalAccess(
    session.userId,
    session.organizationId
  );

  return NextResponse.json({ portals: portalAccess });
}
```

## Component Pattern Summary

All fund components should follow this pattern:

```typescript
interface ComponentProps {
  // ... existing props
  viewOnly?: boolean; // Add this prop
}

export function Component({ viewOnly = false, ...props }: ComponentProps) {
  // ... existing logic
  
  return (
    <div>
      {/* Always visible content */}
      <div>Read-only content</div>
      
      {/* Conditionally visible actions */}
      {!viewOnly && (
        <Button onClick={handleAction}>
          Action Button
        </Button>
      )}
    </div>
  );
}
```

## Testing Checklist

After implementing view-only variants:

- [ ] Investor portal fund list page has no "New Fund" button
- [ ] Investor portal fund list table has no edit actions
- [ ] Investor portal fund detail page has no "Close Fund" button
- [ ] Investor portal commitments tab has no "New Commitment" button
- [ ] Investor portal commitments tab has no "Cancel" actions
- [ ] Investor portal calls tab has no "New Capital Call" button
- [ ] Investor portal allocations tab has no "Allocate to Loan" button
- [ ] Investor portal distributions tab has no "New Distribution" button
- [ ] Ops portal retains all existing functionality
- [ ] `usePortalAccess()` hook correctly identifies portal type
- [ ] Components gracefully handle missing portal access

## Migration Path

1. **Phase 1**: Create `usePortalAccess()` hook and API endpoint
2. **Phase 2**: Add `viewOnly` prop to all fund components
3. **Phase 3**: Update fund list page to use hook and pass props
4. **Phase 4**: Update fund detail page to pass props to tabs
5. **Phase 5**: Update each tab component individually
6. **Phase 6**: Test investor portal access to verify all actions hidden
7. **Phase 7**: Test ops portal access to verify all actions visible

