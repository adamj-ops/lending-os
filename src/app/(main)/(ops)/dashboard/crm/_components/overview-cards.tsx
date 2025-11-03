"use client";

import { format, subMonths } from "date-fns";
import { Wallet, BadgeDollarSign } from "lucide-react";
import dynamic from "next/dynamic";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import {
  leadsChartData,
  leadsChartConfig,
  proposalsChartData,
  proposalsChartConfig,
  revenueChartData,
  revenueChartConfig,
} from "./crm.config";

const lastMonth = format(subMonths(new Date(), 1), "LLLL");

export function OverviewCards() {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card>
        <CardHeader>
          <CardTitle>New Leads</CardTitle>
          <CardDescription>Last Month</CardDescription>
        </CardHeader>
        <CardContent className="size-full">
          {(() => { const Chart = dynamic(() => import('./overview-leads-chart'), { ssr: false }); return <Chart data={leadsChartData} />; })()}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <span className="text-xl font-semibold tabular-nums">635</span>
          <span className="text-sm font-medium text-green-500">+54.6%</span>
        </CardFooter>
      </Card>

      <Card className="overflow-hidden pb-0">
        <CardHeader>
          <CardTitle>Proposals Sent</CardTitle>
          <CardDescription>Last Month</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          {(() => { const Chart = dynamic(() => import('./overview-proposals-chart'), { ssr: false }); return <Chart data={proposalsChartData} />; })()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="w-fit rounded-lg bg-green-500/10 p-2">
            <Wallet className="size-5 text-green-500" />
          </div>
        </CardHeader>
        <CardContent className="flex size-full flex-col justify-between">
          <div className="space-y-1.5">
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Last 6 Months</CardDescription>
          </div>
          <p className="text-2xl font-medium tabular-nums">$56,050</p>
          <div className="w-fit rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">+22.2%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="bg-destructive/10 w-fit rounded-lg p-2">
            <BadgeDollarSign className="text-destructive size-5" />
          </div>
        </CardHeader>
        <CardContent className="flex size-full flex-col justify-between">
          <div className="space-y-1.5">
            <CardTitle>Projects Won</CardTitle>
            <CardDescription>Last 6 Months</CardDescription>
          </div>
          <p className="text-2xl font-medium tabular-nums">136</p>
          <div className="text-destructive bg-destructive/10 w-fit rounded-md px-2 py-1 text-xs font-medium">-2.5%</div>
        </CardContent>
      </Card>

      <Card className="col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Growth</CardTitle>
          <CardDescription>Year to Date (YTD)</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => { const Chart = dynamic(() => import('./overview-revenue-chart-small'), { ssr: false }); return <Chart data={revenueChartData} />; })()}
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-sm">+35% growth since last year</p>
        </CardFooter>
      </Card>
    </div>
  );
}
