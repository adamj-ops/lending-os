"use client";

import Link from "next/link";
import { IconTrendingUp, IconTrendingDown, IconFileText, IconChartHistogram } from "@tabler/icons-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const metrics = [
  {
    label: "Total Loans",
    value: "24",
    trend: 12,
    trendDir: "up",
  },
  {
    label: "Active Loans",
    value: "21",
    trend: 5,
    trendDir: "up",
  },
  {
    label: "Avg LTV",
    value: "68%",
    trend: 3,
    trendDir: "down",
  },
];

const analyticsMetrics = [
  {
    label: "Interest Rate",
    value: "12.5%",
    trend: 2,
    trendDir: "up",
  },
  {
    label: "Total Principal",
    value: "$3.3M",
    trend: 8,
    trendDir: "up",
  },
  {
    label: "Delinquency",
    value: "2.1%",
    trend: 1,
    trendDir: "down",
  },
];

export function LoanSummary() {
  const portfolioHealth = 87; // Calculate actual portfolio health percentage

  return (
    <>
      {/* Card 1: Loan Summary */}
      <Card className="shadow-xs">
        <CardHeader className="h-auto">
          <CardTitle className="flex flex-col gap-1">
            <span>Loan Summary</span>
            <span className="text-xs font-normal text-muted-foreground">Portfolio Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Q4 Performance */}
          <div>
            <div className="font-medium text-sm mb-2.5 text-accent-foreground">Q4 Performance</div>
            <div className="grid grid-cols-3 gap-2">
              {metrics.map((item) => (
                <div className="flex flex-col items-start justify-start" key={item.label}>
                  <div className="text-xl font-bold text-foreground">{item.value}</div>
                  <div className="text-xs text-muted-foreground font-medium mb-1">{item.label}</div>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-semibold",
                      item.trendDir === "up" ? "text-green-500" : "text-green-500"
                    )}
                  >
                    {item.trendDir === "up" ? (
                      <IconTrendingUp size={20} stroke={2} className="w-3 h-3" />
                    ) : (
                      <IconTrendingDown size={20} stroke={2} className="w-3 h-3" />
                    )}
                    {item.trendDir === "up" ? "+" : "-"}
                    {item.trend}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Portfolio Health */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-medium text-foreground">Portfolio Health</span>
              <span className="text-xs font-semibold text-foreground">{portfolioHealth}%</span>
            </div>
            <Progress value={portfolioHealth} className="bg-muted" />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2.5 h-auto">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/dashboard/loans">
              <IconFileText size={20} stroke={2} />
              View Loans
            </Link>
          </Button>
          <Button variant="primary" className="flex-1" asChild>
            <Link href="/dashboard/loans?action=new">
              New Loan
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Card 2: Analytics */}
      <Card className="shadow-xs">
        <CardHeader className="h-auto">
          <CardTitle className="flex flex-col gap-1">
            <span>Portfolio Analytics</span>
            <span className="text-xs font-normal text-muted-foreground">Performance Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Key Metrics */}
          <div>
            <div className="font-medium text-sm mb-2.5 text-accent-foreground">Key Metrics</div>
            <div className="grid grid-cols-3 gap-2">
              {analyticsMetrics.map((item) => (
                <div className="flex flex-col items-start justify-start" key={item.label}>
                  <div className="text-xl font-bold text-foreground">{item.value}</div>
                  <div className="text-xs text-muted-foreground font-medium mb-1">{item.label}</div>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-semibold",
                      item.trendDir === "up" ? "text-green-500" : "text-green-500"
                    )}
                  >
                    {item.trendDir === "up" ? (
                      <IconTrendingUp size={20} stroke={2} className="w-3 h-3" />
                    ) : (
                      <IconTrendingDown size={20} stroke={2} className="w-3 h-3" />
                    )}
                    {item.trendDir === "up" ? "+" : "-"}
                    {item.trend}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Performance Trend */}
          <div>
            <div className="font-medium text-sm text-foreground mb-2.5">Performance Trend</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-semibold text-green-500">+15.2%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">This Quarter</span>
                <span className="font-semibold text-green-500">+8.7%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">This Year</span>
                <span className="font-semibold text-green-500">+12.4%</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2.5 h-auto">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/analytics/loans">
              <IconChartHistogram size={20} stroke={2} />
              Analytics
            </Link>
          </Button>
          <Button variant="primary" className="flex-1" asChild>
            <Link href="/analytics">
              Full Report
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
