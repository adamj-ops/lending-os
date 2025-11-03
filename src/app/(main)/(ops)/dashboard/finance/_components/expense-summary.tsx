"use client";

import { IconDots } from "@tabler/icons-react";
import { ShoppingBasket, TramFront } from "lucide-react";
import dynamic from "next/dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

const chartData = [{ period: "last-week", groceries: 380, transport: 120, other: 80 }];

const chartConfig = {
  groceries: {
    label: "Groceries",
    color: "var(--chart-1)",
  },
  transport: {
    label: "Transport",
    color: "var(--chart-2)",
  },
  other: {
    label: "Other",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function ExpenseSummary() {
  const totalExpenses = chartData.length ? chartData[0].groceries + chartData[0].transport + chartData[0].other : 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />

        <div className="h-32">
          <ChartContainer config={chartConfig}>
            {(() => {
              const Radial = dynamic(() => import('./expense-summary.radial'), { ssr: false });
              return <Radial data={chartData} total={totalExpenses} />;
            })()}
          </ChartContainer>
        </div>
        <Separator />
        <div className="flex justify-between gap-4">
          <div className="flex flex-1 flex-col items-center space-y-2">
            <div className="bg-muted flex size-10 items-center justify-center rounded-full">
              <ShoppingBasket className="stroke-chart-1 size-5" />
            </div>
            <div className="space-y-0.5 text-center">
              <p className="text-muted-foreground text-xs uppercase">Groceries</p>
              <p className="font-medium tabular-nums">{formatCurrency(chartData[0].groceries)}</p>
            </div>
          </div>
          <Separator orientation="vertical" className="!h-auto" />
          <div className="flex flex-1 flex-col items-center space-y-2">
            <div className="bg-muted flex size-10 items-center justify-center rounded-full">
              <TramFront className="stroke-chart-2 size-5" />
            </div>
            <div className="space-y-0.5 text-center">
              <p className="text-muted-foreground text-xs uppercase">Transport</p>
              <p className="font-medium tabular-nums">{formatCurrency(chartData[0].transport)}</p>
            </div>
          </div>
          <Separator orientation="vertical" className="!h-auto" />
          <div className="flex flex-1 flex-col items-center space-y-2">
            <div className="bg-muted flex size-10 items-center justify-center rounded-full">
              <IconDots size={20} stroke={2} className="stroke-chart-3 size-5" />
            </div>
            <div className="space-y-0.5 text-center">
              <p className="text-muted-foreground text-xs uppercase">Other</p>
              <p className="font-medium tabular-nums">{formatCurrency(chartData[0].other)}</p>
            </div>
          </div>
        </div>
        <span className="text-muted-foreground text-xs tabular-nums">
          Weekly spending is capped at {formatCurrency(2000)}
        </span>
      </CardContent>
    </Card>
  );
}
