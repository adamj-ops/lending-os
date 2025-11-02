"use client";

import { useState } from "react";
import { IconPlus, IconAlertCircle } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleDataTable as DataTable } from "@/components/data-table/simple-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useFundCalls } from "@/hooks/useFundCalls";
import { FundCallForm } from "@/components/funds/FundCallForm";
import { formatCurrency } from "@/lib/fund-utils";
import type { FundCall } from "@/types/fund";

interface CallsTabProps {
  fundId: string;
}

export function CallsTab({ fundId }: CallsTabProps) {
  const { data: calls, isLoading } = useFundCalls(fundId);
  const [isIssueDrawerOpen, setIsIssueDrawerOpen] = useState(false);

  const columns: ColumnDef<FundCall>[] = [
    {
      accessorKey: "callNumber",
      header: "Call #",
      cell: ({ row }) => {
        return <div className="font-medium">#{row.getValue("callNumber")}</div>;
      },
    },
    {
      accessorKey: "callAmount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("callAmount"));
        return <div className="tabular-nums">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("dueDate"));
        const isOverdue = date < new Date();
        const status = row.original.status;
        const showWarning = isOverdue && status !== "funded";

        return (
          <div className="flex items-center gap-2">
            <span>{date.toLocaleDateString()}</span>
            {showWarning && (
              <IconAlertCircle size={20} stroke={2} className="size-4 text-destructive" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const date = new Date(row.original.dueDate);
        const isOverdue = date < new Date() && status !== "funded";
        
        const variant = isOverdue 
          ? "destructive" 
          : status === "funded" 
          ? "success" 
          : status === "sent" 
          ? "primary" 
          : "secondary";
        
        const label = isOverdue && status !== "funded" ? "Overdue" : status;
        
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }) => {
        const purpose = row.getValue("purpose") as string | null;
        return <div className="text-sm max-w-xs truncate">{purpose || "-"}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div className="text-sm text-muted-foreground">{date.toLocaleDateString()}</div>;
      },
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Capital Calls</CardTitle>
              <CardDescription>Capital call requests to investors</CardDescription>
            </div>
            <Button onClick={() => setIsIssueDrawerOpen(true)}>
              <IconPlus size={20} stroke={2} className="mr-2 size-4" />
              Issue Call
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : calls && calls.length > 0 ? (
            <DataTable columns={columns} data={calls} />
          ) : (
            <div className="flex h-32 flex-col items-center justify-center gap-2">
              <p className="text-muted-foreground">No capital calls yet</p>
              <Button variant="outline" size="sm" onClick={() => setIsIssueDrawerOpen(true)}>
                <IconPlus size={20} stroke={2} className="mr-2 size-4" />
                Issue first capital call
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Drawer open={isIssueDrawerOpen} onOpenChange={setIsIssueDrawerOpen}>
        <DrawerContent className="h-[75vh] max-h-[75vh]">
          <div className="mx-auto w-full max-w-4xl">
            <DrawerHeader>
              <DrawerTitle>Issue Capital Call</DrawerTitle>
              <DrawerDescription>
                Request capital from investors. They will be notified pro-rata based on their commitments.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <FundCallForm fundId={fundId} onSuccess={() => setIsIssueDrawerOpen(false)} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

