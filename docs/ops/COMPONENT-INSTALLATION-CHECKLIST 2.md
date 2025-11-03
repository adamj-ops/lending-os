# Component Installation Checklist - Sprint 4 Week 2

## Quick Reference: What to Install

### ✅ Already Have (No action needed)
- Button, Badge, Card, Table
- Form, Input, Textarea, Label
- Select, Checkbox, Radio Group, Switch
- Dialog, Sheet, Drawer, Tabs
- Calendar, Popover, Dropdown Menu
- Progress, Skeleton, Spinner
- Toast (Sonner), Alert
- File Upload, Empty State
- **Number Input** (just added ✅)

---

## 📋 Installation Commands

### Copy and run all at once:

```bash
# Install NPM dependencies
npm install react-number-format @tanstack/react-table

# Install Shadcn components (run these one by one)
npx shadcn@latest add @ncdai/wheel-picker
npx kibo-ui add combobox
npx kibo-ui add tree
pnpm dlx shadcn@latest add @reui/stepper-title-bar
pnpm dlx shadcn@latest add @reui/statistic-card-1
pnpm dlx shadcn@latest add @reui/statistic-card-4
pnpm dlx shadcn@latest add @reui/statistic-card-7
pnpm dlx shadcn@latest add @reui/statistic-card-14
pnpm dlx shadcn@latest add @reui/sortable-default
```

---

## 🔧 Manual Downloads (from coss.com)

Download these JSON files and let me know when ready, I'll integrate them:

1. **Multi-Select**: https://coss.com/origin/r/comp-536.json
2. **Toast variants** (optional):
   - https://coss.com/origin/r/comp-300.json
   - https://coss.com/origin/r/comp-289.json
   - https://coss.com/origin/r/comp-291.json
   - https://coss.com/origin/r/comp-293.json
3. **Empty State variant** (optional): https://coss.com/origin/r/comp-234.json

---

## 📁 Files I'll Create After Installation

Once components are installed, I'll create:

### DataTable Components (4 files)
- `src/components/data-table/data-table.tsx`
- `src/components/data-table/data-table-column-header.tsx`
- `src/components/data-table/data-table-pagination.tsx`
- `src/components/data-table/data-table-view-options.tsx`

### Payment Components (4 files)
- `src/app/(main)/loans/payments/_components/payment-entry-form.tsx`
- `src/app/(main)/loans/payments/_components/payment-history-table.tsx`
- `src/app/(main)/loans/payments/_components/payment-schedule-view.tsx`
- `src/app/(main)/loans/payments/_components/balance-summary-cards.tsx`

### Draw Components (3 files)
- `src/app/(main)/loans/draws/_components/draw-request-form.tsx`
- `src/app/(main)/loans/draws/_components/draw-approval-workflow.tsx`
- `src/app/(main)/loans/draws/_components/draw-timeline.tsx`

**Total: 11 new business logic components**

---

## 🎯 What Each Component Does

### Payment Components

**1. PaymentEntryForm**
- Record new payments against loans
- Amount breakdown (principal/interest/fees)
- Payment method selection
- Transaction tracking
- Uses: NumberInput, DatePicker, Select, Form

**2. PaymentHistoryTable**
- Sortable, filterable payment list
- Export to CSV
- Row actions (view, edit, reverse)
- Uses: DataTable, Badge, DropdownMenu

**3. PaymentScheduleView**
- Display amortization schedule
- Progress indicator
- Highlight next payment due
- Uses: DataTable, Progress, Card

**4. BalanceSummaryCards**
- Principal balance card
- Interest accrued card
- Total outstanding card
- Next payment due
- Uses: StatisticCard variants

---

### Draw Components

**5. DrawRequestForm**
- Request construction draws
- Budget line item selection
- Work description
- Contractor info
- Document upload
- Uses: NumberInput, DatePicker, Combobox, MultiSelect, FileUpload

**6. DrawApprovalWorkflow**
- Visual workflow stepper
- Approve/reject actions
- Inspection scheduling
- Notes and comments
- Uses: Stepper, Dialog, Textarea

**7. DrawTimeline**
- Chronological draw history
- Status indicators
- Budget utilization chart
- Milestone markers
- Uses: Timeline/Tree, Badge, Progress

---

## 📊 Component Dependency Map

```
PaymentEntryForm
├── NumberInput (✅ installed)
├── DatePicker (need to install)
├── Select (✅ have)
├── Textarea (✅ have)
└── Form (✅ have)

PaymentHistoryTable
├── DataTable (need to create)
├── Badge (✅ have)
├── DropdownMenu (✅ have)
└── Button (✅ have)

PaymentScheduleView
├── DataTable (need to create)
├── Progress (✅ have)
└── Card (✅ have)

BalanceSummaryCards
├── StatisticCard-1 (need to install)
├── StatisticCard-4 (need to install)
├── StatisticCard-7 (need to install)
└── StatisticCard-14 (need to install)

DrawRequestForm
├── NumberInput (✅ installed)
├── DatePicker (need to install)
├── Combobox (need to install)
├── MultiSelect (need to download)
├── Textarea (✅ have)
├── FileUpload (✅ have)
└── Form (✅ have)

DrawApprovalWorkflow
├── Stepper (need to install)
├── Dialog (✅ have)
├── Textarea (✅ have)
├── Button (✅ have)
└── Badge (✅ have)

DrawTimeline
├── Timeline/Tree (need to install)
├── Badge (✅ have)
├── Progress (✅ have)
└── Card (✅ have)
```

---

## ⏱️ Estimated Timeline

### Phase 1: Component Installation (30 min)
- Run NPM install commands (5 min)
- Run Shadcn CLI commands (15 min)
- Download manual components (5 min)
- Verify installations (5 min)

### Phase 2: DataTable Setup (20 min)
- Create base DataTable (5 min)
- Create column header (5 min)
- Create pagination (5 min)
- Create view options (5 min)

### Phase 3: Payment Components (2 hours)
- PaymentEntryForm (45 min)
- PaymentHistoryTable (30 min)
- PaymentScheduleView (30 min)
- BalanceSummaryCards (15 min)

### Phase 4: Draw Components (2 hours)
- DrawRequestForm (60 min)
- DrawApprovalWorkflow (40 min)
- DrawTimeline (20 min)

**Total Estimated Time: ~5 hours**

---

## 🚀 Ready to Start

1. **Run the installation commands above**
2. **Download the manual components from coss.com**
3. **Let me know when complete** - I'll then build all 11 business components

---

## 📝 Notes

- All forms will use Zod schemas we created earlier
- All tables will support sorting, filtering, pagination
- All components will be fully typed with TypeScript
- Components will use existing API v2 endpoints
- Event bus integration for all mutations

---

**Status**: ⏳ Awaiting component installation
**Next**: Build business logic components after installation complete
