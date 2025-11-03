"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

export default function ExpenseSummaryRadial({
  data,
  total,
}: {
  data: Array<{ period: string; groceries: number; transport: number; other: number }>;
  total: number;
}) {
  return (
    <RadialBarChart margin={{ left: 0, right: 0, top: 0, bottom: 0 }} data={data} endAngle={180} innerRadius={80} outerRadius={130}>
      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
        <Label
          content={({ viewBox }) => {
            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
              return (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 16} className="fill-foreground text-2xl font-bold tabular-nums">
                    {formatCurrency(total)}
                  </tspan>
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 4} className="fill-muted-foreground">
                    Spent
                  </tspan>
                </text>
              );
            }
          }}
        />
      </PolarRadiusAxis>
      <RadialBar dataKey="other" stackId="a" cornerRadius={4} fill="var(--color-other)" className="stroke-card stroke-4" />
      <RadialBar dataKey="transport" stackId="a" cornerRadius={4} fill="var(--color-transport)" className="stroke-card stroke-4" />
      <RadialBar dataKey="groceries" stackId="a" cornerRadius={4} fill="var(--color-groceries)" className="stroke-card stroke-4" />
    </RadialBarChart>
  );
}

