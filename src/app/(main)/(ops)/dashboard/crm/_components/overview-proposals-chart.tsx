"use client";

import { Area, AreaChart, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format, subMonths } from "date-fns";

const lastMonth = format(subMonths(new Date(), 1), "LLLL");

export default function OverviewProposalsChart({ data }: { data: Array<{ date: string; proposalsSent: number }> }) {
  return (
    <ChartContainer className="size-full min-h-24" config={{}}>
      <AreaChart data={data} margin={{ left: 0, right: 0, top: 5 }}>
        <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} hide />
        <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => `${lastMonth}: ${label}`} hideIndicator />} />
        <Area dataKey="proposalsSent" fill="var(--color-proposalsSent)" fillOpacity={0.05} stroke="var(--color-proposalsSent)" strokeWidth={2} type="monotone" />
      </AreaChart>
    </ChartContainer>
  );
}

