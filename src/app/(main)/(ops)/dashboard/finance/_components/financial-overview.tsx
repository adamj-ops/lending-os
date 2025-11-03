"use client";

import { IconArrowDownLeft, IconArrowUpRight, IconCalendarCheck } from "@tabler/icons-react";
import dynamic from "next/dynamic";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

const chartData = [
  { month: "Jan", scheduled: 2000, expenses: 4000, income: 9500 },
  { month: "Feb", scheduled: 2200, expenses: 4200, income: 9500 },
  { month: "Mar", scheduled: 2100, expenses: 4100, income: 9500 },
  { month: "Apr", scheduled: 2100, expenses: 4100, income: 9500 },
  { month: "May", scheduled: 2200, expenses: 4200, income: 9500 },
  { month: "Jun", scheduled: 2000, expenses: 4000, income: 9500 },
  { month: "Jul", scheduled: 2100, expenses: 4100, income: 9500 },
  { month: "Aug", scheduled: 2100, expenses: 4100, income: 9500 },
  { month: "Sep", scheduled: 2100, expenses: 4100, income: 9500 },
  { month: "Oct", scheduled: 2100, expenses: 4100, income: 9500 },
  { month: "Nov", scheduled: 2100, expenses: 4100, income: 9500 },
  { month: "Dec", scheduled: 2100, expenses: 4100, income: 9500 },
];

const chartConfig = {
  scheduled: {
    label: "Scheduled",
    color: "var(--chart-1)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--chart-2)",
  },
  income: {
    label: "Income",
    color: "var(--chart-3)",
  },
} as ChartConfig;

export function FinancialOverview() {
  const totalIncome = chartData.reduce((acc, item) => acc + item.income, 0);
  const totalExpenses = chartData.reduce((acc, item) => acc + item.expenses, 0);
  const totalScheduled = chartData.reduce((acc, item) => acc + item.scheduled, 0);
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
        <CardDescription>Track your income, expenses, and scheduled amounts at a glance.</CardDescription>
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
              <IconArrowDownLeft className="stroke-chart-1 size-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase">Income</p>
              <p className="font-medium tabular-nums">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
          <Separator orientation="vertical" className="!h-auto" />
          <div className="flex flex-1 items-center justify-center gap-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border">
              <IconArrowUpRight size={20} stroke={2} className="stroke-chart-2 size-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase">Expenses</p>
              <p className="font-medium tabular-nums">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
          <Separator orientation="vertical" className="!h-auto" />
          <div className="flex flex-1 items-center justify-center gap-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border">
              <IconCalendarCheck className="stroke-chart-3 size-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase">Scheduled</p>
              <p className="font-medium tabular-nums">{formatCurrency(totalScheduled)}</p>
            </div>
          </div>
        </div>
        <Separator />
        {(() => {
          const Chart = dynamic(() => import('./financial-overview-chart'), { ssr: false });
          return <Chart data={chartData} config={chartConfig} />;
        })()}
      </CardContent>
    </Card>
  );
}
