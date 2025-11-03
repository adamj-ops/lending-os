"use client";

import { IconCurrencyDollar, IconTrendingUp, IconActivity } from "@tabler/icons-react";
import dynamic from "next/dynamic";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { chartColors } from "@/lib/chart-colors";
import { formatCurrency } from "@/lib/utils";

const chartData = [
  { month: "Jan", principal: 2500000, interest: 45000, fees: 5000 },
  { month: "Feb", principal: 2600000, interest: 47000, fees: 5200 },
  { month: "Mar", principal: 2750000, interest: 49500, fees: 5500 },
  { month: "Apr", principal: 2900000, interest: 52000, fees: 5800 },
  { month: "May", principal: 3100000, interest: 55500, fees: 6100 },
  { month: "Jun", principal: 3250000, interest: 58500, fees: 6400 },
  { month: "Jul", principal: 3400000, interest: 61000, fees: 6700 },
  { month: "Aug", principal: 3550000, interest: 63900, fees: 7000 },
  { month: "Sep", principal: 3700000, interest: 66500, fees: 7300 },
  { month: "Oct", principal: 3850000, interest: 69200, fees: 7600 },
  { month: "Nov", principal: 4000000, interest: 72000, fees: 7900 },
  { month: "Dec", principal: 4150000, interest: 74700, fees: 8200 },
];

const chartConfig = {
  principal: {
    label: "Outstanding Principal",
    color: chartColors.primary,
  },
  interest: {
    label: "Interest Received",
    color: chartColors.success,
  },
  fees: {
    label: "Fees",
    color: chartColors.warning,
  },
} as ChartConfig;

export function PortfolioOverview() {
  const totalPrincipal = chartData.reduce((acc, item) => acc + item.principal, 0);
  const totalInterest = chartData.reduce((acc, item) => acc + item.interest, 0);
  const totalFees = chartData.reduce((acc, item) => acc + item.fees, 0);

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Portfolio Overview</CardTitle>
        <CardDescription>Track outstanding principal, interest received, and fees at a glance.</CardDescription>
        <CardAction>
          <Select defaultValue="last-year">
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Separator />
        <div className="flex flex-col items-start justify-between gap-2 py-5 md:flex-row md:items-stretch md:gap-0">
          <div className="flex flex-1 items-center justify-center gap-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border">
              <IconCurrencyDollar size={20} stroke={2} className="stroke-chart-1 size-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase">Total Outstanding</p>
              <p className="font-medium tabular-nums">{formatCurrency(totalPrincipal / 12)}</p>
            </div>
          </div>
          <Separator orientation="vertical" className="!h-auto" />
          <div className="flex flex-1 items-center justify-center gap-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border">
              <IconTrendingUp size={20} stroke={2} className="stroke-chart-2 size-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase">YTD Interest</p>
              <p className="font-medium tabular-nums">{formatCurrency(totalInterest)}</p>
            </div>
          </div>
          <Separator orientation="vertical" className="!h-auto" />
          <div className="flex flex-1 items-center justify-center gap-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border">
              <IconActivity size={20} stroke={2} className="stroke-chart-3 size-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase">Active Loans</p>
              <p className="font-medium tabular-nums">24</p>
            </div>
          </div>
        </div>
        <Separator />
        {(() => {
          const Chart = dynamic(() => import('./portfolio-overview-chart'), { ssr: false });
          return <Chart data={chartData} config={chartConfig} />;
        })()}
      </CardContent>
    </Card>
  );
}
