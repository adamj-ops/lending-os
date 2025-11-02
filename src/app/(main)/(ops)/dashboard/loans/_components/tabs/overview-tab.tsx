"use client";

import { useState } from "react";
import { IconTrash, IconRefresh } from "@tabler/icons-react";
import { Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoanStatusBadge } from "@/components/loan/loan-status-badge";
import type { LoanWithRelations } from "@/types/loan";
import { LoanStatus } from "@/types/loan";

interface OverviewTabProps {
  loan: LoanWithRelations;
  onUpdate: () => void;
}

export function OverviewTab({ loan, onUpdate }: OverviewTabProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleStatusChange = async (newStatus: LoanStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/v1/loans/${loan.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Loan Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <div className="mt-1">
              <LoanStatusBadge status={loan.status} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Property Address
            </p>
            <p className="mt-1 text-sm">{loan.propertyAddress}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Loan Amount
            </p>
            <p className="mt-1 text-lg font-semibold">
              {formatCurrency(loan.principal || loan.loanAmount || "0")}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Interest Rate
            </p>
            <p className="mt-1 text-lg font-semibold">
              {Number(loan.rate || loan.interestRate || 0).toFixed(2)}%
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Term Length
            </p>
            <p className="mt-1 text-sm">{loan.termMonths} months</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Funded Date
            </p>
            <p className="mt-1 text-sm">{formatDate(loan.fundedDate)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Maturity Date
            </p>
            <p className="mt-1 text-sm">{formatDate(loan.maturityDate)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Status Changed
            </p>
            <p className="mt-1 text-sm">{formatDate(loan.statusChangedAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Edit2 className="mr-2 size-4" />
            Edit Loan
          </Button>
          <Button variant="outline" size="sm" disabled={isUpdating}>
            <IconRefresh size={20} stroke={2} className="mr-2 size-4" />
            Change Status
          </Button>
          <Button variant="outline" size="sm" className="text-destructive">
            <IconTrash size={20} stroke={2} className="mr-2 size-4" />
            Delete Loan
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Entities</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Borrower
            </p>
            {loan.borrower ? (
              <p className="mt-1 text-sm">
                {loan.borrower.firstName} {loan.borrower.lastName}
              </p>
            ) : (
              <Badge variant="secondary" className="mt-1">
                Not Assigned
              </Badge>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Lender</p>
            {loan.lender ? (
              <p className="mt-1 text-sm">{loan.lender.name}</p>
            ) : (
              <Badge variant="secondary" className="mt-1">
                Not Assigned
              </Badge>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Property
            </p>
            {loan.property ? (
              <p className="mt-1 text-sm">
                {loan.property.address}, {loan.property.city}
              </p>
            ) : (
              <Badge variant="secondary" className="mt-1">
                Not Assigned
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

