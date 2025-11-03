# Sprint 4 - UI Components Installation Guide

**Status**: 🚧 In Progress
**Phase**: Week 2 - UI Component Installation

---

## Installation Commands

Run these commands to install all necessary Shadcn/UI components:

### 1. Date Picker Components

```bash
# Install calendar (already have)
# npx shadcn@latest add calendar

# Install wheel picker for mobile-friendly date selection
npx shadcn@latest add @ncdai/wheel-picker
```

**Used in**: PaymentEntryForm, DrawRequestForm, InspectionScheduling

---

### 2. Number Input (Already Added ✅)

File created at: `src/components/ui/number-input.tsx`

**Dependencies needed**:
```bash
npm install react-number-format
```

**Used in**: All forms with monetary/numeric inputs (payment amounts, draw amounts, principal, etc.)

---

### 3. Combobox

```bash
npx kibo-ui add combobox
```

**Used in**: Budget line item selector, contractor selection, searchable dropdowns

---

### 4. Data Table (TanStack Table)

```bash
# Install table component (already have)
# npx shadcn@latest add table

# Install TanStack Table dependency
npm install @tanstack/react-table
```

**Used in**: PaymentHistoryTable, DrawList, LoanList

**Additional files to create**:
- `components/data-table/data-table.tsx` - Base data table component
- `components/data-table/data-table-column-header.tsx` - Sortable column header
- `components/data-table/data-table-pagination.tsx` - Pagination controls
- `components/data-table/data-table-view-options.tsx` - Column visibility toggle
- `components/data-table/data-table-toolbar.tsx` - Filtering toolbar

---

### 5. Stepper (Workflow)

```bash
# Option 1: Tree component (can be adapted)
npx kibo-ui add tree

# Option 2: Actual stepper component
pnpm dlx shadcn@latest add @reui/stepper-title-bar
```

**Used in**: DrawApprovalWorkflow, loan application wizard

---

### 6. Multi-Select

```bash
# Multi-select component
# Install from coss.com registry
```

**URL**: https://coss.com/origin/r/comp-536.json

**Installation**:
1. Download component from URL
2. Add to `src/components/ui/multi-select.tsx`

**Used in**: Multiple budget line items, document categories, filter selections

---

### 7. Timeline Component

```bash
# Tree component (can be used as timeline)
npx kibo-ui add tree
```

**Alternatively**: Create custom timeline component using existing components

**Used in**: DrawTimeline, loan status history

---

### 8. Statistic/Metric Cards

```bash
# Install multiple variants for different use cases

# Statistic Card 1 - Simple stat card
pnpm dlx shadcn@latest add @reui/statistic-card-1

# Statistic Card 4 - With trend indicator
pnpm dlx shadcn@latest add @reui/statistic-card-4

# Statistic Card 7 - With progress bar
pnpm dlx shadcn@latest add @reui/statistic-card-7

# Statistic Card 14 - Multi-stat card
pnpm dlx shadcn@latest add @reui/statistic-card-14
```

**Used in**: BalanceSummaryCards, loan metrics, payment analytics

---

### 9. Sortable (Drag & Drop)

```bash
pnpm dlx shadcn@latest add @reui/sortable-default
```

**Used in**: Reordering budget line items, priority lists

---

### 10. Toast Notifications (Already Have ✅)

We already have `sonner.tsx` ✅

**Additional toast options** (optional):
- https://coss.com/origin/r/comp-300.json
- https://coss.com/origin/r/comp-289.json
- https://coss.com/origin/r/comp-291.json
- https://coss.com/origin/r/comp-293.json

---

### 11. Empty State (Already Have ✅)

We already have `empty.tsx` ✅

**Additional variants** (optional):
- https://coss.com/origin/r/comp-234.json

---

## All Installation Commands (Copy & Paste)

```bash
# Install all dependencies
npm install react-number-format @tanstack/react-table

# Install Shadcn components
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

## Manual Component Installation

For components from coss.com, download and add manually:

### Multi-Select
1. Download from: https://coss.com/origin/r/comp-536.json
2. Save as: `src/components/ui/multi-select.tsx`

### Additional Toast Variants (Optional)
1. https://coss.com/origin/r/comp-300.json
2. https://coss.com/origin/r/comp-289.json
3. https://coss.com/origin/r/comp-291.json
4. https://coss.com/origin/r/comp-293.json

### Additional Empty State (Optional)
1. https://coss.com/origin/r/comp-234.json

---

## DataTable Setup Guide

### Create DataTable Components

After installing `@tanstack/react-table`, create these files:

#### 1. Base DataTable Component

Create: `src/components/data-table/data-table.tsx`

```tsx
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
```

#### 2. DataTable Column Header (Sortable)

Create: `src/components/data-table/data-table-column-header.tsx`

```tsx
"use client"

import { Column } from "@tanstack/react-table"
import { ArrowUpDown, ArrowUp, ArrowDown, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
```

#### 3. DataTable Pagination

Create: `src/components/data-table/data-table-pagination.tsx`

```tsx
"use client"

import { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

## Verification Checklist

After installation, verify you have these components:

### Basic UI (Already Have ✅)
- [x] Button, Badge, Card
- [x] Input, Textarea, Label
- [x] Select, Checkbox, Radio, Switch
- [x] Table, Dialog, Sheet, Drawer
- [x] Form, Calendar, Popover
- [x] Skeleton, Progress, Spinner
- [x] Toast (Sonner)
- [x] File Upload
- [x] Empty State

### New Components (To Install)
- [ ] Date Picker (Wheel Picker)
- [x] Number Input (Added)
- [ ] Combobox
- [ ] Data Table utilities
- [ ] Stepper
- [ ] Multi-Select
- [ ] Timeline/Tree
- [ ] Statistic Cards (4 variants)
- [ ] Sortable

---

## Next Steps

After all components are installed:

1. ✅ Build PaymentEntryForm
2. ✅ Build PaymentHistoryTable
3. ✅ Build PaymentScheduleView
4. ✅ Build BalanceSummaryCards
5. ✅ Build DrawRequestForm
6. ✅ Build DrawApprovalWorkflow
7. ✅ Build DrawTimeline

---

**Status**: Ready for component installation
**Estimated Time**: 30-45 minutes for all installations
