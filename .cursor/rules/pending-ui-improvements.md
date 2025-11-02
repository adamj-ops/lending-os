# Pending UI Improvements

> **Purpose**: This document tracks pending UI standardization work. Cursor agents should proactively reference this when working on related features.

## ⚠️ IMPORTANT: When to Reference This Document

Cursor agents should check this file when:
- Working on any component mentioned in the "Refactoring Needed" section
- Creating new dashboard pages or features
- Implementing design tokens or styling
- Setting up Storybook stories

---

## 🔴 HIGH PRIORITY: Component Refactoring

The following components use old `fetch + useEffect` patterns and MUST be migrated to use the new custom hooks.

### Immediate Refactoring Needed

**When working on these files, ALWAYS refactor them to use the new hooks:**

#### 1. Inspection Dashboard
- **File**: `src/components/dashboard/inspection-dashboard.tsx`
- **Current**: Lines 49-75 use manual `fetch` + `useEffect`
- **Fix**: Replace with `useInspections()` and `useInspectionMetrics()` from `src/hooks/useInspections.ts`
- **Replace loading/error UI** with `<PageLoader>`

#### 2. Payment Dashboard
- **File**: `src/components/dashboard/payment-dashboard.tsx`
- **Current**: Lines 32-70 use manual `fetch` + `useEffect`
- **Fix**: Replace with `usePayments()` and `usePaymentMetrics()` from `src/hooks/usePayments.ts`
- **Replace loading/error UI** with `<PageLoader>`

#### 3. Alert Feed
- **File**: `src/components/alerts/alert-feed.tsx`
- **Current**: Lines 101-116 use manual `fetch` with polling
- **Fix**: Replace with `useAlerts({ refetchInterval: 30000 })` from `src/hooks/useAlerts.ts`
- **Use optimistic updates**: `useMarkAlertAsRead()` already has optimistic updates built-in
- **Replace loading/error UI** with `<PageLoader>` or inline `<LoadingSpinner>`

#### 4. Draw Dashboard
- **File**: `src/components/dashboard/draw-dashboard.tsx`
- **Current**: Uses manual fetch patterns
- **Fix**: Replace with `useDraws()` and `useDrawMetrics()` from `src/hooks/useDraws.ts`
- **Replace loading/error UI** with `<PageLoader>`

#### 5. Analytics Filters
- **File**: `src/components/analytics/analytics-filters.tsx`
- **Current**: Lines 56-82 use `useEffect` with `Promise.all`
- **Fix**: Replace with individual hooks from `src/hooks/useAnalytics.ts`:
  - `useLoanAnalytics()`
  - `usePortfolioAnalytics()`
  - `useFinancialMetrics()`
- **Note**: React Query will batch these requests automatically

#### 6. Properties Page
- **File**: `src/app/(main)/dashboard/properties/page.tsx`
- **Current**: Uses manual fetch patterns
- **Fix**: Replace with `useProperties()` and `usePropertyMetrics()` from `src/hooks/useProperties.ts`
- **Replace loading/error UI** with `<PageLoader>`

#### 7. Mobile Inspection App
- **File**: `src/components/inspections/mobile-inspection-app.tsx`
- **Current**: Manual fetch patterns
- **Fix**: Replace with `useInspections()` and `useUpdateInspection()` from `src/hooks/useInspections.ts`

#### 8-10. AI Components
- **File**: `src/components/ai/floating-chat.tsx` (lines 45-100)
- **File**: `src/components/ai/draw-risk-assessment.tsx`
- **File**: `src/components/ai/payment-analysis.tsx`
- **Current**: Manual fetch patterns for data
- **Fix**: Use appropriate hooks (`useDraws`, `usePayments`, etc.) for data fetching
- **Note**: AI-specific endpoints may need custom hooks

### Refactoring Template

When refactoring a component, follow this pattern:

```tsx
// ❌ BEFORE (OLD PATTERN - DON'T DO THIS)
const [data, setData] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetch('/api/v1/inspections')
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => setError(err))
    .finally(() => setIsLoading(false));
}, []);

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;

// ✅ AFTER (NEW PATTERN - USE THIS)
import { useInspections } from "@/hooks/useInspections";
import { PageLoader } from "@/components/shared";

const { data, isLoading, error, refetch } = useInspections();

return (
  <PageLoader isLoading={isLoading} error={error} isEmpty={!data?.length} onRetry={refetch}>
    {/* Your content */}
  </PageLoader>
);
```

---

## 🟡 MEDIUM PRIORITY: Design Token System

### Phase 3 Implementation Needed

**When working on styling, implement these token improvements:**

#### 1. Extend `src/app/globals.css`

Add these CSS variables:

```css
:root {
  /* Spacing scale */
  --spacing-xs: 0.25rem;  /* 4px */
  --spacing-sm: 0.5rem;   /* 8px */
  --spacing-md: 1rem;     /* 16px */
  --spacing-lg: 1.5rem;   /* 24px */
  --spacing-xl: 2rem;     /* 32px */
  --spacing-2xl: 3rem;    /* 48px */

  /* Typography scale */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */

  /* Elevation/Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### 2. Create `src/styles/tokens.ts`

```typescript
/**
 * Design tokens as TypeScript constants
 * Use for programmatic access to design values
 */

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
} as const;

