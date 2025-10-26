"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Mail, Phone, Building, Trash, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useDeleteBorrower } from "@/hooks/useBorrowers";
import type { Borrower } from "@/types/borrower";

interface BorrowerWithLoanCount extends Borrower {
  loanCount?: number;
}

export const createColumns = (onEdit: (borrower: Borrower) => void): ColumnDef<BorrowerWithLoanCount>[] => [
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const getDisplayName = (row: any) => {
        const borrower = row.original;
        return borrower.type === "individual"
          ? `${borrower.firstName || ""} ${borrower.lastName || ""}`.trim()
          : borrower.name || "";
      };
      return getDisplayName(rowA).localeCompare(getDisplayName(rowB));
    },
    cell: ({ row }) => {
      const firstName = row.original.firstName;
      const lastName = row.original.lastName;
      const name = row.original.name;
      const companyName = row.original.companyName;
      const type = row.original.type;

      const displayName =
        type === "entity" ? name : `${firstName || ""} ${lastName || ""}`.trim();

      return (
        <div>
          <div className="font-medium">{displayName || "—"}</div>
          {companyName && type === "individual" && (
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              <Building className="size-3" />
              {companyName}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Contact",
    enableSorting: true,
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      const phone = row.original.phone;

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail className="size-3" />
            {email}
          </div>
          {phone && (
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              <Phone className="size-3" />
              {phone}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    enableSorting: true,
    cell: ({ row }) => {
      const type = row.getValue("type") as string;

      return (
        <Badge variant="outline" className="capitalize">
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "creditScore",
    header: "Credit Score",
    enableSorting: true,
    cell: ({ row }) => {
      const score = row.getValue("creditScore") as number | null;

      if (!score) {
        return <span className="text-muted-foreground">—</span>;
      }

      let variant: "default" | "secondary" | "destructive" = "default";
      if (score >= 720) variant = "default";
      else if (score >= 680) variant = "secondary";
      else variant = "destructive";

      return (
        <Badge variant={variant} className="tabular-nums">
          {score}
        </Badge>
      );
    },
  },
  {
    accessorKey: "loanCount",
    header: "Loans",
    enableSorting: true,
    cell: ({ row }) => {
      const count = row.original.loanCount ?? 0;

      return (
        <Badge variant="secondary" className="tabular-nums">
          {count}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const borrower = row.original;
      const deleteBorrower = useDeleteBorrower();

      const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this borrower?")) {
          await deleteBorrower.mutateAsync(borrower.id);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(borrower.email)}>
              Copy email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>View loans</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(borrower)}>
              <Edit className="mr-2 size-4" />
              Edit borrower
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
