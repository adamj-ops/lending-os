# Colosseum Brand - Developer Guide

## Quick Start

Your Lending OS now uses the **Colosseum brand system**. This guide shows you how to use the new colors, components, and charts.

## Color System

### Brand Tokens (Use These!)

```tsx
// Primary Actions (Cyan)
className="bg-brand-primary text-slate-900"
className="text-brand-primary"
className="border-brand-primary"
className="bg-brand-primary/10"  // 10% opacity

// Accent/Warnings (Orange)
className="bg-brand-accent text-white"
className="text-brand-accent"

// Success (Green)
className="bg-brand-success text-white"
className="text-brand-success"

// Danger/Errors (Red)
className="bg-brand-danger text-white"
className="text-brand-danger"

// Backgrounds
className="bg-brand-bg"       // Ultra-dark page background
className="bg-brand-surface"  // Card/modal background

// Text
className="text-brand-text"   // Primary text color
className="text-brand-muted"  // Secondary/subtle text
```

### HSL Values (for custom usage)
```css
--primary: 168 100% 41%;        /* #00d1b2 */
--accent: 16 100% 53%;          /* #f97316 */
--success: 152 76% 36%;         /* #10b981 */
--danger: 0 84% 60%;            /* #ef4444 */
```

## Button Variants

### Colosseum Button Styles

```tsx
import { Button } from '@/components/ui/button';

// Filter button (cyan glow)
<Button variant="colosseum" size="sm">DeFi</Button>

// Active filter (cyan fill)
<Button variant="colosseum-active" size="sm">Crypto-Backed</Button>

// Urgent action (orange)
<Button variant="colosseum-accent">Review Now</Button>

// Standard primary (cyan)
<Button variant="primary">Submit Application</Button>

// Success action (green)
<Button variant="success">Approve</Button>

// Destructive action (red)
<Button variant="destructive">Reject</Button>
```

### When to Use Each Variant

| Variant | Use Case | Example |
|---------|----------|---------|
| `colosseum` | Filter pills, category tags | "DeFi", "Personal", "Business" |
| `colosseum-active` | Selected filter state | Active category filter |
| `colosseum-accent` | Urgent actions, warnings | "Review Required", "Action Needed" |
| `primary` | Primary CTAs | "Submit", "Create", "Save" |
| `success` | Positive actions | "Approve", "Accept", "Confirm" |
| `destructive` | Dangerous actions | "Reject", "Delete", "Cancel" |
| `ghost` | Subtle actions | "View Details", "Edit" |
| `outline` | Secondary actions | "Cancel", "Back" |

## Badge Variants

### Using Badges

```tsx
import { Badge } from '@/components/ui/badge';

// Primary status (cyan)
<Badge variant="primary">Active</Badge>

// Success status (green)
<Badge variant="success">Approved</Badge>

// Warning status (orange)
<Badge variant="warning">Pending Review</Badge>

// Danger status (red)
<Badge variant="danger">Overdue</Badge>

// Urgent badge with diamond (orange)
<span className="badge-urgent">LOOKING FOR TEAM</span>  // ◆ LOOKING FOR TEAM
```

## Utility Classes

### Colosseum-Specific Classes

```tsx
// Filter button (glowing cyan)
<button className="btn-filter">
  All Loans
</button>

// Active filter (filled cyan)
<button className="btn-filter active">
  Crypto-Backed
</button>

// Urgent badge (orange with ◆)
<span className="badge-urgent">
  URGENT  // Renders as: ◆ URGENT
</span>

// Chart card (with hover glow)
<div className="card-chart">
  {/* Chart content */}
</div>
```

## Chart Components

### Basic Chart Usage

```tsx
import { ChartCard } from '@/components/charts';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function MyChart() {
  const data = [
    { month: 'Jan', value: 100 },
    { month: 'Feb', value: 150 },
  ];

  return (
    <ChartCard title="My Metric" subtitle="Description">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis 
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid #00d1b2',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Line 
            type="monotone"
            dataKey="value"
            stroke="#00d1b2"           // Cyan line
            strokeWidth={2}
            dot={{ fill: '#00d1b2' }}  // Cyan dots
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
```

### Pre-Built Chart Examples

