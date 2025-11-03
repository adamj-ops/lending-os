"use client";

import { Line, LineChart, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function OverviewRevenueChartSmall({ data }: { data: Array<{ month: string; revenue: number }> }) {
  return (
    <ChartContainer config={{}} className="h-24 w-full">
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" strokeWidth={2} dataKey="revenue" stroke="var(--color-revenue)" activeDot={{ r: 6 }} />
      </LineChart>
    </ChartContainer>
  );
}

