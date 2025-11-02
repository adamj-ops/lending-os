"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { IconDownload } from "@tabler/icons-react";
import { Calendar as CalendarIcon } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export interface ScheduledPayment {
  id: string;
  paymentNumber: number;
  dueDate: Date | string;
  amount: string;
  principalAmount: string;
  interestAmount: string;
  remainingBalance: string;
  paymentStatus: "scheduled" | "paid" | "late" | "missed";
  paidDate?: Date | string;
  paidAmount?: string;
}

interface PaymentScheduleViewProps {
  loanId: string;
  principal: number;
  rate: number;
  termMonths: number;
  payments: ScheduledPayment[];
  onExport?: () => void;
}

const statusColors = {
  scheduled: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
  paid: "bg-green-500/10 text-green-700 hover:bg-green-500/20",
  late: "bg-orange-500/10 text-orange-700 hover:bg-orange-500/20",
  missed: "bg-red-500/10 text-red-700 hover:bg-red-500/20",
};

export function PaymentScheduleView({
  loanId,
  principal,
  rate,
  termMonths,
  payments,
  onExport,
}: PaymentScheduleViewProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "paymentNumber", desc: false },
  ]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const paidPayments = payments.filter((p) => p.paymentStatus === "paid");
    const totalPaid = paidPayments.reduce(
      (sum, p) => sum + parseFloat(p.paidAmount || p.amount),
      0
    );
    const totalPrincipalPaid = paidPayments.reduce(
      (sum, p) => sum + parseFloat(p.principalAmount),
      0
    );
    const totalInterestPaid = paidPayments.reduce(
      (sum, p) => sum + parseFloat(p.interestAmount),
      0
    );
    const remainingBalance =
      payments.length > 0
        ? parseFloat(payments[payments.length - 1].remainingBalance)
        : principal;
    const progressPercent = ((totalPrincipalPaid / principal) * 100).toFixed(1);

    return {
      totalScheduled: payments.length,
      totalPaid: paidPayments.length,
      totalPaidAmount: totalPaid,
      totalPrincipalPaid,
      totalInterestPaid,
      remainingBalance,
      progressPercent: parseFloat(progressPercent),
    };
  }, [payments, principal]);

  const columns = useMemo<ColumnDef<ScheduledPayment>[]>(
    () => [
      {
        accessorKey: "paymentNumber",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="#" />
        ),
        cell: ({ row }) => {
          return (
            <div className="w-[40px] font-medium">
              {row.getValue("paymentNumber")}
            </div>
          );
        },
      },
      {
        accessorKey: "dueDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Due Date" />
        ),
        cell: ({ row }) => {
          const date = row.getValue("dueDate") as Date | string;
          return (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              {format(new Date(date), "MMM dd, yyyy")}
            </div>
          );
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Payment Amount" />
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
        accessorKey: "remainingBalance",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Balance" />
        ),
        cell: ({ row }) => {
          const balance = parseFloat(row.getValue("remainingBalance"));
          return (
            <div className="text-right font-medium">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          );
        },
      },
      {
        accessorKey: "paymentStatus",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("paymentStatus") as string;
          const payment = row.original;

          return (
            <div className="flex flex-col gap-1">
              <Badge
                variant="secondary"
                className={statusColors[status as keyof typeof statusColors]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              {payment.paidDate && (
                <span className="text-xs text-muted-foreground">
                  Paid: {format(new Date(payment.paidDate), "MMM dd, yyyy")}
                </span>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Loan Progress</CardDescription>
            <CardTitle className="text-3xl">{summary.progressPercent}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={summary.progressPercent} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {summary.totalPaid} of {summary.totalScheduled} payments made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Principal Paid</CardDescription>
            <CardTitle className="text-2xl">
              ${summary.totalPrincipalPaid.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              of ${principal.toLocaleString("en-US", { minimumFractionDigits: 2 })} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Interest Paid</CardDescription>
            <CardTitle className="text-2xl">
              ${summary.totalInterestPaid.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              At {rate.toFixed(3)}% annual rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Remaining Balance</CardDescription>
            <CardTitle className="text-2xl">
              ${summary.remainingBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {termMonths - summary.totalPaid} payments remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedule Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Schedule</CardTitle>
              <CardDescription>
                Complete amortization schedule for this loan
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onExport}>
              <IconDownload size={20} stroke={2} className="mr-2 h-4 w-4" />
              Export Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <DataTable table={table} columns={columns} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
