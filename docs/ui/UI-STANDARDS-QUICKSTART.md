# UI Standards Quick Start Guide

> **TL;DR**: We've standardized our UI patterns. Use custom hooks for data, shared components for states, and semantic tokens for styling. Everything you need is in `.cursor/rules/ui-standards.md` and `.cursor/templates/`.

## The Four Commandments

1. **NEVER use `fetch` + `useEffect`** → Use custom hooks from `src/hooks/`
2. **NEVER create custom loading/error UI** → Use components from `src/components/shared/`
3. **NEVER hardcode colors/spacing** → Use semantic tokens like `text-foreground`, `bg-muted`
4. **ALWAYS check for existing components** → Before building, check shared components and Storybook

## Quick Reference

### Available Hooks

```tsx
// Import from src/hooks/
import { useLoans } from "@/hooks/useLoans";
import { useBorrowers } from "@/hooks/useBorrowers";
import { useLenders } from "@/hooks/useLenders";
import { useFunds } from "@/hooks/useFunds";
import { useInspections } from "@/hooks/useInspections";
import { usePayments } from "@/hooks/usePayments";
import { useDraws } from "@/hooks/useDraws";
import { useAlerts } from "@/hooks/useAlerts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useProperties } from "@/hooks/useProperties";
```

### Available Components

```tsx
// Import from src/components/shared
import {
  PageLoader,        // ← USE THIS for most cases
  LoadingSpinner,
  ErrorState,
  EmptyState,
  CardSkeleton,
  DashboardLayout,
  MetricCard,
  QuickStats,
} from "@/components/shared";
```

### Common Patterns

#### Pattern 1: Simple Data Fetching

```tsx
import { useLoans } from "@/hooks/useLoans";
import { PageLoader } from "@/components/shared";

function LoansPage() {
  const { data: loans, isLoading, error, refetch } = useLoans();

  return (
    <PageLoader isLoading={isLoading} error={error} isEmpty={!loans?.length}>
      {loans.map(loan => <LoanCard key={loan.id} loan={loan} />)}
    </PageLoader>
  );
}
```

#### Pattern 2: Dashboard Page

```tsx
import { DashboardLayout, PageLoader, MetricCard } from "@/components/shared";
import { useYourData } from "@/hooks/useYourData";

function YourDashboard() {
  const { data, isLoading, error } = useYourData();

  return (
    <DashboardLayout
      title="Dashboard"
      actions={<Button>Action</Button>}
    >
      <PageLoader isLoading={isLoading} error={error}>
        <div className="grid gap-6 md:grid-cols-4">
          <MetricCard title="Total" value={data.total} />
        </div>
      </PageLoader>
    </DashboardLayout>
  );
}
```

#### Pattern 3: Mutations

```tsx
import { useCreateLoan } from "@/hooks/useLoans";

function CreateLoanButton() {
  const createLoan = useCreateLoan();

  const handleCreate = () => {
    createLoan.mutate({
      amount: 100000,
      // ... other fields
    });
    // Toast and cache invalidation happen automatically
  };

  return (
    <Button onClick={handleCreate} disabled={createLoan.isPending}>
      Create Loan
    </Button>
  );
}
```

#### Pattern 4: Semantic Tokens

```tsx
// ✅ CORRECT - Use semantic tokens
<div className="bg-background text-foreground">
  <h1 className="text-2xl font-bold">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>

// ❌ WRONG - Never hardcode
<div className="bg-white text-gray-900">
  <h1 className="text-2xl font-bold">Title</h1>
  <p className="text-gray-600">Description</p>
</div>
```

## Creating New Features

### Step 1: Create Hook (if needed)

```bash
# Copy template
cp .cursor/templates/custom-hook.template.ts src/hooks/useYourEntity.ts

# Edit and replace:
# [YourEntity] → Projects
# [yourEntity] → projects
# [YourType] → Project
```

### Step 2: Create Page

```bash
# Copy template
mkdir -p src/app/(main)/your-feature
cp .cursor/templates/dashboard-page.template.tsx src/app/(main)/your-feature/page.tsx

# Edit and customize
```

### Step 3: Use Shared Components

```tsx
// Always wrap content in PageLoader
<PageLoader isLoading={isLoading} error={error} isEmpty={!data}>
  {/* Your content */}
</PageLoader>

// Use DashboardLayout for dashboard pages
<DashboardLayout title="..." actions={...}>
  {/* Content */}
</DashboardLayout>

// Use CardSkeleton for loading cards
{isLoading && <CardSkeleton variant="metric" />}
```

## Design Token Reference

### Colors

```tsx
// Text colors
text-foreground              // Main text
text-muted-foreground        // Secondary text
text-destructive             // Error text
text-primary                 // Primary colored text

// Background colors
bg-background                // Main background
bg-muted                     // Secondary background
bg-primary                   // Primary colored background
bg-secondary                 // Secondary colored background
bg-destructive               // Error background

// Border colors
border-border                // Default borders
border-primary               // Primary borders
```

### Spacing

Use Tailwind's spacing scale (don't use arbitrary values):

```tsx
p-4                         // 1rem (16px)
gap-6                       // 1.5rem (24px)
space-y-4                   // 1rem vertical spacing
```

### Typography

```tsx
text-sm                     // Small text
text-base                   // Body text
text-lg                     // Large text
text-xl, text-2xl           // Headings
```

## When Things Go Wrong

### "I need to fetch data"

→ Use a custom hook from `src/hooks/` or create one using the template

### "I need to show loading state"

→ Use `<PageLoader>` or `<LoadingSpinner>`

### "I need to show errors"

→ Use `<PageLoader>` or `<ErrorState>`

### "I need empty state"

→ Use `<PageLoader>` or `<EmptyState>`

### "I need a dashboard card"

→ Use `<MetricCard>` or `<StatusMetric>` from shared components

### "I need to mutate data"

→ Use `useCreate*`, `useUpdate*`, `useDelete*` from your entity's hook

### "I'm not sure if a component exists"

→ Check `src/components/shared/` and run `npm run storybook`

## Full Documentation

- **Complete Guide**: [.cursor/rules/ui-standards.md](.cursor/rules/ui-standards.md)
- **Templates**: [.cursor/templates/](.cursor/templates/)
- **Implementation Details**: [.cursor/docs/ui-standardization-implementation.md](.cursor/docs/ui-standardization-implementation.md)
- **Frontend Rules**: [.cursor/rules/frontend.md](.cursor/rules/frontend.md)

## Examples in Codebase

**Best examples to follow**:
- `src/hooks/useFunds.ts` - Perfect hook implementation
- `src/app/(main)/dashboard/funds/page.tsx` - Perfect page implementation
- `src/components/shared/dashboard-layout.tsx` - Dashboard components

## Checklist for New Features

- [ ] Created/used custom hook for data fetching
- [ ] Used `<PageLoader>` for state management
- [ ] Used semantic tokens (no hardcoded colors)
- [ ] Checked for existing components
- [ ] Used `<DashboardLayout>` for dashboard pages
- [ ] Added proper TypeScript types
- [ ] Configured proper cache invalidation
- [ ] Tested loading, error, and empty states

---

**Questions?** Check the full documentation or look at existing implementations.

**Remember**: Consistency makes us fast. Fast makes us productive. Productive makes us happy. 🚀
