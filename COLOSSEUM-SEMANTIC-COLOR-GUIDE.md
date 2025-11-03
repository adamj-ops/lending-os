# Colosseum Semantic Color Mapping Guide

**Purpose:** Define when and how to use each color from the Colosseum palette
**Audience:** Developers, designers, product managers
**Last Updated:** 2025-11-02

---

## Color Philosophy

The Colosseum design system uses **4 primary color families** with **11 shades each** (50-950) for a total of 44 color variables. Each color family has a specific semantic meaning and use case.

### The Four Color Families

1. **Primary (Teal)** - Brand identity, main actions, navigation
2. **Accent (Orange)** - Warnings, urgency, highlights
3. **Success (Green)** - Positive states, approvals, growth
4. **Danger (Red)** - Errors, destructive actions, delinquencies

---

## When to Use Each Color

### Primary (Teal) - `brand-primary-*`

**Base Color:** `#14b8a6` (teal-500)
**Emotional Association:** Trust, professionalism, technology, stability
**Use For:**

✅ **Primary actions and CTAs**
- "Save" buttons
- "Create Loan" buttons
- "Submit" forms
- Main navigation items

✅ **Links and interactive elements**
- Hyperlinks in body text
- "View more" links
- Breadcrumb active items
- Tab active states

✅ **Brand elements**
- Logo accents
- Brand-forward headers
- Marketing materials
- Onboarding flows

✅ **Focus indicators**
- Form input focus rings
- Keyboard navigation highlights
- Dropdown active items

✅ **Primary data visualization**
- Main metric lines in charts
- Primary bars in bar charts
- Default pie chart slices

❌ **Don't Use For:**
- Success confirmations (use Success green)
- Error messages (use Danger red)
- Warning alerts (use Accent orange)
- Semantic states (use appropriate color)

**Example Usage:**

```tsx
// Primary button
<Button variant="primary">Create Loan</Button>
// → bg-brand-primary-500 hover:bg-brand-primary-600

// Active navigation link
<a className="text-brand-primary-500 border-l-2 border-brand-primary-500">
  Dashboard
</a>

// Chart line
<Line dataKey="funded" stroke="var(--brand-primary-500)" />
```

---

### Accent (Orange) - `brand-accent-*`

**Base Color:** `#f97316` (orange-500)
**Emotional Association:** Urgency, attention, energy, caution
**Use For:**

✅ **Warning states**
- "Review required" alerts
- Pending approval badges
- Attention-needed notifications
- Caution messages

✅ **Urgent indicators**
- Team badges ("URGENT REVIEW")
- High-priority flags
- Time-sensitive tasks
- Overdue warnings (not yet critical)

✅ **Secondary CTAs**
- "Learn more" buttons
- Optional actions
- Alternative paths
- Secondary highlights

✅ **Highlighting & emphasis**
- Featured items
- New badges
- Promotional banners
- Spotlight content

❌ **Don't Use For:**
- Errors or failures (use Danger red)
- Success confirmations (use Success green)
- Primary actions (use Primary teal)
- Neutral information (use grays)

**Example Usage:**

```tsx
// Urgent badge
<TeamBadge>ACTION REQUIRED</TeamBadge>
// → bg-brand-accent-500 text-white

// Warning alert
<Alert variant="warning" className="bg-brand-accent-50 border-l-4 border-brand-accent-500">
  <AlertTitle className="text-brand-accent-700">Review Needed</AlertTitle>
  <AlertDescription className="text-brand-accent-600">
    This loan requires your attention.
  </AlertDescription>
</Alert>

// Secondary button
<Button variant="warning">Review Later</Button>
```

---

### Success (Green) - `brand-success-*`

**Base Color:** `#10b981` (emerald-500)
**Emotional Association:** Success, growth, positive, completion
**Use For:**

✅ **Success confirmations**
- "Saved successfully" messages
- Completion notifications
- Success toasts
- Checkmarks and confirmations

✅ **Positive states & metrics**
- "Approved" status badges
- Upward trend indicators
- Positive percentage changes
- Growth metrics (+12%)

✅ **Approved/Active statuses**
- Active loans
- Approved applications
- Verified accounts
- Completed tasks

✅ **Positive data visualization**
- Growth trend lines
- Profit/revenue bars
- Positive variance indicators
- Success rate charts

❌ **Don't Use For:**
- Neutral states (use grays)
- Actions (use Primary teal)
- Warnings (use Accent orange)
- Just because something is "good" (be intentional)

**Example Usage:**

```tsx
// Success badge
<Badge variant="success">Approved</Badge>
// → bg-brand-success-500 text-white

// Positive metric
<div className="flex items-center gap-1">
  <IconTrendingUp className="text-brand-success-500" size={16} />
  <span className="text-brand-success-600 font-semibold">+12.5%</span>
</div>

// Success notification
<Toast variant="success" className="bg-brand-success-50 border-brand-success-500">
  Loan created successfully!
</Toast>

// Success button (rare)
<Button variant="success">Approve Loan</Button>
```

