"use client";

import { XAxis, Bar, BarChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format, subMonths } from "date-fns";

const lastMonth = format(subMonths(new Date(), 1), "LLLL");

export default function OverviewLeadsChart({ data }: { data: Array<{ date: string; newLeads: number; disqualified: number }> }) {
  return (
    <ChartContainer className="size-full min-h-24" config={{}} asChild>
      <BarChart accessibilityLayer data={data} barSize={8}>
        <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} hide />
        <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => `${lastMonth}: ${label}`} />} />
        <Bar background={{ fill: "var(--color-background)", radius: 4, opacity: 0.07 }} dataKey="newLeads" stackId="a" fill="var(--color-newLeads)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="disqualified" stackId="a" fill="var(--color-disqualified)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