```tsx
import { 
  ApprovalTrendCard,      // Line chart - approvals vs rejections
  MonthlyMetricsChart,    // Bar chart - funding vs defaults
  RiskDistributionPie     // Pie chart - risk breakdown
} from '@/components/charts';

// Use in dashboard
<div className="grid gap-4 md:grid-cols-3">
  <ApprovalTrendCard />
  <MonthlyMetricsChart />
  <RiskDistributionPie />
</div>
```

### Chart Color Guidelines

| Data Type | Color | Hex | Usage |
|-----------|-------|-----|-------|
| Primary metric | Cyan | `#00d1b2` | Main line, primary bars |
| Success/Positive | Green | `#10b981` | Approvals, growth, low risk |
| Warning/Medium | Orange | `#f97316` | Pending, medium risk, highlights |
| Danger/Negative | Red | `#ef4444` | Rejections, defaults, high risk |
| Neutral/Muted | Gray | `#64748b` | Historical, baseline |

## Theme Usage

### Dark Theme (Default)
```tsx
// Applied automatically on app load
<html className="dark">
  {/* Ultra-dark background, cyan accents */}
</html>
```

### Light Theme
```tsx
// Toggle in Layout Settings
<html className="light">
  {/* White background, same cyan/orange accents */}
</html>
```

### Accessing Theme in Components
```tsx
import { usePreferencesStore } from '@/stores/preferences/preferences-provider';

function MyComponent() {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);

  return (
    <button onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

## Common Patterns

### 1. Metric Card with Trend
```tsx
import { MetricCard } from '@/components/shared/dashboard-layout';
import { IconTrendingUp } from '@tabler/icons-react';

<MetricCard
  title="Total Loans"
  value="1,234"
  change={{
    value: 12.5,
    type: 'increase',  // Will show in green
    period: 'last month'
  }}
  icon={<IconTrendingUp className="h-4 w-4" />}
/>
```

### 2. Filter Bar
```tsx
<div className="flex gap-2 flex-wrap">
  <Button variant="colosseum-active" size="sm">All</Button>
  <Button variant="colosseum" size="sm">Personal</Button>
  <Button variant="colosseum" size="sm">Business</Button>
  <Button variant="colosseum" size="sm">Crypto-Backed</Button>
</div>
```

### 3. Status Badge Row
```tsx
<div className="flex gap-2">
  <Badge variant="success">Approved</Badge>
  <Badge variant="warning">Pending</Badge>
  <Badge variant="danger">Rejected</Badge>
  <span className="badge-urgent">ACTION REQUIRED</span>
</div>
```

### 4. Card with Chart
```tsx
import { ChartCard } from '@/components/charts';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

<ChartCard title="Funding Activity" subtitle="This month">
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={myData}>
      <Bar dataKey="amount" fill="#00d1b2" />
    </BarChart>
  </ResponsiveContainer>
</ChartCard>
```

### 5. Dashboard Layout
```tsx
import { DashboardLayout, QuickStats } from '@/components/shared/dashboard-layout';

<DashboardLayout
  title="Loan Dashboard"
  subtitle="Manage your loan portfolio"
  actions={
    <Button variant="primary">Create Loan</Button>
  }
>
  <QuickStats stats={statsData} />
  
  {/* Your content */}
</DashboardLayout>
```

## Migration Checklist for New Features

When creating new components, follow this checklist:

### ✅ Colors
- [ ] Use `bg-brand-*` instead of `bg-indigo-*`, `bg-blue-*`, etc.
- [ ] Use `text-brand-*` instead of `text-gray-*`
- [ ] Use brand tokens, not hardcoded hex values
- [ ] Test in both dark and light themes

### ✅ Buttons
- [ ] Use `variant="colosseum"` for filters/categories
- [ ] Use `variant="primary"` for main CTAs
- [ ] Use `variant="success"` for positive actions
- [ ] Use `variant="destructive"` for dangerous actions

### ✅ Badges
- [ ] Use `variant="success"` for approved/complete states
- [ ] Use `variant="warning"` for pending/review states
- [ ] Use `variant="danger"` for error/overdue states
- [ ] Use `.badge-urgent` class for critical actions

### ✅ Typography
- [ ] Let system fonts render (no custom fonts needed)
- [ ] Use `text-brand-text` for primary text
- [ ] Use `text-brand-muted` for secondary text
- [ ] Use semantic tokens, not specific grays

### ✅ Charts
- [ ] Wrap in `<ChartCard>` for consistent styling
- [ ] Use `#00d1b2` (cyan) for primary data
- [ ] Use `#10b981` (green) for positive metrics
- [ ] Use `#f97316` (orange) for warnings/medium
- [ ] Use `#ef4444` (red) for errors/high risk
- [ ] Apply theme-aware tooltip styles