---

### Danger (Red) - `brand-danger-*`

**Base Color:** `#ef4444` (red-500)
**Emotional Association:** Error, danger, stop, critical
**Use For:**

✅ **Error states**
- Form validation errors
- API error messages
- Failed operations
- System errors

✅ **Destructive actions**
- Delete buttons
- Remove actions
- Irreversible operations
- Critical warnings

✅ **Negative states & metrics**
- "Rejected" status
- Delinquent loans
- Overdue payments
- Default risk indicators

✅ **Critical alerts**
- System failures
- Security issues
- Data loss warnings
- Critical deadlines

✅ **Negative data visualization**
- Default/delinquency lines
- Loss/deficit bars
- Risk indicators
- Negative variances

❌ **Don't Use For:**
- General warnings (use Accent orange)
- Non-critical issues (use Accent orange)
- Just to draw attention (use thoughtfully)
- Primary actions (even if negative)

**Example Usage:**

```tsx
// Destructive button
<Button variant="destructive">Delete Loan</Button>
// → bg-brand-danger-500 hover:bg-brand-danger-600

// Error badge
<Badge variant="danger">Overdue</Badge>

// Form validation error
<Input
  className="border-brand-danger-600 focus-visible:ring-brand-danger-400/20"
  aria-invalid="true"
/>
<p className="text-sm text-brand-danger-600">Email is required</p>

// Critical alert
<Alert variant="destructive" className="bg-brand-danger-50 border-brand-danger-500">
  <AlertTitle className="text-brand-danger-700">Payment Failed</AlertTitle>
  <AlertDescription className="text-brand-danger-600">
    Unable to process payment. Please try again.
  </AlertDescription>
</Alert>
```

---

## Shade Selection Guide

Each color family has 11 shades (50-950). Here's when to use each:

### Shade Mapping

| Shade | Lightness | Dark Mode Use | Light Mode Use | Common Usage |
|-------|-----------|---------------|----------------|--------------|
| **50** | 98% | Very subtle backgrounds | Lightest backgrounds | Alert backgrounds, hover states |
| **100** | 95% | Subtle backgrounds | Light backgrounds | Card backgrounds (light theme) |
| **200** | 90% | Light elements | Borders, dividers | Borders, separators |
| **300** | 82% | Medium-light elements | Muted text | Disabled text, placeholders |
| **400** | 74% | Readable text on dark | Medium text | Focus rings, secondary text |
| **500** | 66% | BASE - Default color | BASE - Default color | Buttons, badges, main elements |
| **600** | 60% | Hover states | Text, hover states | Hover states, emphasized text |
| **700** | 54% | Active states | Body text | Active states, links |
| **800** | 48% | High contrast text | Headings, high contrast | Headers, strong emphasis |
| **900** | 42% | Very high contrast | Very dark text | Borders on light backgrounds |
| **950** | 36% | Near-black overlays | Darkest elements | Subtle dark overlays (/10, /20) |

### Usage Examples by Shade

```tsx
/* 50-200: Backgrounds and subtle elements */
bg-brand-primary-50         // Very light background (light theme alerts)
bg-brand-primary-100        // Light background (cards in light theme)
border-brand-primary-200    // Subtle borders

/* 300-400: Secondary elements and states */
text-brand-primary-300      // Disabled text
ring-brand-primary-400/20   // Focus ring (20% opacity)

/* 500: DEFAULT - Main usage */
bg-brand-primary-500        // Buttons, badges, primary elements
text-brand-primary-500      // Links, interactive text

/* 600-700: Interactive states */
hover:bg-brand-primary-600  // Hover state (one shade darker)
active:bg-brand-primary-700 // Active state (two shades darker)

/* 800-900: High emphasis */
text-brand-primary-800      // High contrast text on light backgrounds
border-brand-primary-900    // Dark borders

/* 950: Overlays and tints */
bg-brand-primary-950/10     // 10% opacity overlay (very subtle)
bg-brand-primary-950/20     // 20% opacity overlay (subtle)
bg-brand-primary-950/30     // 30% opacity overlay (medium)
```

---

## Semantic Use Cases

### Dashboard Components

```tsx
// Metric card with positive trend
<MetricCard
  title="Total Funded"
  value="$3.3M"
  trend="+12.5%"
  trendColor="brand-success" // Green for positive
  icon={IconTrendingUp}
  iconColor="brand-success-500"
/>

// Metric card with negative trend
<MetricCard
  title="Delinquency Rate"
  value="2.1%"
  trend="-0.3%"
  trendColor="brand-success" // Still green (down is good for delinquency)
  icon={IconTrendingDown}
  iconColor="brand-success-500"
/>

// Metric card with neutral trend
<MetricCard
  title="Active Loans"
  value="127"
  trend="No change"
  trendColor="slate" // Gray for neutral
/>
```

