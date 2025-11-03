"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { IconDots, IconDownload } from "@tabler/icons-react";
import { ArrowUpDown } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Payment {
  id: string;
  loanId: string;
  paymentType: "combined" | "principal_only" | "interest_only" | "fee";
  amount: string;
  principalAmount: string;
  interestAmount: string;
  feeAmount: string;
  paymentMethod: string;
  paymentDate: Date | string;
  paymentStatus: "pending" | "processed" | "failed" | "reversed";
  transactionReference?: string;
  processedDate?: Date | string;
  notes?: string;
  createdAt: Date | string;
}

interface PaymentHistoryTableProps {
  loanId: string;
  initialData?: Payment[];
}

const paymentStatusColors = {
  pending: "bg-brand-accent/10 text-yellow-700 hover:bg-brand-accent/20",
  processed: "bg-green-500/10 text-green-700 hover:bg-green-500/20",
  failed: "bg-brand-danger/10 text-red-700 hover:bg-brand-danger/20",
  reversed: "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20",
};

const paymentMethodLabels: Record<string, string> = {
  ach: "ACH",
  wire: "Wire",
  check: "Check",
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  cash: "Cash",
  other: "Other",
};

export function PaymentHistoryTable({
  loanId,
  initialData = [],
}: PaymentHistoryTableProps) {
  const [data, setData] = useState<Payment[]>(initialData);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "paymentDate", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: "paymentDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Payment Date" />
        ),
        cell: ({ row }) => {
          const date = row.getValue("paymentDate") as Date | string;
          return (
            <div className="font-medium">
              {format(new Date(date), "MMM dd, yyyy")}
            </div>
          );
        },
      },
      {
        accessorKey: "paymentType",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => {
          const type = row.getValue("paymentType") as string;
          const typeLabels: Record<string, string> = {
            combined: "Combined",
            principal_only: "Principal",
            interest_only: "Interest",
            fee: "Fee",
          };
          return <div>{typeLabels[type] || type}</div>;
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total Amount" />
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount"));
          return (
            <div className="text-right font-medium">
              ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          );
        },
      },
      {
        accessorKey: "principalAmount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Principal" />
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("principalAmount"));
          return (
            <div className="text-right">
              ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          );
        },
      },
      {
        accessorKey: "interestAmount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Interest" />
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("interestAmount"));
          return (
            <div className="text-right">
              ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          );
        },
      },
      {
        accessorKey: "paymentMethod",
        header: "Method",
        cell: ({ row }) => {
          const method = row.getValue("paymentMethod") as string;
          return <div>{paymentMethodLabels[method] || method}</div>;
        },
      },
      {
        accessorKey: "paymentStatus",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("paymentStatus") as string;
          return (
            <Badge
              variant="secondary"
              className={paymentStatusColors[status as keyof typeof paymentStatusColors]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "transactionReference",
        header: "Reference",
        cell: ({ row }) => {
          const ref = row.getValue("transactionReference") as string;
          return (
            <div className="max-w-[120px] truncate text-sm text-muted-foreground">
              {ref || "—"}
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const payment = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <IconDots size={20} stroke={2} className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(payment.id)}
                >
                  Copy payment ID
                </DropdownMenuItem>
                <DropdownMenuItem>View details</DropdownMenuItem>
                <DropdownMenuSeparator />
                {payment.paymentStatus === "processed" && (
                  <DropdownMenuItem className="text-destructive">
                    Reverse payment
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleExport = () => {
    // Export logic - could generate CSV or call API endpoint
    console.log("Exporting payment history...");
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2">
          {/* Search by reference */}
          <Input
            placeholder="Search by reference..."
            value={
              (table.getColumn("transactionReference")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("transactionReference")
                ?.setFilterValue(event.target.value)
            }
            className="h-8 w-[200px]"
          />

          {/* Filter by status */}
          <Select
            value={
              (table.getColumn("paymentStatus")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) =>
              table
                .getColumn("paymentStatus")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="reversed">Reversed</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter by type */}
          <Select
            value={
              (table.getColumn("paymentType")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) =>
              table
                .getColumn("paymentType")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="combined">Combined</SelectItem>
              <SelectItem value="principal_only">Principal</SelectItem>
              <SelectItem value="interest_only">Interest</SelectItem>
              <SelectItem value="fee">Fee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Button */}
        <Button variant="outline" size="sm" onClick={handleExport}>
          <IconDownload size={20} stroke={2} className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <DataTable table={table} columns={columns} />
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}
