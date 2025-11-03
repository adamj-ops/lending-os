"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export default function FinancialOverviewChart({
  data,
  config,
}: {
  data: Array<{ month: string; scheduled: number; expenses: number; income: number }>;
  config: ChartConfig;
}) {
  return (
    <ChartContainer className="max-h-72 w-full" config={config}>
      <BarChart margin={{ left: -25, right: 0, top: 25, bottom: 0 }} accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          tickFormatter={(value: number) => `${value >= 1000 ? value / 1000 + 'k' : value}`}
          domain={[0, 20000]}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="scheduled" stackId="a" fill={(config as any).scheduled.color} />
        <Bar dataKey="expenses" stackId="a" fill={(config as any).expenses.color} />
        <Bar dataKey="income" stackId="a" fill={(config as any).income.color} />
      </BarChart>
    </ChartContainer>
  );
}

