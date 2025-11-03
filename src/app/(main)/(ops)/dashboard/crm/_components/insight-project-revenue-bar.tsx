"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export default function InsightProjectRevenueBar({
  data,
  config,
}: {
  data: Array<{ name: string; actual: number; remaining: number }>;
  config: ChartConfig;
}) {
  return (
    <ChartContainer config={config} className="size-full">
      <BarChart accessibilityLayer data={data} layout="vertical">
        <CartesianGrid horizontal={false} />
        <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value: string) => value.slice(0, 3)} hide />
        <XAxis dataKey="actual" type="number" hide />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Bar stackId="a" dataKey="actual" layout="vertical" fill="var(--color-actual)">
          <LabelList dataKey="name" position="insideLeft" offset={8} className="fill-primary-foreground text-xs" />
          <LabelList dataKey="actual" position="insideRight" offset={8} className="fill-primary-foreground text-xs tabular-nums" />
        </Bar>
        <Bar stackId="a" dataKey="remaining" layout="vertical" fill="var(--color-remaining)" radius={[0, 6, 6, 0]}>
          <LabelList dataKey="remaining" position="insideRight" offset={8} className="fill-primary-foreground text-xs tabular-nums" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