### Status Badges

```tsx
// Loan statuses
<Badge variant="success">Active</Badge>          // Green - loan is active
<Badge variant="primary">Pending</Badge>          // Teal - in process
<Badge variant="warning">Review Needed</Badge>    // Orange - attention needed
<Badge variant="danger">Delinquent</Badge>        // Red - critical issue

// Payment statuses
<Badge variant="success">Paid</Badge>             // Green - completed
<Badge variant="warning">Pending</Badge>          // Orange - waiting
<Badge variant="danger">Overdue</Badge>           // Red - problem

// Application statuses
<Badge variant="success">Approved</Badge>         // Green - positive outcome
<Badge variant="danger">Rejected</Badge>          // Red - negative outcome
<Badge variant="warning">Under Review</Badge>     // Orange - in progress
```

### Buttons

```tsx
// Primary actions (teal)
<Button variant="primary">Save Changes</Button>
<Button variant="primary">Create Loan</Button>
<Button variant="primary">Submit Application</Button>

// Destructive actions (red)
<Button variant="destructive">Delete Loan</Button>
<Button variant="destructive">Cancel Application</Button>

// Approval actions (green)
<Button variant="success">Approve Loan</Button>
<Button variant="success">Accept Terms</Button>

// Warning actions (orange)
<Button variant="warning">Review Required</Button>
<Button variant="warning">Request Changes</Button>

// Secondary actions (outline)
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Back</Button>
```

### Alerts & Notifications

```tsx
// Success notification
<Alert className="bg-brand-success-50 border-l-4 border-brand-success-500">
  <AlertTitle className="text-brand-success-700">Success!</AlertTitle>
  <AlertDescription className="text-brand-success-600">
    Loan created successfully.
  </AlertDescription>
</Alert>

// Warning notification
<Alert className="bg-brand-accent-50 border-l-4 border-brand-accent-500">
  <AlertTitle className="text-brand-accent-700">Attention Needed</AlertTitle>
  <AlertDescription className="text-brand-accent-600">
    This loan requires your review.
  </AlertDescription>
</Alert>

// Error notification
<Alert className="bg-brand-danger-50 border-l-4 border-brand-danger-500">
  <AlertTitle className="text-brand-danger-700">Error</AlertTitle>
  <AlertDescription className="text-brand-danger-600">
    Failed to save changes. Please try again.
  </AlertDescription>
</Alert>

// Info notification (teal)
<Alert className="bg-brand-primary-50 border-l-4 border-brand-primary-500">
  <AlertTitle className="text-brand-primary-700">New Feature</AlertTitle>
  <AlertDescription className="text-brand-primary-600">
    Check out our improved analytics dashboard!
  </AlertDescription>
</Alert>
```

### Charts & Data Visualization

```tsx
// Line chart - multi-series
<LineChart>
  <Line dataKey="funded" stroke="var(--brand-primary-500)" />      // Teal - main metric
  <Line dataKey="defaulted" stroke="var(--brand-danger-500)" />    // Red - negative
  <Line dataKey="projected" stroke="var(--brand-primary-300)" />   // Light teal - forecast
</LineChart>

// Bar chart - comparison
<BarChart>
  <Bar dataKey="approved" fill="var(--brand-success-500)" />       // Green - positive
  <Bar dataKey="rejected" fill="var(--brand-danger-500)" />        // Red - negative
</BarChart>

// Pie chart - distribution
<PieChart>
  <Pie>
    <Cell fill="var(--brand-success-500)" />  // Green - low risk
    <Cell fill="var(--brand-primary-500)" />  // Teal - medium risk
    <Cell fill="var(--brand-accent-500)" />   // Orange - moderate risk
    <Cell fill="var(--brand-danger-500)" />   // Red - high risk
  </Pie>
</PieChart>
```

---

## Accessibility Considerations

### Contrast Ratios

All color combinations must meet **WCAG AA** standards (4.5:1 for normal text, 3:1 for large text).

**Pre-approved Combinations:**

✅ **Dark Theme:**
- White text (`#ffffff`) on `brand-{color}-500` → ✅ AA+
- `brand-{color}-500` on black (`#0a0a0a`) → ✅ AA+
- `brand-{color}-600` text on `#0a0a0a` → ✅ AA
- `brand-{color}-400` text on `#0a0a0a` → ✅ AA

✅ **Light Theme:**
- `brand-{color}-700` text on white → ✅ AA+
- `brand-{color}-800` text on white → ✅ AAA
- `brand-{color}-600` text on `{color}-50` → ✅ AA

