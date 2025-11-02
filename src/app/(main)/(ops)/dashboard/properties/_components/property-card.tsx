"use client";

import { IconHome, IconMapPin, IconCurrencyDollar, IconTrendingUp } from "@tabler/icons-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
}

const propertyTypeLabels: Record<string, string> = {
  single_family: "Single Family",
  multi_family: "Multi Family",
  commercial: "Commercial",
  land: "Land",
};

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <IconHome size={20} stroke={2} className="text-muted-foreground size-5" />
            <Badge variant="outline">{propertyTypeLabels[property.propertyType]}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="font-medium">{property.address}</div>
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <IconMapPin size={20} stroke={2} className="size-3" />
            {property.city}, {property.state} {property.zip}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t pt-3">
          <div>
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <IconCurrencyDollar size={20} stroke={2} className="size-3" />
              Purchase Price
            </div>
            <div className="font-medium tabular-nums">
              {formatCurrency(parseFloat(property.purchasePrice))}
            </div>
          </div>
          {property.appraisedValue && (
            <div>
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <IconTrendingUp size={20} stroke={2} className="size-3" />
                Appraised Value
              </div>
              <div className="font-medium tabular-nums">
                {formatCurrency(parseFloat(property.appraisedValue))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

