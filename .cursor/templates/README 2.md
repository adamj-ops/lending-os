# Development Templates

This directory contains templates to help you create new features following the project's UI standards.

## Available Templates

### 1. Custom Hook Template (`custom-hook.template.ts`)

Use this template when creating new data fetching hooks.

**Location**: Copy to `src/hooks/use[YourEntity].ts`

**Example**:
```bash
# Create a new hook for Projects
cp .cursor/templates/custom-hook.template.ts src/hooks/useProjects.ts

# Then edit and replace:
# [YourEntity] → Projects
# [yourEntity] → projects
# [YourType] → Project
```

**What it includes**:
- Fetch all items with filtering
- Fetch single item by ID
- Create mutation
- Update mutation
- Delete mutation
- Proper React Query configuration
- Toast notifications
- Cache invalidation

### 2. Dashboard Page Template (`dashboard-page.template.tsx`)

Use this template when creating new dashboard pages.

**Location**: Copy to `src/app/(main)/[feature]/page.tsx`

**Example**:
```bash
# Create a new projects page
mkdir -p src/app/(main)/projects
cp .cursor/templates/dashboard-page.template.tsx src/app/(main)/projects/page.tsx

# Then edit and replace:
# [YourFeature] → Projects
# [yourEntity] → projects
# [YourIcon] → FolderOpen
```

**What it includes**:
- DashboardLayout wrapper
- PageLoader for state management
- QuickStats section
- Metric cards grid
- Main content area
- Empty state handling
- Action buttons

### 3. Storybook Story Template (`component.stories.template.tsx`)

Use this template when creating Storybook stories for components.

**Location**: Copy next to your component as `[ComponentName].stories.tsx`

**Example**:
```bash
# Create stories for a new component
cp .cursor/templates/component.stories.template.tsx src/components/shared/MyComponent.stories.tsx

# Then edit and replace:
# [ComponentName] → MyComponent
# [componentName] → myComponent
# [Category] → Shared
```

**What it includes**:
- Meta configuration
- Default story
- Loading state
- Error state
- Empty state
- With data state
- Different variants
- Disabled state

## Quick Start Guide

### Creating a New Feature

Follow these steps to create a complete new feature:

1. **Create the custom hook**:
```bash
cp .cursor/templates/custom-hook.template.ts src/hooks/useYourEntity.ts
# Edit and customize the hook
```

2. **Create the dashboard page**:
```bash
mkdir -p src/app/(main)/your-feature
cp .cursor/templates/dashboard-page.template.tsx src/app/(main)/your-feature/page.tsx
# Edit and customize the page
```

3. **Create Storybook stories** (optional):
```bash
cp .cursor/templates/component.stories.template.tsx src/components/shared/YourComponent.stories.tsx
# Edit and customize the stories
```

## Best Practices

When using these templates:

1. **Always follow the naming conventions**:
   - Hooks: `use[EntityName]` (e.g., `useProjects`, `useLoans`)
   - Pages: `[feature]/page.tsx`
   - Stories: `[ComponentName].stories.tsx`

2. **Update imports**:
   - Import your types
   - Import icons from `@tabler/icons-react`
   - Import shared components from `@/components/shared`

3. **Remove unused code**:
   - Delete hooks you don't need (e.g., delete mutations if read-only)
   - Remove sections in the dashboard that don't apply
   - Keep only relevant story variants

4. **Follow UI standards**:
   - Use semantic design tokens (see `.cursor/rules/ui-standards.md`)
   - Use shared state components (PageLoader, LoadingSpinner, etc.)
   - Never use fetch + useEffect directly

5. **Test your implementation**:
   - Verify loading states work
   - Test error handling
   - Check empty states
   - Ensure mutations invalidate caches properly

## Reference Documentation

- [UI Standards](.cursor/rules/ui-standards.md) - Complete UI guidelines
- [Frontend Rules](.cursor/rules/frontend.md) - General frontend patterns
- [shadcn Usage](.cursor/rules/shadcn-usage.md) - Component library usage

## Need Help?

If you're unsure about implementation:
1. Check the documentation above
2. Look at existing implementations (especially `useFunds.ts` and the funds page)
3. Run Storybook to see component examples: `npm run storybook`
4. Review the UI standards document

## Template Updates

These templates are living documents. If you find better patterns or discover missing pieces:
1. Update the template
2. Document the change in this README
3. Consider updating existing implementations to match

---

**Remember**: These templates are starting points. Customize them for your specific needs while maintaining consistency with the project's UI standards.
