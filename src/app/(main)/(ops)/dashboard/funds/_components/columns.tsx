"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IconDots, IconEdit, IconEye, IconCircleX } from "@tabler/icons-react";
import { formatCurrency } from "@/lib/fund-utils";
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
import { useCloseFund } from "@/hooks/useFunds";
import type { Fund } from "@/types/fund";

const getFundTypeBadgeVariant = (type: string) => {
  const variants: Record<string, "primary" | "secondary" | "outline"> = {
    private: "primary",
    syndicated: "secondary",
    institutional: "outline",
  };
  return variants[type] || "primary";
};

const getFundStatusVariant = (status: string) => {
  const variants: Record<string, "success" | "secondary" | "destructive"> = {
    active: "success",
    closed: "secondary",
    liquidated: "destructive",
  };
  return variants[status] || "secondary";
};

const getDeploymentRateBadge = (rate: number) => {
  if (rate >= 80) return { variant: "success" as const, label: `${rate.toFixed(0)}%` };
  if (rate >= 50) return { variant: "warning" as const, label: `${rate.toFixed(0)}%` };
  return { variant: "secondary" as const, label: `${rate.toFixed(0)}%` };
};

export const createColumns = (
  onEdit: (fund: Fund) => void,
  onView: (fund: Fund) => void
): ColumnDef<Fund>[] => [
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>;
    },
  },
  {
    accessorKey: "fundType",
    header: "Type",
    enableSorting: true,
    cell: ({ row }) => {
      const type = row.getValue("fundType") as string;
      const labels: Record<string, string> = {
        private: "Private",
        syndicated: "Syndicated",
        institutional: "Institutional",
      };
      return (
        <Badge variant={getFundTypeBadgeVariant(type)}>
          {labels[type] || type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const labels: Record<string, string> = {
        active: "Active",
        closed: "Closed",
        liquidated: "Liquidated",
      };
      return (
        <Badge variant={getFundStatusVariant(status)}>
          {labels[status] || status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "totalCapacity",
    header: "Capacity",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const a = parseFloat(rowA.getValue("totalCapacity"));
      const b = parseFloat(rowB.getValue("totalCapacity"));
      return a - b;
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalCapacity"));
      return <div className="tabular-nums">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "totalCommitted",
    header: "Committed",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const a = parseFloat(rowA.getValue("totalCommitted"));
      const b = parseFloat(rowB.getValue("totalCommitted"));
      return a - b;
    },
    cell: ({ row }) => {
      const capacity = parseFloat(row.original.totalCapacity);
      const committed = parseFloat(row.getValue("totalCommitted"));
      const percentage = capacity > 0 ? (committed / capacity) * 100 : 0;

      return (
        <div>
          <div className="tabular-nums">{formatCurrency(committed)}</div>
          <div className="text-muted-foreground text-xs tabular-nums">{percentage.toFixed(0)}% of capacity</div>
        </div>
      );
    },
  },
  {
    accessorKey: "totalDeployed",
    header: "Deployment",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const aCommitted = parseFloat(rowA.original.totalCommitted);
      const aDeployed = parseFloat(rowA.getValue("totalDeployed"));
      const bCommitted = parseFloat(rowB.original.totalCommitted);
      const bDeployed = parseFloat(rowB.getValue("totalDeployed"));
      
      const aRate = aCommitted > 0 ? (aDeployed / aCommitted) * 100 : 0;
      const bRate = bCommitted > 0 ? (bDeployed / bCommitted) * 100 : 0;
      
      return aRate - bRate;
    },
    cell: ({ row }) => {
      const committed = parseFloat(row.original.totalCommitted);
      const deployed = parseFloat(row.getValue("totalDeployed"));
      const deploymentRate = committed > 0 ? (deployed / committed) * 100 : 0;
      const badge = getDeploymentRateBadge(deploymentRate);

      return (
        <div>
          <div className="tabular-nums text-sm">{formatCurrency(deployed)}</div>
          <Badge variant={badge.variant} className="mt-1 tabular-nums">
            {badge.label} deployed
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const fund = row.original;
      const closeFund = useCloseFund();

      const handleClose = async () => {
        if (confirm(`Are you sure you want to close "${fund.name}"? This will prevent new commitments.`)) {
          await closeFund.mutateAsync({ id: fund.id });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <IconDots size={20} stroke={2} className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(fund)}>
              <IconEye size={20} stroke={2} className="mr-2 size-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(fund)}>
              <IconEdit size={20} stroke={2} className="mr-2 size-4" />
              Edit fund
            </DropdownMenuItem>
            {fund.status === "active" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleClose}>
                  <IconCircleX className="mr-2 size-4" />
                  Close fund
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

