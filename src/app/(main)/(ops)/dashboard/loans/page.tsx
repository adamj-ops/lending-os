"use client";

import { useEffect, useState, useCallback } from "react";
import { IconPlus } from "@tabler/icons-react";
import { SimpleDataTable as DataTable } from "@/components/data-table/simple-data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createColumns } from "./_components/columns";
import { LoanDetailDrawer } from "./_components/loan-detail-drawer";
import { LoanWizard } from "./_components/loan-wizard";
import type { Loan } from "@/types/loan";
import { getDraft } from "@/features/loan-builder/store";
import { Badge } from "@/components/ui/badge";

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const checkDraft = useCallback(() => {
    const draft = getDraft();
    setHasDraft(!!draft);
  }, []);

  const fetchLoans = useCallback(async () => {
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
  }, []);

  const handleWizardComplete = useCallback(() => {
    fetchLoans();
    checkDraft();
  }, [fetchLoans, checkDraft]);

  useEffect(() => {
    fetchLoans();
    checkDraft();
  }, [fetchLoans, checkDraft]);

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
          <IconPlus size={20} stroke={2} className="mr-2 size-4" />
          New Loan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Loans</CardTitle>
          <CardDescription>View and manage all loans in your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {hasDraft && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    Draft
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Unsaved Loan Application
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      You have an incomplete loan application in progress
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWizardOpen(true)}
                  className="border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-900"
                >
                  Continue Draft
                </Button>
              </div>
            </div>
          )}
          
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
        onOpenChange={(open) => {
          setIsWizardOpen(open);
          if (!open) {
            checkDraft();
          }
        }}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}

