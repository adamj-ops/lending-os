"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { chartColors } from "@/lib/chart-colors";
import { cn } from "@/lib/utils";

interface RevenueChartProps {
  data?: { month: string; current: number; previous?: number }[];
  title?: string;
  subtitle?: string;
}

const defaultData = [
  { month: "Sep", current: 1200 },
  { month: "Oct", current: 1800 },
  { month: "Nov", current: 2200 },
  { month: "Dec", current: 2800 },
  { month: "Jan", current: 3200 },
  { month: "Feb", current: 3800 },
  { month: "Mar", current: 4200 },
  { month: "Apr", current: 4800 },
  { month: "May", current: 6200 },
  { month: "Jun", current: 7200 },
  { month: "Jul", current: 8800 },
  { month: "Aug", current: 10200 },
  { month: "Sep", current: 11800 },
];

export default function RevenueChart({
  data = defaultData,
  title = "Revenue",
  subtitle = "Current period performance",
}: RevenueChartProps) {
  return (
    <Card className={cn("card hover:shadow-md transition-shadow")}>
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="p-0">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.1)" }}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              itemStyle={{ color: "hsl(var(--popover-foreground))" }}
            />
            <Bar
              dataKey="current"
              fill={chartColors.primary}
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