❌ **Avoid:**
- Light shades (50-300) for text on light backgrounds
- Dark shades (800-950) for text on dark backgrounds
- Relying solely on color to convey meaning

### Best Practices

1. **Don't rely on color alone**
   ```tsx
   // ❌ Bad - color only
   <span className="text-brand-danger-600">Error</span>

   // ✅ Good - color + icon
   <span className="text-brand-danger-600">
     <IconAlertCircle size={16} />
     Error
   </span>
   ```

2. **Provide alternative indicators**
   ```tsx
   // ✅ Good - color + text + icon
   <Badge variant="success">
     <IconCheck size={12} />
     Approved
   </Badge>
   ```

3. **Use sufficient contrast**
   ```tsx
   // ✅ Good - high contrast
   <button className="bg-brand-primary-500 text-slate-900">
     Submit
   </button>

   // ❌ Bad - low contrast
   <button className="bg-brand-primary-500 text-brand-primary-700">
     Submit
   </button>
   ```

---

## Common Mistakes & Solutions

### Mistake 1: Using Primary for Everything

❌ **Wrong:**
```tsx
<Badge variant="primary">Approved</Badge>    // Should be success
<Badge variant="primary">Error</Badge>        // Should be danger
<Button variant="primary">Delete</Button>     // Should be destructive
```

✅ **Right:**
```tsx
<Badge variant="success">Approved</Badge>     // Semantic meaning
<Badge variant="danger">Error</Badge>         // Semantic meaning
<Button variant="destructive">Delete</Button> // Semantic meaning
```

### Mistake 2: Inconsistent Shade Usage

❌ **Wrong:**
```tsx
// Using different shades for same purpose
<Button className="bg-brand-primary-500">Save</Button>
<Button className="bg-brand-primary-600">Save</Button>  // Different base shade!
```

✅ **Right:**
```tsx
// Consistent base shade, progressive states
<Button className="bg-brand-primary-500 hover:bg-brand-primary-600 active:bg-brand-primary-700">
  Save
</Button>
```

### Mistake 3: Mixing Color Systems

❌ **Wrong:**
```tsx
// Mixing Colosseum with hardcoded Tailwind colors
<div className="bg-brand-primary-500 hover:bg-cyan-600">
```

✅ **Right:**
```tsx
// Stay within Colosseum system
<div className="bg-brand-primary-500 hover:bg-brand-primary-600">
```

### Mistake 4: Overusing Accent/Danger Colors

❌ **Wrong:**
```tsx
// Everything is urgent!
<TeamBadge>NEW</TeamBadge>
<TeamBadge>UPDATED</TeamBadge>
<TeamBadge>FEATURED</TeamBadge>
```

✅ **Right:**
```tsx
// Only truly urgent items
<TeamBadge>ACTION REQUIRED</TeamBadge>
<Badge variant="secondary">New</Badge>
<Badge variant="primary">Featured</Badge>
```

---

## Quick Decision Tree

```
Need a color? Ask yourself:

1. Is it a primary action or brand element?
   YES → Use Primary (Teal)
   NO → Continue

2. Does it indicate success or positive state?
   YES → Use Success (Green)
   NO → Continue

3. Does it indicate error or destructive action?
   YES → Use Danger (Red)
   NO → Continue

4. Does it need attention or indicate warning?
   YES → Use Accent (Orange)
   NO → Use Neutral (Gray/Slate)

Still unsure? Ask:
- What emotion should this convey?
- What action should the user take?
- Is this consistent with similar elements?
```

---

## Summary

| Color | Hex | Use When | Don't Use When |
|-------|-----|----------|----------------|
| **Primary (Teal)** | #14b8a6 | Actions, links, brand, navigation | Success/error states |
| **Accent (Orange)** | #f97316 | Warnings, urgency, attention | Errors, primary actions |
| **Success (Green)** | #10b981 | Approvals, positive, growth | Neutral states |
| **Danger (Red)** | #ef4444 | Errors, destructive, critical | Warnings, general attention |

**Golden Rule:** Use color semantically and consistently. When in doubt, refer to existing patterns in the [DESIGN-SYSTEM-MASTER.md](./DESIGN-SYSTEM-MASTER.md).

---

**Related Documentation:**
- [DESIGN-SYSTEM-MASTER.md](./DESIGN-SYSTEM-MASTER.md) - Complete design system reference
- [COLOSSEUM-SHADE-SYSTEM-COMPLETE.md](./COLOSSEUM-SHADE-SYSTEM-COMPLETE.md) - Technical shade implementation
- [COMPONENT-AUDIT-REPORT.md](./COMPONENT-AUDIT-REPORT.md) - Current state audit

**Last Updated:** 2025-11-02
**Maintainer:** Lending OS Design Team
