"use client";

import { IconExternalLink, IconMail } from "@tabler/icons-react";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LoanWithRelations } from "@/types/loan";
import Link from "next/link";

interface LenderTabProps {
  loan: LoanWithRelations;
}

export function LenderTab({ loan }: LenderTabProps) {
  if (!loan.lender) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <Building2 className="mb-4 size-12 text-muted-foreground" />
        <p className="text-lg font-medium">No Lender Assigned</p>
        <p className="text-sm text-muted-foreground">
          This loan does not have an associated lender yet.
        </p>
        <Button variant="outline" className="mt-4">
          Assign Lender
        </Button>
      </div>
    );
  }

  const { lender } = loan;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lender Information</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/lenders/${lender.id}`}>
              <IconExternalLink size={20} stroke={2} className="mr-2 size-4" />
              View Full Profile
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="flex items-start gap-2">
              <Building2 className="mt-1 size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Lender Name
                </p>
                <p className="mt-1 text-lg font-semibold">{lender.name}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Entity Type
            </p>
            <Badge variant="outline" className="mt-1">
              {lender.entityType.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

