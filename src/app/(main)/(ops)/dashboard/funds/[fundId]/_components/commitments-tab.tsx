"use client";

import { useState } from "react";
import { IconPlus, IconCircleX } from "@tabler/icons-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFundCommitments, useCancelCommitment } from "@/hooks/useFundCommitments";
import { FundCommitmentForm } from "@/components/funds/FundCommitmentForm";
import { formatCurrency } from "@/lib/fund-utils";
import type { FundCommitmentWithLender } from "@/types/fund";

interface CommitmentsTabProps {
  fundId: string;
}

export function CommitmentsTab({ fundId }: CommitmentsTabProps) {
  const { data: commitments, isLoading } = useFundCommitments(fundId);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const cancelCommitment = useCancelCommitment();

  const handleCancel = async (commitmentId: string, lenderName: string) => {
    await cancelCommitment.mutateAsync({ 
      id: commitmentId, 
      fundId,
      reason: `Cancelled via UI`
    });
  };

  const columns: ColumnDef<FundCommitmentWithLender>[] = [
    {
      accessorKey: "lender.name",
      header: "Lender",
      cell: ({ row }) => {
        const lender = row.original.lender;
        return (
          <div>
            <div className="font-medium">{lender.name}</div>
            <div className="text-muted-foreground text-xs">{lender.entityType}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "committedAmount",
      header: "Committed",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("committedAmount"));
        return <div className="tabular-nums">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: "calledAmount",
      header: "Called",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("calledAmount"));
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
      id: "uncalledAmount",
      header: "Uncalled",
      cell: ({ row }) => {
        const uncalled = row.original.uncalledAmount;
        return <div className="tabular-nums">{formatCurrency(uncalled)}</div>;
      },
    },
    {
      id: "netPosition",
      header: "Net Position",
      cell: ({ row }) => {
        const net = row.original.netPosition;
        const isPositive = net < 0;
        return (
          <div className={isPositive ? "text-brand-success tabular-nums" : "tabular-nums"}>
            {formatCurrency(Math.abs(net))}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "active" ? "success" : status === "fulfilled" ? "secondary" : "destructive";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const commitment = row.original;
        const canCancel = commitment.status === "active" && commitment.uncalledAmount > 0;

        if (!canCancel) return null;

        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <IconCircleX className="mr-2 size-4" />
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Commitment</AlertDialogTitle>
                <AlertDialogDescription>
                  Cancel the commitment from {commitment.lender.name}?
                  Uncalled amount of {formatCurrency(commitment.uncalledAmount)} will be removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, keep it</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleCancel(commitment.id, commitment.lender.name)}>
                  Yes, cancel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Investor Commitments</CardTitle>
              <CardDescription>Capital committed by investors to this fund</CardDescription>
            </div>
            <Button onClick={() => setIsAddDrawerOpen(true)}>
              <IconPlus size={20} stroke={2} className="mr-2 size-4" />
              Add Commitment
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
          ) : commitments && commitments.length > 0 ? (
            <DataTable columns={columns} data={commitments} />
          ) : (
            <div className="flex h-32 flex-col items-center justify-center gap-2">
              <p className="text-muted-foreground">No commitments yet</p>
              <Button variant="outline" size="sm" onClick={() => setIsAddDrawerOpen(true)}>
                <IconPlus size={20} stroke={2} className="mr-2 size-4" />
                Add first commitment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Drawer open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen}>
        <DrawerContent className="h-[75vh] max-h-[75vh]">
          <div className="mx-auto w-full max-w-4xl">
            <DrawerHeader>
              <DrawerTitle>Add Investor Commitment</DrawerTitle>
              <DrawerDescription>
                Record a capital commitment from an investor to this fund.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <FundCommitmentForm fundId={fundId} onSuccess={() => setIsAddDrawerOpen(false)} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

