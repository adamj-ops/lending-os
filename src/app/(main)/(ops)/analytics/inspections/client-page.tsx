'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { IconCircleCheck, IconCalendar, IconClock, IconTrendingUp } from "@tabler/icons-react";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import type { AnalyticsFilters as FilterType } from "@/types/analytics";
import { ExportButton } from "@/components/analytics/export-button";
import { useAnalyticsEventListener } from "@/hooks/useAnalyticsEventListener";
import { DrillDownModal } from "@/components/analytics/drill-down-modal";

interface InspectionAnalyticsData {
  kpis: {
    snapshotDate: string | null;
    scheduledCount: number;
    completedCount: number;
    avgCompletionHours: string | null;
  };
  series: any[];
}

export function InspectionsAnalyticsClient() {
  const [data, setData] = useState<InspectionAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterType>({});
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownType, setDrillDownType] = useState<'loan' | 'payment' | 'inspection' | 'fund' | 'snapshot'>('inspection');
  const [drillDownId, setDrillDownId] = useState<string>('');

  // Set up real-time event listener for analytics updates
  useAnalyticsEventListener({
    enabled: true,
    interval: 30000, // Poll every 30 seconds
    eventTypes: ['Inspection.Completed', 'Inspection.Scheduled'],
  });

  const fetchData = async (currentFilters: FilterType) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.startDate) params.append('start', currentFilters.startDate);
      if (currentFilters.endDate) params.append('end', currentFilters.endDate);
      if (currentFilters.loanIds) params.append('loanIds', currentFilters.loanIds.join(','));
      if (currentFilters.propertyIds) params.append('propertyIds', currentFilters.propertyIds.join(','));
      if (currentFilters.statuses) params.append('statuses', currentFilters.statuses.join(','));
      if (currentFilters.fundIds) params.append('fundIds', currentFilters.fundIds.join(','));

      const response = await fetch(`/api/v1/inspections/analytics?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching inspection analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filters);
  }, []);

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const completionRate = data?.kpis?.scheduledCount
    ? ((data.kpis.completedCount / data.kpis.scheduledCount) * 100)
    : 0;

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inspection Analytics</h1>
          <p className="text-muted-foreground">
            Field operations efficiency and inspection performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={data} filename="inspection-trends" label="Export Trends" />
          <ExportButton data={data} filename="inspection-kpis" exportKpis={true} />
        </div>
      </div>

      <AnalyticsFilters onFilterChange={handleFilterChange} initialFilters={filters} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => {
            const snapshotDate = data?.kpis?.snapshotDate;
            if (snapshotDate) {
              setDrillDownType('snapshot');
              setDrillDownId(snapshotDate);
              setDrillDownOpen(true);
            }
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconCalendar size={20} stroke={2} className="h-4 w-4" />
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.kpis?.scheduledCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconCircleCheck size={20} stroke={2} className="h-4 w-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-success">{data?.kpis?.completedCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconTrendingUp size={20} stroke={2} className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary-600">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconClock size={20} stroke={2} className="h-4 w-4" />
              Avg Completion (hrs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.kpis?.avgCompletionHours ? parseFloat(data.kpis.avgCompletionHours).toFixed(1) : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inspection Performance Trends</CardTitle>
          <CardDescription>Historical completion and efficiency metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded flex items-center justify-center">
            <p className="text-muted-foreground">Chart placeholder - {data?.series.length || 0} data points</p>
          </div>
        </CardContent>
      </Card>
      <DrillDownModal
        isOpen={drillDownOpen}
        onClose={() => setDrillDownOpen(false)}
        entityType={drillDownType}
        entityId={drillDownId}
      />
    </div>
  );
}

