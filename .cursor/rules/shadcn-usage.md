# Shadcn UI Usage Guide

## ✅ ALWAYS APPROVED - Use Freely!

**You can add ANY Shadcn component without asking for permission.**

---

## 🚀 Quick Start

### Install Any Component
```bash
npx shadcn@latest add <component-name>
```

### Common Components
```bash
# Layout & Structure
npx shadcn@latest add card
npx shadcn@latest add separator
npx shadcn@latest add tabs
npx shadcn@latest add accordion

# Forms & Inputs
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add textarea
npx shadcn@latest add switch

# Feedback & Overlays
npx shadcn@latest add dialog
npx shadcn@latest add alert-dialog
npx shadcn@latest add toast
npx shadcn@latest add popover
npx shadcn@latest add tooltip

# Navigation
npx shadcn@latest add dropdown-menu
npx shadcn@latest add navigation-menu
npx shadcn@latest add menubar
npx shadcn@latest add breadcrumb

# Data Display
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add skeleton
npx shadcn@latest add progress

# Charts (Recharts based)
npx shadcn@latest add chart
```

---

## 📦 Already Installed Components

These are already in the project - just import and use:

```typescript
// Layout
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Forms
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Feedback
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Navigation
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Data Display
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Charts
import { ChartContainer, ChartTooltip, ChartConfig } from "@/components/ui/chart"

// Icons (Lucide)
import { Check, X, Plus, Trash, Edit, ArrowRight } from "lucide-react"
```

---

## 🎨 Shadcn Ecosystem Libraries

### Pre-Approved Shadcn-Compatible Libraries

#### 1. **Magic UI**
- URL: https://magicui.design/
- Beautiful animated components built on Shadcn
- Use freely for enhanced UI

#### 2. **Aceternity UI**  
- URL: https://ui.aceternity.com/
- Modern animated components
- Built with Shadcn + Framer Motion

#### 3. **Origin UI**
- URL: https://originui.com/
- Production-ready components
- Shadcn-compatible

#### 4. **Shadcn Blocks**
- URL: https://ui.shadcn.com/blocks
- Pre-built page sections
- Copy/paste ready

---

## 🎯 When to Use Shadcn

### ✅ ALWAYS Use Shadcn For:

1. **Forms** - React Hook Form + Shadcn form components
2. **Modals/Dialogs** - Use Shadcn dialog/alert-dialog
3. **Dropdowns** - Use Shadcn dropdown-menu
4. **Data Tables** - Use Shadcn table (already have custom data-table)
5. **Cards** - Use Shadcn card components
6. **Buttons** - Use Shadcn button with variants
7. **Icons** - Use Lucide React (Shadcn default)
8. **Tooltips** - Use Shadcn tooltip
9. **Toasts** - Use Sonner (Shadcn recommended)
10. **Charts** - Use Shadcn chart (Recharts wrapper)

### ❌ DON'T Use Instead:

- Material UI
- Ant Design  
- Chakra UI
- Bootstrap
- Headless UI (use Radix, which powers Shadcn)
- React Icons (use Lucide)

---

## 💡 Best Practices

### 1. Check Shadcn First
Before adding ANY UI component:
```
1. Check: Does Shadcn have this?
2. If YES → Use Shadcn
3. If NO → Check Shadcn ecosystem (Magic UI, etc.)
4. If still NO → Then ask user
```

### 2. Customize with Tailwind
Shadcn components are designed to be customized:
```tsx
// Good - customize with Tailwind classes
<Button className="bg-green-500 hover:bg-green-600">
  Custom Button
</Button>

// Good - use built-in variants
<Button variant="destructive" size="lg">
  Delete
</Button>
```

### 3. Use Component Composition
```tsx
// Good - compose Shadcn components
<Card>
  <CardHeader>
    <CardTitle>Loan Details</CardTitle>
    <CardDescription>View loan information</CardDescription>
  </CardHeader>
  <CardContent>
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        {/* Content */}
      </TabsContent>
    </Tabs>
  </CardContent>
</Card>
```

### 4. Leverage Lucide Icons
```tsx
import { DollarSign, TrendingUp, AlertCircle } from "lucide-react"

<div className="flex items-center gap-2">
  <DollarSign className="h-4 w-4" />
  <span>$450,000</span>
</div>
```

---

## 🔍 Finding Components

### Shadcn Official Docs
- https://ui.shadcn.com/docs/components
- Browse all available components
- See usage examples

### Shadcn Registry
- https://ui.shadcn.com/registry
- Community-contributed components
- Themes and presets

---

## 📝 Common Patterns in This Project

### 1. Form Pattern (Already Using)
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Use in component
const form = useForm({
  resolver: zodResolver(formSchema),
})
```

### 2. Card Pattern (Already Using)
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

<Card className="shadow-xs">
  <CardHeader>
    <CardTitle>Portfolio Overview</CardTitle>
    <CardDescription>Track your lending metrics</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### 3. Data Display Pattern
```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Overdue</Badge>
```

---

## ⚡ Quick Reference

| Need | Use Shadcn |
|------|------------|
| Button | `<Button>` |
| Input field | `<Input>` |
| Form | `<Form>` + React Hook Form |
| Modal | `<Dialog>` |
| Dropdown | `<DropdownMenu>` |
| Card | `<Card>` |
| Table | `<Table>` |
| Icon | Lucide React |
| Toast | `toast()` from Sonner |
| Select | `<Select>` |
| Checkbox | `<Checkbox>` |
| Badge | `<Badge>` |
| Tabs | `<Tabs>` |

---

## 🎉 Summary

**Shadcn UI = Always Approved ✅**

- Use the CLI freely
- Add any component you need  
- Customize with Tailwind
- Use ecosystem libraries (Magic UI, etc.)
- NO permission needed
- Maintains design consistency automatically

