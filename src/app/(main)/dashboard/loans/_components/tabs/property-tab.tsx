"use client";

import { ExternalLink, MapPin, DollarSign, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LoanWithRelations } from "@/types/loan";
import Link from "next/link";

interface PropertyTabProps {
  loan: LoanWithRelations;
}

export function PropertyTab({ loan }: PropertyTabProps) {
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

  if (!loan.property) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <Home className="mb-4 size-12 text-muted-foreground" />
        <p className="text-lg font-medium">No Property Assigned</p>
        <p className="text-sm text-muted-foreground">
          This loan does not have an associated property yet.
        </p>
        <Button variant="outline" className="mt-4">
          Assign Property
        </Button>
      </div>
    );
  }

  const { property } = loan;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Property Details</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/properties/${property.id}`}>
              <ExternalLink className="mr-2 size-4" />
              View Full Details
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <div className="flex items-start gap-2">
              <MapPin className="mt-1 size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Address
                </p>
                <p className="mt-1 text-lg font-semibold">{property.address}</p>
                <p className="text-sm text-muted-foreground">
                  {property.city}, {property.state}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Property Type
            </p>
            <Badge variant="outline" className="mt-1">
              {property.propertyType.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