export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
} as const;

// Add more as needed
```

#### 3. Audit Components for Hardcoded Values

**Components with hardcoded colors (MUST FIX when touched):**

Search and replace patterns:
- `text-gray-900` → `text-foreground`
- `text-gray-600` → `text-muted-foreground`
- `text-gray-500` → `text-muted-foreground`
- `bg-gray-100` → `bg-muted`
- `bg-gray-200` → `bg-muted`
- `bg-white` → `bg-background`
- `border-gray-200` → `border-border`
- `text-blue-600` → `text-primary`
- `text-red-500` → `text-destructive`
- `text-green-600` → `text-green-600` (keep for semantic colors like success)

**Files known to have hardcoded colors:**
- `src/components/dashboard/inspection-dashboard.tsx` (lines 196-214, 249, 260-261)
- `src/components/shared/dashboard-layout.tsx` (various lines)
- Many dashboard components

**Search command to find violations:**
```bash
# Find hardcoded gray colors
grep -r "text-gray-\|bg-gray-" src/components/ src/app/

# Find hardcoded blue colors (non-semantic)
grep -r "text-blue-\|bg-blue-" src/components/ src/app/
```

---

## 🟢 LOW PRIORITY: Storybook & Visual Regression

### Phase 4 Implementation

**When creating reusable components, add Storybook stories:**

#### Stories Needed

1. **Dashboard Components** (`src/components/shared/dashboard-layout.tsx`):
   - `MetricCard.stories.tsx`
   - `StatusMetric.stories.tsx`
   - `QuickStats.stories.tsx`
   - `DashboardLayout.stories.tsx`

2. **State Components** (`src/components/shared/`):
   - `LoadingSpinner.stories.tsx`
   - `ErrorState.stories.tsx`
   - `EmptyState.stories.tsx`
   - `PageLoader.stories.tsx`
   - `CardSkeleton.stories.tsx`

3. **Form Components**:
   - `FundForm.stories.tsx`
   - `LenderForm.stories.tsx`
   - `BorrowerForm.stories.tsx`

4. **UI Primitives** (`src/components/ui/`):
   - Document existing shadcn components in Storybook

#### Template Usage

Use `.cursor/templates/component.stories.template.tsx` as starting point.

#### Chromatic Setup

1. Configure Chromatic in `.storybook/main.ts` (already has addon)
2. Add Chromatic script to `package.json`:
   ```json
   "chromatic": "chromatic --project-token=<TOKEN>"
   ```
3. Set up GitHub Actions for visual regression on PRs

---

## 📋 Checklist for Cursor Agents

When working on UI components, check:

- [ ] Does this component fetch data?
  - If YES: Use custom hooks from `src/hooks/`
  - If NO hook exists: Create one using `.cursor/templates/custom-hook.template.ts`

- [ ] Does this component show loading/error/empty states?
  - If YES: Use `<PageLoader>` from `src/components/shared`
  - Never create custom loading spinners

- [ ] Does this component use colors or spacing?
  - If YES: Use semantic tokens only (`text-foreground`, not `text-gray-900`)
  - Check `.cursor/rules/ui-standards.md` for token list

- [ ] Is this a new dashboard page?
  - If YES: Use `.cursor/templates/dashboard-page.template.tsx`
  - Use `<DashboardLayout>` wrapper

- [ ] Is this a reusable component?
  - If YES: Consider adding Storybook story
  - Use `.cursor/templates/component.stories.template.tsx`

---

## 🎯 Progress Tracking

### Completed ✅
- [x] 6 custom hooks created (inspections, payments, draws, alerts, analytics, properties)
- [x] 5 shared state components created
- [x] Documentation written (ui-standards.md, quickstart)
- [x] Templates created (hook, page, story)
- [x] Frontend rules updated

### In Progress 🟡
- [ ] 0/10+ components refactored to use new hooks
- [ ] 0% design token adoption
- [ ] 0 Storybook stories created

### Not Started 🔴
- [ ] Design token system in globals.css
- [ ] tokens.ts utility file
- [ ] Chromatic configuration
- [ ] CI/CD integration

---

## 🚨 Common Mistakes to Avoid

1. **DON'T create new loading spinners**
   - Use `<LoadingSpinner>` from shared components

2. **DON'T use fetch + useEffect**
   - Always use custom hooks with React Query

3. **DON'T hardcode colors**
   - Use semantic tokens: `text-foreground`, `bg-muted`, etc.

4. **DON'T skip PageLoader**
   - It handles loading, error, and empty states automatically

5. **DON'T forget cache invalidation**
   - Mutations should invalidate relevant queries

---

## 📚 References

- **Full Standards**: `.cursor/rules/ui-standards.md`
- **Quick Start**: `UI-STANDARDS-QUICKSTART.md`
- **Implementation Details**: `.cursor/docs/ui-standardization-implementation.md`
- **Templates**: `.cursor/templates/`
- **Best Example**: `src/hooks/useFunds.ts` and `src/app/(main)/dashboard/funds/page.tsx`

---

**Last Updated**: 2025-10-28
**Update this file as work progresses and new patterns emerge.**
