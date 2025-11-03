"use client";

import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

import {
  leadsBySourceChartData,
  leadsBySourceChartConfig,
  projectRevenueChartData,
  projectRevenueChartConfig,
} from "./crm.config";

export function InsightCards() {
  const totalLeads = leadsBySourceChartData.reduce((acc, curr) => acc + curr.leads, 0);

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-5">
      <Card className="col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle>Leads by Source</CardTitle>
        </CardHeader>
        <CardContent className="max-h-48">
          {(() => { const Chart = dynamic(() => import('./insight-leads-pie'), { ssr: false }); return <Chart data={leadsBySourceChartData} config={leadsBySourceChartConfig} total={totalLeads} />; })()}
        </CardContent>
        <CardFooter className="gap-2">
          <Button size="sm" variant="outline" className="basis-1/2">
            View Full Report
          </Button>
          <Button size="sm" variant="outline" className="basis-1/2">
            Download CSV
          </Button>
        </CardFooter>
      </Card>

      <Card className="col-span-1 xl:col-span-3">
        <CardHeader>
          <CardTitle>Project Revenue vs. Target</CardTitle>
        </CardHeader>
        <CardContent className="size-full max-h-52">
          {(() => { const Chart = dynamic(() => import('./insight-project-revenue-bar'), { ssr: false }); return <Chart data={projectRevenueChartData} config={projectRevenueChartConfig} />; })()}
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-xs">Average progress: 78% · 2 projects above target</p>
        </CardFooter>
      </Card>
    </div>
  );
}
