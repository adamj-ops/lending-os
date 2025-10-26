"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { SimpleDataTable as DataTable } from "@/components/data-table/simple-data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createColumns } from "./_components/columns";
import { LoanDetailDrawer } from "./_components/loan-detail-drawer";
import { LoanWizard } from "./_components/loan-wizard";
import type { Loan } from "@/types/loan";

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await fetch("/api/v1/loans");
      const result = await response.json();

      if (result.success) {
        setLoans(result.data);
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (loanId: string) => {
    setSelectedLoanId(loanId);
    setIsDrawerOpen(true);
  };

  const columns = createColumns(handleViewDetails);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loans</h1>
          <p className="text-muted-foreground">Manage your loan portfolio</p>
        </div>
        <Button onClick={() => setIsWizardOpen(true)}>
          <Plus className="mr-2 size-4" />
          New Loan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Loans</CardTitle>
          <CardDescription>View and manage all loans in your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={loans} />
          )}
        </CardContent>
      </Card>

      <LoanDetailDrawer
        loanId={selectedLoanId}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onUpdate={fetchLoans}
      />

      <LoanWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onComplete={fetchLoans}
      />
    </div>
  );
}

