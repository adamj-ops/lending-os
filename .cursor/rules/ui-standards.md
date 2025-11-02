# UI Standards & Best Practices

> **Purpose**: This document defines UI standards for the Lending OS project to ensure consistency, maintainability, and optimal user experience across all features.

## Table of Contents
1. [Data Fetching](#data-fetching)
2. [Loading & Error States](#loading--error-states)
3. [Design Tokens](#design-tokens)
4. [Component Discovery](#component-discovery)
5. [File Organization](#file-organization)

---

## Data Fetching

### ✅ DO: Use Custom Hooks with React Query

**Always use custom `useQuery` hooks for data fetching. Never use ad-hoc `fetch` + `useEffect` patterns.**

```tsx
// ✅ CORRECT - Use custom hooks
import { useLoans } from "@/hooks/useLoans";

function LoansPage() {
  const { data: loans, isLoading, error, refetch } = useLoans();

  return (
    <PageLoader isLoading={isLoading} error={error} isEmpty={loans?.length === 0}>
      <LoansList loans={loans} />
    </PageLoader>
  );
}
```

```tsx
// ❌ WRONG - Never do this
function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/v1/loans')
      .then(res => res.json())
      .then(data => setLoans(data))
      .catch(err => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  // ...
}
```

### Available Custom Hooks

All data fetching hooks are located in `/src/hooks/`:

- `useLoans()` - Fetch loans
- `useBorrowers()` - Fetch borrowers
- `useLenders()` - Fetch lenders
- `useFunds()` - Fetch funds
- `useInspections()` - Fetch inspections
- `usePayments()` - Fetch payments
- `useDraws()` - Fetch draws
- `useAlerts()` - Fetch alerts (with polling support)
- `useAnalytics()` - Fetch analytics data
- `useProperties()` - Fetch properties

### Creating New Hooks

When you need to fetch new data types, create a new hook following this pattern:

```tsx
// src/hooks/useYourData.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useYourData = (params?: { filter?: string }) => {
  return useQuery({
    queryKey: ["your-data", params],
    queryFn: async () => {
      const response = await fetch('/api/v1/your-endpoint');
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json();
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

export const useCreateYourData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/v1/your-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["your-data"] });
      toast.success("Created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
```

### Query Configuration Guidelines

- **staleTime**: Set to 30000ms (30 sec) for frequently changing data, 60000ms (1 min) for metrics/analytics
- **refetchOnWindowFocus**: Use `true` for real-time data, `false` for analytics
- **refetchInterval**: Only for polling (alerts, real-time updates)
- **enabled**: Use for dependent queries that should only run when ready

---

## Loading & Error States

### ✅ DO: Use Shared State Components

**Always use the shared loading/error/empty state components for consistency.**

### Available Components

Import from `@/components/shared`:

#### 1. **PageLoader** (Recommended for most cases)

Handles loading, error, and empty states automatically:

```tsx
import { PageLoader } from "@/components/shared";

<PageLoader
  isLoading={isLoading}
  error={error}
  isEmpty={data.length === 0}
  emptyTitle="No loans found"
  emptyMessage="Get started by creating your first loan"
  emptyAction={{ label: "Create Loan", onClick: () => setOpen(true) }}
  onRetry={refetch}
>
  <YourContent data={data} />
</PageLoader>
```

#### 2. **LoadingSpinner**

For inline loading indicators:

```tsx
import { LoadingSpinner } from "@/components/shared";

<LoadingSpinner size="lg" label="Loading loans..." />
<LoadingSpinner fullScreen /> // For full-page loading
```

Variants:
- `size`: `"sm"` | `"md"` | `"lg"` | `"xl"`
- `variant`: `"primary"` | `"secondary"` | `"muted"` | `"destructive"`

#### 3. **ErrorState**

For displaying errors:

```tsx
import { ErrorState } from "@/components/shared";

<ErrorState
  title="Failed to load loans"
  message={error.message}
  onRetry={refetch}
/>
```

#### 4. **EmptyState**

For empty data:

```tsx
import { EmptyState } from "@/components/shared";

<EmptyState
  title="No loans found"
  message="Get started by creating your first loan"
  action={{ label: "Create Loan", onClick: openDialog }}
  icon={<IconInbox />}
/>
```

#### 5. **CardSkeleton**

For loading cards:

```tsx
import { CardSkeleton, GridCardSkeletons } from "@/components/shared";

<CardSkeleton variant="metric" />
<CardSkeleton variant="table" rows={5} />
<GridCardSkeletons count={4} variant="metric" />
```

### ❌ DON'T: Create Custom Loading UI

```tsx
// ❌ WRONG - Don't create custom spinners
if (isLoading) {
  return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />;
}

// ❌ WRONG - Don't create custom error states
if (error) {
  return (
    <div className="text-red-500">
      <AlertCircle />
      <p>Error: {error.message}</p>
    </div>
  );
}

// ✅ CORRECT - Use PageLoader
return (
  <PageLoader isLoading={isLoading} error={error} isEmpty={!data}>
    <YourContent data={data} />
  </PageLoader>
);
```

---

## Design Tokens

### ✅ DO: Use Semantic Tokens

**Always use semantic design tokens from Tailwind/CSS variables. Never hardcode colors or spacing.**

### Color Tokens

```tsx
// ✅ CORRECT - Use semantic tokens
className="text-foreground"          // Primary text
className="text-muted-foreground"    // Secondary text
className="bg-background"            // Background
className="bg-muted"                 // Muted background
className="bg-primary"               // Primary color
className="bg-secondary"             // Secondary color
className="text-destructive"         // Error/danger
className="border-border"            // Borders

// ❌ WRONG - Never hardcode colors
className="text-gray-900"
className="text-gray-600"
className="bg-blue-600"
className="text-red-500"
```

### Spacing Tokens

```tsx
// ✅ CORRECT - Use Tailwind's spacing scale
className="p-4"      // 1rem (16px)
className="gap-6"    // 1.5rem (24px)
className="space-y-4"

// ❌ WRONG - Avoid arbitrary values unless absolutely necessary
className="p-[17px]"
className="gap-[23px]"
```

### Typography Tokens

```tsx
// ✅ CORRECT - Use semantic text sizes
className="text-sm"      // Small text
className="text-base"    // Body text
className="text-lg"      // Large text
className="text-2xl font-bold"  // Headings

// ❌ WRONG - Arbitrary font sizes
className="text-[15px]"
className="text-[22px]"
```

### Common Patterns

```tsx
// Card headers
<h3 className="text-lg font-semibold text-foreground">

// Card descriptions
<p className="text-sm text-muted-foreground">

// Buttons already use semantic tokens via variants
<Button variant="default">  // Uses primary colors
<Button variant="destructive">  // Uses destructive colors
<Button variant="outline">  // Uses border colors
```

---

## Component Discovery

### ✅ DO: Check Existing Components First

**Before creating new components, check:**

1. **shadcn/ui components** (`src/components/ui/`)
2. **Shared components** (`src/components/shared/`)
3. **Storybook** (run `npm run storybook`)

### Shared Component Library

Located in `src/components/shared/`:

**Layout & Structure:**
- `DashboardLayout` - Standard dashboard page wrapper
- `MetricCard` - Metric display cards
- `StatusMetric` - Status breakdown cards
- `QuickStats` - Quick stat grid

**State Management:**
- `PageLoader` - Loading/error/empty wrapper
- `LoadingSpinner` - Loading indicators
- `ErrorState` - Error displays
- `EmptyState` - Empty state displays
- `CardSkeleton` - Loading skeletons

### Dashboard Pattern

```tsx
import {
  DashboardLayout,
  MetricCard,
  QuickStats,
  PageLoader,
} from "@/components/shared";

function YourDashboard() {
  const { data, isLoading, error } = useYourData();

  return (
    <DashboardLayout
      title="Your Dashboard"
      subtitle="Overview of your data"
      actions={<Button>Action</Button>}
    >
      <PageLoader isLoading={isLoading} error={error}>
        <QuickStats stats={quickStats} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total" value={data.total} />
          {/* More cards */}
        </div>
      </PageLoader>
    </DashboardLayout>
  );
}
```

---

## File Organization

### Hooks
- Location: `src/hooks/`
- Naming: `use[EntityName].ts` (e.g., `useLoans.ts`)
- Pattern: Export multiple hooks per entity (get, create, update, delete)

### Components
- **Pages**: `src/app/(main)/[feature]/page.tsx`
- **Feature components**: `src/app/(main)/[feature]/_components/`
- **Shared components**: `src/components/shared/`
- **UI primitives**: `src/components/ui/` (shadcn)

### Types
- **Shared types**: `src/types/`
- **Feature types**: Co-located with hooks or in types directory

---

## Checklist for New Features

When building a new feature, follow this checklist:

- [ ] Create custom hook(s) in `src/hooks/` using React Query
- [ ] Use `PageLoader` for loading/error/empty states
- [ ] Use semantic design tokens (no hardcoded colors/spacing)
- [ ] Check `src/components/shared/` for existing components
- [ ] Use `DashboardLayout` for dashboard pages
- [ ] Add proper TypeScript types
- [ ] Test with Storybook (if creating reusable components)
- [ ] Use optimistic updates for mutations where appropriate
- [ ] Configure appropriate `staleTime` and cache invalidation

---

## Examples

### Complete Feature Example

```tsx
// src/hooks/useProjects.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch('/api/v1/projects');
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    staleTime: 30000,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created");
    },
  });
};
```

```tsx
// src/app/(main)/projects/page.tsx
"use client";

import { useState } from "react";
import { DashboardLayout, PageLoader, MetricCard } from "@/components/shared";
import { useProjects, useCreateProject } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";

export default function ProjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: projects, isLoading, error, refetch } = useProjects();
  const createProject = useCreateProject();

  return (
    <DashboardLayout
      title="Projects"
      subtitle="Manage your projects"
      actions={
        <Button onClick={() => setIsDialogOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      }
    >
      <PageLoader
        isLoading={isLoading}
        error={error}
        isEmpty={projects?.length === 0}
        emptyTitle="No projects found"
        emptyMessage="Create your first project to get started"
        emptyAction={{ label: "Create Project", onClick: () => setIsDialogOpen(true) }}
        onRetry={refetch}
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Projects"
            value={projects?.length || 0}
            icon={<IconFolder />}
          />
          {/* More content */}
        </div>
      </PageLoader>
    </DashboardLayout>
  );
}
```

---

## Questions?

If you're unsure about the correct pattern to use:
1. Check this document
2. Look at existing implementations (especially `useFunds.ts` and funds page)
3. Check Storybook for component examples
4. Refer to `.cursor/rules/frontend.md` for general frontend rules

**Remember: Consistency is key. When in doubt, follow existing patterns.**
