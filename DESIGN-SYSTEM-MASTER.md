# Lending OS Design System - Master Reference

**Version:** 2.0 (Colosseum)
**Last Updated:** 2025-11-02
**Status:** Active Development

---

## Table of Contents

1. [Introduction](#introduction)
2. [Design Philosophy](#design-philosophy)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Component Library](#component-library)
7. [Patterns & Best Practices](#patterns--best-practices)
8. [Migration Guide](#migration-guide)
9. [Quick Reference](#quick-reference)

---

## Introduction

### What is This?

This document serves as the **single source of truth** for the Lending OS design system, consolidating all Colosseum implementation details, usage guidelines, and best practices.

### Design System Goals

1. **Consistency**: Unified visual language across all pages and components
2. **Accessibility**: WCAG AA compliant color contrasts and interaction patterns
3. **Tech-Forward Aesthetic**: Modern, impeccable design inspired by Colosseum by Solana
4. **Developer Experience**: Clear guidelines, reusable components, predictable patterns
5. **Performance**: Optimized CSS, minimal bundle size, smooth interactions

### Color System Foundation

The Lending OS design system is built on the **Colosseum 12-Step Shade System** using OKLCH color space for perceptually uniform color progression. This provides:

- **44 shade variables** across 4 color families
- **Rich visual hierarchy** with 11 shades per color (50-950)
- **Predictable color relationships** for hover/focus/active states
- **Dark mode optimization** with proper contrast ratios

---

## Design Philosophy

### The Colosseum Aesthetic

**Characteristics:**
- **Ultra-dark backgrounds**: Near-black (#0a0a0a) for depth and focus
- **Vibrant accents**: Teal primary (#14b8a6) for modern tech feel
- **Subtle depth**: Shade progression for visual hierarchy without heavy shadows
- **Purposeful color**: Strategic use of orange (#f97316) for urgency/attention
- **Clean typography**: System fonts with careful hierarchy
- **Minimal ornamentation**: Let content and data shine

### Core Principles

1. **Content First**: Design serves the data and user tasks
2. **Progressive Disclosure**: Show complexity gradually
3. **Feedback & Affordance**: Clear interactive states and system responses
4. **Consistency Over Novelty**: Predictable patterns build user confidence
5. **Performance Matters**: Fast interactions, smooth animations

### Visual Hierarchy Rules

1. **Background Layers**:
   - Canvas: `#0a0a0a` (ultra-dark)
   - Cards/Surfaces: `#111827` to `#1a1a1a`
   - Elevated elements: Subtle shade lighter (950/900)

2. **Text Hierarchy**:
   - Primary: `#f1f5f9` (near-white)
   - Secondary: `#d4d4d4` (light gray)
   - Muted: `#64748b` (medium gray)
   - Disabled: `#3e3e42` (dark gray)

3. **Color Emphasis**:
   - Primary actions: Teal (`brand-primary-500`)
   - Success states: Green (`brand-success-500`)
   - Warnings: Orange (`brand-accent-500`)
   - Errors: Red (`brand-danger-500`)

4. **Interactive States**:
   - Default: Base shade (usually 500)
   - Hover: One shade darker (600)
   - Active: Two shades darker (700)
   - Disabled: Reduced opacity or muted shade (300)

---

## Color System

### OKLCH Color Space

All Colosseum colors use OKLCH format for perceptually uniform progression:

```css
oklch(lightness% chroma hue)
```

**Benefits:**
- Consistent perceived brightness across hues
- Better dark mode support
- More accurate color relationships

### Color Families

#### 1. Primary (Teal/Cyan) - `brand-primary-*`

**Base Color:** `#14b8a6` (Tailwind teal-500 equivalent)
**Use Cases:** Primary actions, links, brand elements, focus indicators

```css
--brand-primary-50:  oklch(98% 0.02 180)  /* Subtle backgrounds */
--brand-primary-100: oklch(95% 0.04 180)  /* Light backgrounds */
--brand-primary-200: oklch(90% 0.06 180)  /* Borders, dividers */
--brand-primary-300: oklch(82% 0.09 180)  /* Disabled text */
--brand-primary-400: oklch(74% 0.12 180)  /* Focus rings */
--brand-primary-500: oklch(66% 0.15 180)  /* BASE - Primary buttons, links */
--brand-primary-600: oklch(60% 0.15 180)  /* Hover states */
--brand-primary-700: oklch(54% 0.14 180)  /* Active states */
--brand-primary-800: oklch(48% 0.12 180)  /* Dark text on light bg */
--brand-primary-900: oklch(42% 0.10 180)  /* Very dark accents */
--brand-primary-950: oklch(36% 0.08 180)  /* Subtle dark overlays */
```

**Tailwind Classes:**
```tsx
bg-brand-primary-{50-950}
text-brand-primary-{50-950}
border-brand-primary-{50-950}
ring-brand-primary-{50-950}
```

#### 2. Accent (Orange) - `brand-accent-*`

**Base Color:** `#f97316` (Tailwind orange-500 equivalent)
**Use Cases:** Warnings, highlights, urgent badges, secondary CTAs

```css
--brand-accent-50:  oklch(97% 0.03 40)
--brand-accent-100: oklch(94% 0.06 40)
--brand-accent-200: oklch(90% 0.10 40)
--brand-accent-300: oklch(84% 0.14 40)
--brand-accent-400: oklch(78% 0.18 40)
--brand-accent-500: oklch(72% 0.22 40)  /* BASE - Warning buttons, urgent badges */
--brand-accent-600: oklch(66% 0.22 40)
--brand-accent-700: oklch(60% 0.21 40)
--brand-accent-800: oklch(54% 0.19 40)
--brand-accent-900: oklch(48% 0.17 40)
--brand-accent-950: oklch(42% 0.15 40)
```

#### 3. Success (Green) - `brand-success-*`

**Base Color:** `#10b981` (Tailwind emerald-500 equivalent)
**Use Cases:** Success states, positive metrics, approved statuses

```css
--brand-success-50:  oklch(98% 0.02 150)
--brand-success-100: oklch(95% 0.04 150)
--brand-success-200: oklch(90% 0.07 150)
--brand-success-300: oklch(84% 0.10 150)
--brand-success-400: oklch(76% 0.13 150)
--brand-success-500: oklch(68% 0.16 150)  /* BASE - Success buttons, positive trends */
--brand-success-600: oklch(62% 0.15 150)
--brand-success-700: oklch(56% 0.14 150)
--brand-success-800: oklch(50% 0.12 150)
--brand-success-900: oklch(44% 0.10 150)
--brand-success-950: oklch(38% 0.08 150)
```

#### 4. Danger (Red) - `brand-danger-*`

**Base Color:** `#ef4444` (Tailwind red-500 equivalent)
**Use Cases:** Error states, destructive actions, negative metrics, delinquencies

```css
--brand-danger-50:  oklch(98% 0.03 25)
--brand-danger-100: oklch(95% 0.06 25)
--brand-danger-200: oklch(90% 0.10 25)
--brand-danger-300: oklch(84% 0.15 25)
--brand-danger-400: oklch(76% 0.19 25)
--brand-danger-500: oklch(68% 0.23 25)  /* BASE - Error messages, delete buttons */
--brand-danger-600: oklch(62% 0.22 25)
--brand-danger-700: oklch(56% 0.20 25)
--brand-danger-800: oklch(50% 0.18 25)
--brand-danger-900: oklch(44% 0.16 25)
--brand-danger-950: oklch(38% 0.14 25)
```

### Semantic Color Mappings

**When to use which color family:**

| Use Case | Color Family | Specific Shade |
|----------|-------------|----------------|
| Primary CTA button | `brand-primary` | 500 (hover: 600, active: 700) |
| Navigation active state | `brand-primary` | 500 background, white text |
| Links | `brand-primary` | 500 (hover: 600) |
| Success notification | `brand-success` | 500 background, white text |
| Positive metric (up arrow) | `brand-success` | 500-600 |
| Warning banner | `brand-accent` | 50 background, 700 text |
| Urgent badge | `brand-accent` | 500 background, white text |
| Error message | `brand-danger` | 500-600 |
| Destructive button | `brand-danger` | 500 (hover: 600, active: 700) |
| Form validation error | `brand-danger` | 600 border, 700 text |

### Neutral Grays

In addition to the 4 color families, use Tailwind's slate scale for neutral grays:

- **Text**: `slate-50` to `slate-900`
- **Backgrounds**: `#0a0a0a`, `#111827`, `#1f2937`
- **Borders**: `slate-700`, `slate-800`

### Opacity Modifiers

Use opacity modifiers for subtle effects:

```tsx
bg-brand-primary-500/10   /* 10% opacity - subtle tint */
bg-brand-primary-500/20   /* 20% opacity - light overlay */
bg-brand-primary-950/30   /* 30% opacity - medium overlay */
ring-brand-primary-400/50 /* 50% opacity - focus ring */
```

### Color Usage Guidelines

#### DO ✅

- Use `brand-primary-500` for primary actions
- Progress through shades for interactive states (500 → 600 → 700)
- Use opacity modifiers for overlays (`/10`, `/20`, `/30`)
- Apply consistent shade for same purpose across app
- Use semantic naming (success, danger, accent)

#### DON'T ❌

- Mix Colosseum shades with hardcoded Tailwind colors (e.g., `bg-brand-primary-500 hover:bg-cyan-600`)
- Use shades inconsistently (e.g., 500 in one place, 600 for same purpose elsewhere)
- Skip shade progression (e.g., 500 → 800 for hover)
- Use primary colors for semantic states (use success/danger instead)
- Hardcode hex values inline

---

## Typography

### Font Families

**Sans Serif (Default):**
```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans",
             "Helvetica Neue", sans-serif;
```

**Monospace:**
```css
--font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
```

**Rationale:** System fonts provide:
- Native feel on each platform
- Zero loading time
- Excellent readability
- Automatic dark mode optimization

### Type Scale

| Name | Size | Line Height | Use Case |
|------|------|-------------|----------|
| `text-xs` | 12px | 16px | Captions, badges, metadata |
| `text-sm` | 14px | 20px | Body text (small), form labels |
| `text-base` | 16px | 24px | Body text (default) |
| `text-lg` | 18px | 28px | Emphasized text, card titles |
| `text-xl` | 20px | 28px | Section headings |
| `text-2xl` | 24px | 32px | Page headings |
| `text-3xl` | 30px | 36px | Hero headings |

### Font Weights

| Class | Weight | Use Case |
|-------|--------|----------|
| `font-normal` | 400 | Body text, paragraphs |
| `font-medium` | 500 | Labels, navigation, subtle emphasis |
| `font-semibold` | 600 | Card titles, section headings, buttons |
| `font-bold` | 700 | Page headings, urgent badges, strong emphasis |

### Text Color Hierarchy

```tsx
/* Dark Theme (default) */
text-slate-50       /* Primary text - #f8fafc - Headings, important text */
text-slate-100      /* Body text - #f1f5f9 - Paragraph content */
text-slate-300      /* Secondary text - #cbd5e1 - Supporting info */
text-slate-400      /* Muted text - #94a3b8 - Captions, metadata */
text-slate-500      /* Disabled text - #64748b - Disabled states */

/* Light Theme */
text-slate-900      /* Primary text - Headings */
text-slate-700      /* Body text - Paragraphs */
text-slate-600      /* Secondary text */
text-slate-500      /* Muted text */
text-slate-400      /* Disabled text */
```

### Typography Guidelines

#### Headings

```tsx
/* Page Title (H1) */
<h1 className="text-2xl font-semibold text-slate-50">Portfolio Overview</h1>

/* Section Heading (H2) */
<h2 className="text-xl font-semibold text-slate-50">Recent Activity</h2>

/* Card Title (H3) */
<h3 className="text-base font-semibold text-slate-50">Loan Summary</h3>
```

#### Body Text

```tsx
/* Primary body text */
<p className="text-sm text-slate-100">This is the main content...</p>

/* Secondary/helper text */
<p className="text-sm text-slate-400">Last updated 2 hours ago</p>

/* Captions */
<span className="text-xs text-slate-500">View details</span>
```

#### Links

```tsx
/* Interactive link */
<a className="text-brand-primary-500 hover:text-brand-primary-600 underline">
  Learn more
</a>

/* Subtle link (no underline) */
<a className="text-brand-primary-500 hover:text-brand-primary-600">
  View all
</a>
```

#### Special Text Treatments

```tsx
/* Uppercase labels */
<span className="text-xs font-bold uppercase tracking-wider text-slate-400">
  Status
</span>

/* Monospace (code, IDs, amounts) */
<code className="font-mono text-sm text-brand-primary-400">
  LOAN-2024-1234
</code>

/* Large numbers/metrics */
<div className="text-3xl font-bold text-slate-50">$3.3M</div>
```

---

## Spacing & Layout

### Spacing Scale

Lending OS uses Tailwind's default spacing scale (1 unit = 0.25rem = 4px):

| Class | Value | Use Case |
|-------|-------|----------|
| `gap-1` | 4px | Tight icon spacing |
| `gap-1.5` | 6px | Badge internal spacing |
| `gap-2` | 8px | Default component spacing |
| `gap-2.5` | 10px | Comfortable spacing |
| `gap-3` | 12px | Section spacing |
| `gap-4` | 16px | Card internal spacing |
| `gap-6` | 24px | Card external spacing |
| `gap-8` | 32px | Section dividers |
| `gap-12` | 48px | Major layout divisions |

### Layout Patterns

#### Card Padding

```tsx
/* Standard card */
<Card className="p-6">  {/* 24px padding */}

/* Compact card */
<Card className="p-4">  {/* 16px padding */}

/* Large card */
<Card className="p-8">  {/* 32px padding */}
```

#### Grid Layouts

```tsx
/* Dashboard grid (responsive) */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

/* Two-column layout */
<div className="grid grid-cols-2 gap-4">

/* Auto-fit responsive grid */
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

#### Flex Patterns

```tsx
/* Horizontal row with spacing */
<div className="flex items-center gap-2">

/* Space between (navbar pattern) */
<div className="flex items-center justify-between">

/* Centered content */
<div className="flex items-center justify-center">

/* Vertical stack */
<div className="flex flex-col gap-4">
```

### Border Radius

```css
--radius-sm: 4px   /* Small components (badges, pills) */
--radius-md: 6px   /* Medium components (inputs, buttons) */
--radius-lg: 8px   /* Large components (cards, modals) */
--radius-xl: 12px  /* Extra large (major containers) */
```

```tsx
rounded-sm  /* 4px - badges */
rounded-md  /* 6px - buttons, inputs */
rounded-lg  /* 8px - cards */
rounded-xl  /* 12px - modals, drawers */
```

### Shadows (Minimal Usage)

Colosseum aesthetic uses subtle shadows, preferring borders and shades for depth:

```tsx
/* Subtle card elevation */
className="shadow-sm"  /* Minimal shadow */

/* Modal/dropdown elevation */
className="shadow-lg"  /* Medium shadow for overlays */

/* Rarely use */
className="shadow-xl"  /* Only for major overlays */
```

**Prefer borders over shadows:**
```tsx
/* Instead of heavy shadow */
❌ className="shadow-2xl"

/* Use subtle border */
✅ className="border border-brand-primary-950/30"
```

---

## Component Library

### Button Component

**Location:** `src/components/ui/button.tsx`
**Status:** ✅ Fully Colosseum Compliant

#### Variants

```tsx
import { Button } from "@/components/ui/button";

/* Primary - Teal filled */
<Button variant="primary">Save Changes</Button>

/* Secondary - Outlined dark */
<Button variant="secondary">Cancel</Button>

/* Outline - Teal bordered */
<Button variant="outline">View Details</Button>

/* Ghost - Minimal */
<Button variant="ghost">Settings</Button>

/* Destructive - Red */
<Button variant="destructive">Delete</Button>

/* Success - Green */
<Button variant="success">Approve</Button>

/* Warning - Orange */
<Button variant="warning">Review</Button>
```

#### Sizes

```tsx
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

#### With Icons

```tsx
import { IconCheck } from "@tabler/icons-react";

<Button variant="primary">
  <IconCheck size={16} />
  Approve Loan
</Button>
```

#### Color Mapping

| Variant | Default | Hover | Active | Text |
|---------|---------|-------|--------|------|
| `primary` | `bg-brand-primary-500` | `bg-brand-primary-600` | `bg-brand-primary-700` | `text-slate-900` |
| `destructive` | `bg-brand-danger-500` | `bg-brand-danger-600` | `bg-brand-danger-700` | `text-white` |
| `success` | `bg-brand-success-500` | `bg-brand-success-600` | `bg-brand-success-700` | `text-white` |
| `warning` | `bg-brand-accent-500` | `bg-brand-accent-600` | `bg-brand-accent-700` | `text-white` |
| `outline` | `border-brand-primary-500` | `bg-brand-primary-950/10` | `bg-brand-primary-950/20` | `text-brand-primary-500` |
| `ghost` | `transparent` | `bg-brand-primary-950/10` | `bg-brand-primary-950/20` | `text-brand-primary-500` |

### Badge Component

**Location:** `src/components/ui/badge.tsx`
**Status:** ⚠️ Partially Compliant (base variants good, appearance variants need update)

#### Usage

```tsx
import { Badge } from "@/components/ui/badge";

/* Semantic variants */
<Badge variant="primary">Active</Badge>
<Badge variant="success">Approved</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Overdue</Badge>
<Badge variant="secondary">Draft</Badge>
```

#### Sizes

```tsx
<Badge size="xs">XS</Badge>
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

#### Color Mapping

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| `primary` | `bg-brand-primary-500` | `text-slate-900` | none |
| `success` | `bg-brand-success-500` | `text-white` | none |
| `warning` | `bg-brand-accent-500` | `text-white` | none |
| `danger` | `bg-brand-danger-500` | `text-white` | none |
| `outline` | `transparent` | `text-brand-primary-500` | `border-brand-primary-500` |

### Card Component

**Location:** `src/components/ui/card.tsx`
**Status:** ⚠️ Needs Update (uses var() syntax)

#### Usage

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Loan Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Total funded: $3.3M</p>
  </CardContent>
</Card>
```

#### Recommended Classes

```tsx
/* Standard card */
<Card className="bg-card border-transparent">

/* Elevated card */
<Card className="bg-card border border-brand-primary-950/30">

/* Interactive card */
<Card className="bg-card hover:border-brand-primary-500/30 transition-colors">
```

### Form Components

**Location:** `src/components/ui/input.tsx`, `select.tsx`, `textarea.tsx`, etc.
**Status:** ⚠️ Semantic Tokens (consistent but not Colosseum)

#### Input

```tsx
import { Input } from "@/components/ui/input";

<Input
  type="text"
  placeholder="Enter loan amount"
  className="focus-visible:ring-brand-primary-400/20"
/>
```

#### Select

```tsx
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

<Select>
  <SelectTrigger>Select status</SelectTrigger>
  <SelectContent>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="pending">Pending</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox

```tsx
import { Checkbox } from "@/components/ui/checkbox";

<Checkbox id="terms" />
<label htmlFor="terms">I agree to terms</label>
```

### Colosseum-Specific Components

**Location:** `src/components/colosseum/`
**Status:** ✅ Fully Implemented

#### CategoryPill (Filter Buttons)

```tsx
import { CategoryPill } from "@/components/colosseum";

<CategoryPill active>All Loans</CategoryPill>
<CategoryPill>Personal</CategoryPill>
<CategoryPill>Commercial</CategoryPill>
```

**Styling:**
- Inactive: `border-brand-primary-800`, `text-brand-primary-400`
- Hover: `bg-brand-primary-800`, `text-white`
- Active: `bg-brand-primary-500`, `text-white`, `border-brand-primary-500`

#### TeamBadge (Urgent Indicators)

```tsx
import { TeamBadge } from "@/components/colosseum";

<TeamBadge>ACTION REQUIRED</TeamBadge>
<TeamBadge>URGENT REVIEW</TeamBadge>
```

**Styling:**
- Background: `bg-brand-accent-500` (orange)
- Text: `text-white`, `font-bold`, `uppercase`, `tracking-wider`
- Icon: Diamond `◆` prefix

#### PostCard (Activity Feed)

```tsx
import { PostCard } from "@/components/colosseum";

<PostCard
  title="Loan Application Received"
  author="John Doe"
  timestamp="2 hours ago"
  categories={
    <>
      <CategoryPill>Bridge Loan</CategoryPill>
      <CategoryPill>$250K</CategoryPill>
    </>
  }
  badges={<TeamBadge>URGENT</TeamBadge>}
  content="New loan application for commercial property..."
/>
```

#### SearchBar

```tsx
import { SearchBar } from "@/components/colosseum";

<SearchBar placeholder="Search loans..." />
```

**Styling:**
- Background: `bg-brand-primary-950/20`
- Border: `border-brand-primary-900/40`
- Focus: `border-brand-primary-500`, `ring-brand-primary-500/20`

---

## Patterns & Best Practices

### Interactive States Pattern

**Standard progression for all interactive elements:**

```tsx
/* Default → Hover → Active → Disabled */
bg-brand-primary-500           /* Default */
hover:bg-brand-primary-600     /* Hover (one shade darker) */
active:bg-brand-primary-700    /* Active (two shades darker) */
disabled:bg-brand-primary-300  /* Disabled (lighter, reduced opacity) */
disabled:opacity-50
disabled:cursor-not-allowed
```

### Focus States Pattern

**Consistent focus rings across all interactive elements:**

```tsx
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-brand-primary-400/20
focus-visible:ring-offset-2
focus-visible:ring-offset-background
```

### Loading States Pattern

```tsx
import { Skeleton } from "@/components/ui/skeleton";

/* Loading card */
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-40" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4" />
  </CardContent>
</Card>
```

### Error States Pattern

```tsx
/* Input with error */
<Input
  className="border-brand-danger-600 focus-visible:ring-brand-danger-400/20"
  aria-invalid="true"
/>
<p className="text-sm text-brand-danger-600">Invalid email address</p>

/* Alert with error */
<Alert variant="destructive">
  <AlertTitle className="text-brand-danger-600">Error</AlertTitle>
  <AlertDescription>Failed to save changes</AlertDescription>
</Alert>
```

### Success States Pattern

```tsx
/* Success badge */
<Badge variant="success">Approved</Badge>

/* Success notification */
<div className="bg-brand-success-50 border-l-4 border-brand-success-500 p-4">
  <p className="text-brand-success-700">Loan successfully created!</p>
</div>
```

### Empty States Pattern

```tsx
<div className="flex flex-col items-center justify-center p-12 text-center">
  <IconInbox size={48} className="text-slate-500 mb-4" />
  <h3 className="text-lg font-semibold text-slate-50 mb-2">No loans found</h3>
  <p className="text-sm text-slate-400 mb-6">
    Get started by creating your first loan
  </p>
  <Button variant="primary">Create Loan</Button>
</div>
```

### Data Table Pattern

```tsx
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow className="border-brand-primary-950/30">
      <TableHead>Loan ID</TableHead>
      <TableHead>Borrower</TableHead>
      <TableHead>Amount</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-brand-primary-950/10">
      <TableCell className="font-mono text-brand-primary-400">LOAN-2024-001</TableCell>
      <TableCell>John Doe</TableCell>
      <TableCell className="font-semibold">$250,000</TableCell>
      <TableCell><Badge variant="success">Active</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Metric Display Pattern

```tsx
<Card>
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Total Funded
        </p>
        <p className="text-3xl font-bold text-slate-50 mt-1">$3.3M</p>
      </div>
      <div className="text-brand-success-500">
        <IconTrendingUp size={32} />
      </div>
    </div>
    <div className="flex items-center gap-1 mt-4">
      <span className="text-sm text-brand-success-500">+12.5%</span>
      <span className="text-xs text-slate-400">vs last month</span>
    </div>
  </CardContent>
</Card>
```

---

## Migration Guide

### From Hardcoded Colors to Colosseum

#### Common Replacements

| Old (Hardcoded) | New (Colosseum) | Notes |
|-----------------|-----------------|-------|
| `bg-blue-500` | `bg-brand-primary-500` | Primary actions |
| `text-cyan-600` | `text-brand-primary-600` | Primary text |
| `border-teal-500` | `border-brand-primary-500` | Primary borders |
| `bg-green-500` | `bg-brand-success-500` | Success states |
| `text-green-600` | `text-brand-success-600` | Success text |
| `bg-red-500` | `bg-brand-danger-500` | Error/destructive |
| `text-red-600` | `text-brand-danger-600` | Error text |
| `bg-orange-500` | `bg-brand-accent-500` | Warnings |
| `text-yellow-600` | `text-brand-accent-600` | Warning text |
| `bg-gray-800` | `bg-[#111827]` or `bg-card` | Card surfaces |

#### Find & Replace Patterns

```bash
# Example find/replace patterns (use with caution)

# Blue → Primary (teal)
bg-blue-500 → bg-brand-primary-500
text-blue-600 → text-brand-primary-600
border-blue-500 → border-brand-primary-500

# Green → Success
bg-green-500 → bg-brand-success-500
text-green-600 → text-brand-success-600

# Red → Danger
bg-red-500 → bg-brand-danger-500
text-red-600 → text-brand-danger-600

# Orange/Yellow → Accent
bg-orange-500 → bg-brand-accent-500
bg-yellow-600 → bg-brand-accent-600
```

### From Semantic Tokens to Colosseum

For components currently using semantic tokens (e.g., `bg-primary`, `text-foreground`), migration is optional but recommended for:

1. Components with multiple color states (hover, focus, active)
2. Components needing shade progression
3. Brand-forward components (CTAs, navigation, headers)

**Example Migration:**

```tsx
/* Before (semantic tokens) */
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</button>

/* After (Colosseum) */
<button className="bg-brand-primary-500 text-slate-900 hover:bg-brand-primary-600 active:bg-brand-primary-700">
  Click me
</button>
```

### Component Migration Priority

1. **High Priority** (user-facing, high visibility):
   - Buttons (already done ✅)
   - Badges (partially done ⚠️)
   - Metric/statistic cards
   - Analytics pages
   - Primary navigation

2. **Medium Priority** (supporting UI):
   - Form components
   - Cards
   - Tables
   - Modals/dialogs

3. **Low Priority** (internal, low visibility):
   - Utility components
   - Experimental features
   - Admin-only pages

---

## Quick Reference

### Color Cheat Sheet

```tsx
/* PRIMARY (Teal) - Use for: main actions, links, brand elements */
bg-brand-primary-500 hover:bg-brand-primary-600 active:bg-brand-primary-700

/* SUCCESS (Green) - Use for: approvals, positive metrics, confirmations */
bg-brand-success-500 text-white

/* ACCENT (Orange) - Use for: warnings, urgent items, highlights */
bg-brand-accent-500 text-white

/* DANGER (Red) - Use for: errors, destructive actions, delinquencies */
bg-brand-danger-500 text-white

/* NEUTRAL (Slate) - Use for: text, backgrounds, borders */
text-slate-50  /* Headings */
text-slate-100 /* Body text */
text-slate-400 /* Muted text */
bg-[#0a0a0a]   /* Canvas */
bg-[#111827]   /* Cards */
```

### Component Quick Start

```tsx
/* Button */
<Button variant="primary">Primary Action</Button>

/* Badge */
<Badge variant="success">Approved</Badge>

/* Card */
<Card>
  <CardHeader><CardTitle>Title</CardTitle></CardHeader>
  <CardContent>Content</CardContent>
</Card>

/* Input */
<Input type="text" placeholder="Enter value" />

/* Category Pill */
<CategoryPill active>All</CategoryPill>

/* Team Badge */
<TeamBadge>URGENT</TeamBadge>
```

### Common Patterns

```tsx
/* Interactive state progression */
bg-{color}-500 → hover:bg-{color}-600 → active:bg-{color}-700

/* Focus ring */
focus-visible:ring-2 ring-brand-primary-400/20

/* Disabled state */
disabled:opacity-50 disabled:cursor-not-allowed

/* Card hover */
hover:border-brand-primary-500/30 transition-colors

/* Subtle overlay */
bg-brand-primary-950/10
```

---

## Additional Resources

### Internal Documentation

- [COLOSSEUM-SHADE-SYSTEM-COMPLETE.md](./COLOSSEUM-SHADE-SYSTEM-COMPLETE.md) - Technical implementation details
- [COLOSSEUM-DEVELOPER-GUIDE.md](./COLOSSEUM-DEVELOPER-GUIDE.md) - Original developer guide
- [COLOSSEUM-PATTERNS.md](./COLOSSEUM-PATTERNS.md) - Component pattern library
- [COMPONENT-AUDIT-REPORT.md](./COMPONENT-AUDIT-REPORT.md) - Current state analysis

### External Inspiration

- [Colosseum by Solana](https://arena.colosseum.org/forums/public) - Original design inspiration
- [Radix Colors](https://www.radix-ui.com/colors) - OKLCH color system reference
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility framework documentation

---

**Version History:**

- **v2.0** (2025-11-02): Initial Colosseum design system master document
- Consolidated all Colosseum documentation
- Added comprehensive component reference
- Established color usage guidelines
- Created migration guide

**Maintained by:** Lending OS Design Team
**Last Review:** 2025-11-02
