"use client";

import { Pie, PieChart, Label, LabelList } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, type ChartConfig } from "@/components/ui/chart";

export default function InsightLeadsPie({
  data,
  config,
  total,
}: {
  data: Array<{ source: string; leads: number; fill: string }>;
  config: ChartConfig;
  total: number;
}) {
  return (
    <ChartContainer config={config} className="size-full">
      <PieChart className="m-0" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie data={data} dataKey="leads" nameKey="source" innerRadius={65} outerRadius={90} paddingAngle={2} cornerRadius={4}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold tabular-nums">
                      {total.toLocaleString()}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 24} className="fill-muted-foreground">
                      Leads
                    </tspan>
                  </text>
                );
              }
            }}
          />
          <LabelList dataKey="category" position="outside" offset={8} className="fill-foreground stroke-0 text-xs" />
          <LabelList dataKey="value" position="inside" className="fill-card-foreground stroke-0 text-xs" />
        </Pie>
        <ChartLegend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          content={() => (
            <ul className="ml-8 flex flex-col gap-3">
              {data.map((item) => (
                <li key={item.source} className="flex w-36 items-center justify-between">
                  <span className="flex items-center gap-2 capitalize">
                    <span className="size-2.5 rounded-full" style={{ background: item.fill }} />
                    {(config as any)[item.source].label}
                  </span>
                  <span className="tabular-nums">{item.leads}</span>
                </li>
              ))}
            </ul>
          )}
        />
      </PieChart>
    </ChartContainer>
  );
}