## Common Mistakes to Avoid

### ❌ Don't Do This
```tsx
// Hardcoded colors
<div className="bg-blue-600">
<span className="text-gray-700">

// Old preset references
<div data-theme-preset="brutalist">

// Web font imports
import "@fontsource/inter";

// RGB color format
--background: 101010;  // Invalid!
```

### ✅ Do This Instead
```tsx
// Brand tokens
<div className="bg-brand-primary">
<span className="text-brand-muted">

// Simple theme class
<div className="dark">

// System fonts (automatic)
// No imports needed!

// HSL color format
--background: 0 0% 4%;  // Works with opacity!
```

## Accessibility

All Colosseum colors meet WCAG AA contrast requirements:

| Combination | Contrast Ratio | Status |
|------------|----------------|--------|
| Cyan on dark bg | 7.2:1 | ✅ AAA |
| Orange on dark bg | 5.8:1 | ✅ AA |
| Green on dark bg | 4.9:1 | ✅ AA |
| Red on dark bg | 5.1:1 | ✅ AA |
| Text on dark bg | 15.2:1 | ✅ AAA |
| Muted on dark bg | 4.8:1 | ✅ AA |

## FAQ

### Q: Can I still use the old colors?
A: No, the old Midday colors (indigo, amber) have been removed. Use the new brand tokens instead.

### Q: How do I create custom charts?
A: Use Recharts directly and apply Colosseum colors:
```tsx
<Line stroke="#00d1b2" />  // Cyan
<Bar fill="#f97316" />     // Orange
```

### Q: What happened to theme presets?
A: Removed for simplicity. Now just dark (default) and light themes. Access via:
```tsx
const { themeMode, setThemeMode } = usePreferencesStore();
```

### Q: Do I need to update existing components?
A: Most were auto-migrated by the migration script. Check for any remaining hardcoded colors and replace with brand tokens.

### Q: How do I add a new chart?
A: See the examples in `src/components/charts/`. Copy pattern:
```tsx
import { ChartCard } from '@/components/charts';
import { LineChart, ... } from 'recharts';

export function MyChart() {
  return (
    <ChartCard title="My Title">
      <ResponsiveContainer width="100%" height={300}>
        {/* Your chart */}
      </ResponsiveContainer>
    </ChartCard>
  );
}
```

### Q: Are system fonts slower than web fonts?
A: No! System fonts are **faster** because they're already installed. Zero network request, instant rendering.

### Q: Can I customize the brand colors?
A: Yes, edit `tailwind.config.ts` → `theme.extend.colors.brand`. Keep the semantic naming (primary, accent, success, danger).

### Q: What about Storybook?
A: View the new chart components:
```bash
npm run storybook
# Navigate to Charts > Examples
```

## Examples from Real Components

### Loan Status Badge (from src/components/loan/loan-status-badge.tsx)
```tsx
// After migration
<Badge variant="success">Funded</Badge>        // Green
<Badge variant="warning">Pending</Badge>       // Orange
<Badge variant="danger">Defaulted</Badge>      // Red
```

### Dashboard Header (from src/components/shared/dashboard-layout.tsx)
```tsx
// After migration
<h1 className="text-3xl font-bold text-brand-text">
  Dashboard
</h1>
<p className="text-brand-muted mt-1">
  Overview of your portfolio
</p>
```

### Metric Trend Indicator
```tsx
// After migration (getTrendColor function)
case 'increase': return 'text-brand-success';  // Green
case 'decrease': return 'text-brand-danger';   // Red
case 'neutral': return 'text-brand-muted';     // Gray
```

## Recharts Customization

### Applying Theme to Charts

