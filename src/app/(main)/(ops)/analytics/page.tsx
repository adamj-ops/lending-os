"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconAlertTriangle } from "@tabler/icons-react";
import { RecentEventsWidget } from "@/components/analytics/recent-events-widget";
import { AnalyticsKpisWithExport } from "./analytics-kpis-with-export";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import type { AnalyticsFilters as FilterType } from "@/types/analytics";

export default function AnalyticsOverview() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<FilterType>({});

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: FilterType = {};
    if (searchParams.get("startDate")) urlFilters.startDate = searchParams.get("startDate") || undefined;
    if (searchParams.get("endDate")) urlFilters.endDate = searchParams.get("endDate") || undefined;
    if (searchParams.get("loanIds")) urlFilters.loanIds = searchParams.get("loanIds")?.split(",").filter(Boolean);
    if (searchParams.get("propertyIds")) urlFilters.propertyIds = searchParams.get("propertyIds")?.split(",").filter(Boolean);
    if (searchParams.get("statuses")) urlFilters.statuses = searchParams.get("statuses")?.split(",").filter(Boolean);
    if (searchParams.get("fundIds")) urlFilters.fundIds = searchParams.get("fundIds")?.split(",").filter(Boolean);
    setFilters(urlFilters);
  }, [searchParams]);

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    
    // Update URL params for bookmarkable/shareable filters
    const params = new URLSearchParams();
    if (newFilters.startDate) params.set("startDate", newFilters.startDate);
    if (newFilters.endDate) params.set("endDate", newFilters.endDate);
    if (newFilters.loanIds?.length) params.set("loanIds", newFilters.loanIds.join(","));
    if (newFilters.propertyIds?.length) params.set("propertyIds", newFilters.propertyIds.join(","));
    if (newFilters.statuses?.length) params.set("statuses", newFilters.statuses.join(","));
    if (newFilters.fundIds?.length) params.set("fundIds", newFilters.fundIds.join(","));
    
    router.push(`/analytics?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
          <p className="text-muted-foreground">
            Comprehensive view of portfolio performance across all domains
          </p>
        </div>
      </div>

      <AnalyticsFilters onFilterChange={handleFilterChange} initialFilters={filters} />

      <AnalyticsKpisWithExport filters={filters} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconAlertTriangle size={20} stroke={2} className="h-5 w-5" />
              Key Insights
            </CardTitle>
            <CardDescription>AI-powered analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-lg border border-blue-600 p-3 bg-transparent dark:border-blue-400">
                <h4 className="mb-1 text-sm font-semibold text-blue-600 dark:text-blue-400">Portfolio Health</h4>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Your portfolio shows strong performance with 92.5% of loans performing on schedule.
                </p>
              </div>
              <div className="rounded-lg border border-green-600 p-3 bg-transparent dark:border-green-400">
                <h4 className="mb-1 text-sm font-semibold text-brand-success dark:text-green-400">Collections Efficiency</h4>
                <p className="text-xs text-brand-success dark:text-green-400">
                  Payment collection is running 3.2 days ahead of schedule on average.
                </p>
              </div>
              <div className="rounded-lg border border-yellow-600 p-3 bg-transparent dark:border-yellow-400">
                <h4 className="mb-1 text-sm font-semibold text-brand-accent dark:text-yellow-400">Inspection Productivity</h4>
                <p className="text-xs text-brand-accent dark:text-yellow-400">
                  Field operations are completing inspections 1.8 hours faster than expected.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <RecentEventsWidget />
      </div>
    </div>
  );
}
