"use client";

import { useState } from "react";
import { IconPlus, IconExternalLink } from "@tabler/icons-react";
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
import { useFundAllocations } from "@/hooks/useFundAllocations";
import { FundAllocationForm } from "@/components/funds/FundAllocationForm";
import { formatCurrency } from "@/lib/fund-utils";
import { useRouter } from "next/navigation";
import type { FundAllocationWithLoan } from "@/types/fund";

interface AllocationsTabProps {
  fundId: string;
}

export function AllocationsTab({ fundId }: AllocationsTabProps) {
  const router = useRouter();
  const { data: allocations, isLoading } = useFundAllocations(fundId);
  const [isAllocateDrawerOpen, setIsAllocateDrawerOpen] = useState(false);

  const columns: ColumnDef<FundAllocationWithLoan>[] = [
    {
      accessorKey: "loanId",
      header: "Loan ID",
      cell: ({ row }) => {
        const loanId = row.getValue("loanId") as string;
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 font-mono text-xs"
            onClick={() => router.push(`/dashboard/loans/${loanId}`)}
          >
            {loanId.slice(0, 8)}...
            <IconExternalLink size={20} stroke={2} className="ml-1 size-3" />
          </Button>
        );
      },
    },
    {
      id: "loanDetails",
      header: "Loan Details",
      cell: ({ row }) => {
        const loan = row.original.loan;
        return (
          <div>
            <div className="font-medium">{formatCurrency(parseFloat(loan.loanAmount))}</div>
            <div className="text-muted-foreground text-xs">
              {parseFloat(loan.interestRate).toFixed(2)}% interest
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "allocatedAmount",
      header: "Allocated",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("allocatedAmount"));
        return <div className="tabular-nums">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: "returnedAmount",
      header: "Returned",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("returnedAmount"));
        return <div className="tabular-nums">{formatCurrency(amount)}</div>;
      },
    },
    {
      id: "outstanding",
      header: "Outstanding",
      cell: ({ row }) => {
        const outstanding = row.original.outstandingAmount;
        return <div className="tabular-nums font-medium">{formatCurrency(outstanding)}</div>;
      },
    },
    {
      id: "returnPercentage",
      header: "Return %",
      cell: ({ row }) => {
        const returnPct = row.original.returnPercentage;
        const variant = returnPct >= 100 ? "success" : returnPct >= 50 ? "warning" : "secondary";
        return (
          <Badge variant={variant} className="tabular-nums">
            {returnPct.toFixed(1)}%
          </Badge>
        );
      },
    },
    {
      accessorKey: "allocationDate",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("allocationDate"));
        return <div className="text-sm">{date.toLocaleDateString()}</div>;
      },
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Loan Allocations</CardTitle>
              <CardDescription>Capital allocated from this fund to loans</CardDescription>
            </div>
            <Button onClick={() => setIsAllocateDrawerOpen(true)}>
              <IconPlus size={20} stroke={2} className="mr-2 size-4" />
              Allocate to Loan
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
          ) : allocations && allocations.length > 0 ? (
            <DataTable columns={columns} data={allocations} />
          ) : (
            <div className="flex h-32 flex-col items-center justify-center gap-2">
              <p className="text-muted-foreground">No allocations yet</p>
              <Button variant="outline" size="sm" onClick={() => setIsAllocateDrawerOpen(true)}>
                <IconPlus size={20} stroke={2} className="mr-2 size-4" />
                Allocate capital to first loan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Drawer open={isAllocateDrawerOpen} onOpenChange={setIsAllocateDrawerOpen}>
        <DrawerContent className="h-[75vh] max-h-[75vh]">
          <div className="mx-auto w-full max-w-4xl">
            <DrawerHeader>
              <DrawerTitle>Allocate Capital to Loan</DrawerTitle>
              <DrawerDescription>
                Deploy capital from this fund to an active loan.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <FundAllocationForm fundId={fundId} onSuccess={() => setIsAllocateDrawerOpen(false)} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