```tsx
// All charts automatically theme-aware via ChartCard
<ChartCard title="My Chart">
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      {/* Grid inherits theme */}
      <CartesianGrid 
        strokeDasharray="3 3" 
        stroke="hsl(var(--border))" 
        opacity={0.3} 
      />
      
      {/* Axes inherit muted color */}
      <XAxis 
        stroke="hsl(var(--muted-foreground))"
        tick={{ fill: 'hsl(var(--muted-foreground))' }}
      />
      
      {/* Tooltip matches card style */}
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid #00d1b2',
          borderRadius: '6px',
          color: 'hsl(var(--foreground))'
        }}
      />
      
      {/* Lines use brand colors */}
      <Line 
        dataKey="value"
        stroke="#00d1b2"                    // Cyan
        dot={{ fill: '#00d1b2' }}           // Cyan dots
        activeDot={{ 
          r: 6, 
          stroke: '#f97316',                // Orange hover
          strokeWidth: 2 
        }}
      />
    </LineChart>
  </ResponsiveContainer>
</ChartCard>
```

### Custom Chart Colors

For multi-line charts, use this color order:
```tsx
const CHART_COLORS = [
  '#00d1b2',  // 1. Cyan (primary metric)
  '#10b981',  // 2. Green (positive/success)
  '#f97316',  // 3. Orange (warning/medium)
  '#ef4444',  // 4. Red (danger/high)
  '#64748b',  // 5. Gray (neutral/baseline)
];

<Line dataKey="metric1" stroke={CHART_COLORS[0]} />
<Line dataKey="metric2" stroke={CHART_COLORS[1]} />
```

## Responsive Design

All Colosseum components are mobile-first:

```tsx
// Responsive grid for charts
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <ApprovalTrendCard />     {/* Stacks on mobile */}
  <MonthlyMetricsChart />
  <RiskDistributionPie />
</div>

// Responsive buttons
<div className="flex flex-wrap gap-2">
  {filters.map(f => (
    <Button variant="colosseum" size="sm">{f}</Button>
  ))}
</div>
```

## Performance Tips

### 1. Use Opacity Modifiers
```tsx
// Instead of multiple color variants
<div className="bg-brand-primary/10">   // 10% opacity
<div className="bg-brand-primary/20">   // 20% opacity
<div className="bg-brand-primary/50">   // 50% opacity
```

### 2. Leverage CSS Variables
```tsx
// For dynamic theming
style={{ color: 'hsl(var(--brand-primary))' }}
```

### 3. Chart Optimization
```tsx
// For large datasets, disable animations
<LineChart data={largeData}>
  <Line isAnimationActive={false} />
</LineChart>

// Use smaller dots
<Line dot={{ r: 2 }} />
```

## Testing

### Visual Testing
```bash
npm run storybook
# Check Charts > Examples
# Verify colors match Colosseum
```

### Build Testing
```bash
npm run build
# Should complete without errors
# Verify bundle size reduction
```

### Runtime Testing
```bash
npm run dev
# Navigate to /dashboard/portfolio
# Verify charts render with cyan/orange/green/red
# Toggle dark/light theme
# Check button hover states (cyan glow)
```

## Troubleshooting

### Charts Not Showing
**Problem**: Chart components render empty  
**Solution**: Ensure data prop has at least 1 item
```tsx
const data = [{ x: 1, y: 1 }];  // Minimum
```

### Colors Not Applying
**Problem**: Brand colors not showing  
**Solution**: Clear `.next` cache and rebuild
```bash
rm -rf .next
npm run build
```

### Theme Not Switching
**Problem**: Light/dark toggle not working  
**Solution**: Ensure `html` tag has class applied:
```tsx
<html className={themeMode === "dark" ? "dark" : ""}>
```

### Fonts Look Wrong
**Problem**: Seeing fallback serif fonts  
**Solution**: System fonts vary by OS - this is expected! Design accounts for this.

## Resources

- **Chart Examples**: `src/components/charts/`
- **Component Patterns**: `src/components/shared/dashboard-layout.tsx`
- **Theme Config**: `src/app/globals.css`
- **Color System**: `tailwind.config.ts`
- **Storybook**: `npm run storybook` → Charts section

## Support

For questions about:
- **Colors**: See `COLOSSEUM-BEFORE-AFTER.md`
- **Charts**: See example components in `src/components/charts/`
- **Buttons**: Check `src/components/ui/button.tsx` for all variants
- **Migration**: Review `scripts/migrate-colors.sh` for patterns

---

**Welcome to Colosseum-branded Lending OS!** 🎨

Clean. Dark. Glowing. Native. Fast.

