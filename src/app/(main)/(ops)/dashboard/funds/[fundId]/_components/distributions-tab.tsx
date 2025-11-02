"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
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
import { useFundDistributions } from "@/hooks/useFundDistributions";
import { FundDistributionForm } from "@/components/funds/FundDistributionForm";
import { formatCurrency } from "@/lib/fund-utils";
import type { FundDistribution } from "@/types/fund";

interface DistributionsTabProps {
  fundId: string;
}

export function DistributionsTab({ fundId }: DistributionsTabProps) {
  const { data: distributions, isLoading } = useFundDistributions(fundId);
  const [isRecordDrawerOpen, setIsRecordDrawerOpen] = useState(false);

  const columns: ColumnDef<FundDistribution>[] = [
    {
      accessorKey: "distributionDate",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("distributionDate"));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalAmount"));
        return <div className="tabular-nums font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: "distributionType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("distributionType") as string;
        const labels: Record<string, string> = {
          return_of_capital: "Return of Capital",
          profit: "Profit",
          interest: "Interest",
        };
        const variant = type === "profit" ? "success" : type === "interest" ? "primary" : "secondary";
        return <Badge variant={variant}>{labels[type] || type}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "processed" ? "success" : status === "cancelled" ? "destructive" : "secondary";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string | null;
        return <div className="text-sm text-muted-foreground max-w-xs truncate">{notes || "-"}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Recorded",
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
              <CardTitle>Distributions</CardTitle>
              <CardDescription>Capital distributions to investors</CardDescription>
            </div>
            <Button onClick={() => setIsRecordDrawerOpen(true)}>
              <IconPlus size={20} stroke={2} className="mr-2 size-4" />
              Record Distribution
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
          ) : distributions && distributions.length > 0 ? (
            <DataTable columns={columns} data={distributions} />
          ) : (
            <div className="flex h-32 flex-col items-center justify-center gap-2">
              <p className="text-muted-foreground">No distributions yet</p>
              <Button variant="outline" size="sm" onClick={() => setIsRecordDrawerOpen(true)}>
                <IconPlus size={20} stroke={2} className="mr-2 size-4" />
                Record first distribution
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Drawer open={isRecordDrawerOpen} onOpenChange={setIsRecordDrawerOpen}>
        <DrawerContent className="h-[75vh] max-h-[75vh]">
          <div className="mx-auto w-full max-w-4xl">
            <DrawerHeader>
              <DrawerTitle>Record Distribution</DrawerTitle>
              <DrawerDescription>
                Record a distribution of capital or profits to investors.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <FundDistributionForm fundId={fundId} onSuccess={() => setIsRecordDrawerOpen(false)} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

