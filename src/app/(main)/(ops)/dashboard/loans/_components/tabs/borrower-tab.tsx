"use client";

import { IconExternalLink, IconUser, IconMail, IconPhone, IconTrendingUp } from "@tabler/icons-react";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KYCStatusBadge } from "@/components/borrowers/KYCStatusBadge";
import type { LoanWithRelations } from "@/types/loan";
import Link from "next/link";

interface BorrowerTabProps {
  loan: LoanWithRelations;
}

export function BorrowerTab({ loan }: BorrowerTabProps) {
  if (!loan.borrower) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <IconUser size={20} stroke={2} className="mb-4 size-12 text-muted-foreground" />
        <p className="text-lg font-medium">No Borrower Assigned</p>
        <p className="text-sm text-muted-foreground">
          This loan does not have an associated borrower yet.
        </p>
        <Button variant="outline" className="mt-4">
          Assign Borrower
        </Button>
      </div>
    );
  }

  const { borrower } = loan;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Borrower Information</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/borrowers/${borrower.id}`}>
              <IconExternalLink size={20} stroke={2} className="mr-2 size-4" />
              View Full Profile
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="flex items-start gap-2">
              <IconUser size={20} stroke={2} className="mt-1 size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="mt-1 text-lg font-semibold">
                  {borrower.firstName} {borrower.lastName}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-start gap-2">
              <IconMail size={20} stroke={2} className="mt-1 size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="mt-1">{borrower.email}</p>
              </div>
            </div>
          </div>

          {/* KYC Status */}
          <div>
            <div className="flex items-start gap-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">KYC Status</p>
                <div className="mt-1">
                  <KYCStatusBadge status={(borrower as any).kycStatus} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

