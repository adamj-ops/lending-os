"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export function PortfolioOverviewChart({
  data,
  config,
}: {
  data: Array<{ month: string; principal: number; interest: number; fees: number }>;
  config: ChartConfig;
}) {
  return (
    <ChartContainer className="max-h-72 w-full" config={config}>
      <BarChart margin={{ left: -25, right: 0, top: 25, bottom: 0 }} accessibilityLayer data={data}>
        <CartesianGrid vertical={false} opacity={0.1} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          tickFormatter={(value: number) =>
            `${value >= 1000000 ? value / 1000000 + "M" : value >= 1000 ? value / 1000 + "k" : value}`
          }
          domain={[0, 5000000]}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="principal" stackId="a" fill={(config as any).principal.color} radius={[4, 4, 0, 0]} />
        <Bar dataKey="interest" stackId="a" fill={(config as any).interest.color} radius={[4, 4, 0, 0]} />
        <Bar dataKey="fees" stackId="a" fill={(config as any).fees.color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

export default PortfolioOverviewChart;

