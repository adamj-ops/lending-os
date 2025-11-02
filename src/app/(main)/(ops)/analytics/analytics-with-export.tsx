"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButton } from "@/components/analytics/export-button";

export function AnalyticsWithExport() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Fetch data for export
    fetch('/api/v1/funds/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Export Data</CardTitle>
        <ExportButton data={data} filename="analytics-overview" />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Export analytics data to CSV for further analysis
        </p>
      </CardContent>
    </Card>
  );
}

