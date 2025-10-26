"use client";

import { TrendingUp, DollarSign, Percent, Home } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const metrics = [
  {
    id: 1,
    icon: Home,
    label: "Total Loans",
    value: "24",
    subtitle: "Active portfolio",
  },
  {
    id: 2,
    icon: TrendingUp,
    label: "Active Loans",
    value: "21",
    subtitle: "Currently funded",
  },
  {
    id: 3,
    icon: Percent,
    label: "Avg Interest Rate",
    value: "12.5%",
    subtitle: "Weighted average",
  },
  {
    id: 4,
    icon: DollarSign,
    label: "Avg LTV",
    value: "68%",
    subtitle: "Loan-to-value ratio",
  },
];

export function LoanSummary() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Loan Summary</CardTitle>
        <CardDescription>Key metrics for your lending portfolio at a glance.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="flex items-center gap-3">
              <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-lg">
                <metric.icon className="text-muted-foreground size-6" />
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground text-xs">{metric.label}</p>
                <p className="text-2xl leading-none font-semibold tabular-nums">{metric.value}</p>
                <p className="text-muted-foreground text-xs">{metric.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
