"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout, MetricCard, StatusMetric, QuickStats, METRIC_CONFIGS } from "@/components/shared/dashboard-layout";
import { MobileInspectionApp } from "@/components/inspections/mobile-inspection-app";
import { WorkflowViewer, WorkflowStatus, WorkflowLegend } from "@/components/workflows";
import { IconCalendar, IconCircleCheck, IconAlertCircle, IconClock, IconMapPin, IconCamera, IconPlus, IconFilter, IconUsers, IconGitBranch } from "@tabler/icons-react";
import { Inspection } from "@/types/inspection";
import { InspectionStatusValues as InspectionStatus } from "@/db/schema/draws";
import { useInspections, useInspectionMetrics, useInspectorWorkload, useUpdateInspection, useCompleteInspection } from "@/hooks/useInspections";
import { PageLoader } from "@/components/shared/page-loader";

// TODO: Create these missing components
const InspectionScheduler = ({ loanId, onInspectionScheduled }: any) => (
  <Card>
    <CardContent className="text-center py-8">
      <p className="text-gray-500">InspectionScheduler Component (TODO)</p>
      <p className="text-sm mt-2 text-gray-400">This component will allow scheduling new inspections</p>
    </CardContent>
  </Card>
);

interface InspectionDashboardProps {
  loanId?: string;
  className?: string;
  viewOnly?: boolean;
}

interface InspectorWorkload {
  inspectorId: string;
  inspectorName: string;
  totalInspections: number;
  completedInspections: number;
  pendingInspections: number;
  overdueInspections: number;
  avgCompletionTime: number; // in hours
}

interface InspectionMetrics {
  totalInspections: number;
  completedInspections: number;
  pendingInspections: number;
  overdueInspections: number;
  avgCompletionTime: number;
  inspectionSuccessRate: number;
}

export function InspectionDashboard({ loanId, className, viewOnly = false }: InspectionDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  // Use custom hooks for data fetching
  const { data: inspections = [], isLoading: inspectionsLoading, error: inspectionsError, refetch: refetchInspections } = useInspections({ loanId, timeRange });
  const { data: apiMetrics, isLoading: metricsLoading, error: metricsError } = useInspectionMetrics({ loanId, timeRange });
  const { data: apiWorkload = [], isLoading: workloadLoading, error: workloadError } = useInspectorWorkload({ timeRange });
  
  const isLoading = inspectionsLoading || metricsLoading || workloadLoading;
  const error = inspectionsError || metricsError || workloadError;

  // Use mutations for updates
  const updateInspectionMutation = useUpdateInspection();
  const completeInspectionMutation = useCompleteInspection();

  // Calculate metrics from inspections data
  const metrics = useMemo<InspectionMetrics | null>(() => {
    if (!inspections.length) return null;

    const totalInspections = inspections.length;
    const completedInspections = inspections.filter(i => i.status === InspectionStatus.COMPLETED).length;
    const pendingInspections = inspections.filter(i => i.status === InspectionStatus.SCHEDULED || i.status === InspectionStatus.IN_PROGRESS).length;
    const overdueInspections = inspections.filter(i => 
      (i.status === InspectionStatus.SCHEDULED || i.status === InspectionStatus.IN_PROGRESS) && 
      i.scheduledDate && new Date(i.scheduledDate) < new Date()
    ).length;

    // Calculate average completion time
    const completedWithTimes = inspections.filter(i => 
      i.status === InspectionStatus.COMPLETED && i.scheduledDate && i.completedDate
    );
    const avgCompletionTime = completedWithTimes.length > 0 
        ? completedWithTimes.reduce((sum, i) => {
          const scheduled = new Date(i.scheduledDate!);
          const completed = new Date(i.completedDate!);
          return sum + (completed.getTime() - scheduled.getTime()) / (1000 * 60 * 60); // hours
        }, 0) / completedWithTimes.length
      : 0;

    const inspectionSuccessRate = totalInspections > 0 
      ? (completedInspections / totalInspections) * 100 
      : 0;

    return {
      totalInspections,
      completedInspections,
      pendingInspections,
      overdueInspections,
      avgCompletionTime,
      inspectionSuccessRate
  };
  }, [inspections]);

  // Calculate inspector workload from inspections data
  const inspectorWorkload = useMemo<InspectorWorkload[]>(() => {
    const workloadMap = new Map<string, InspectorWorkload>();

    inspections.forEach(inspection => {
      const inspectorName = inspection.inspectorName || 'Unknown Inspector';
      const inspectorId = inspectorName; // Use name as ID since inspectorId doesn't exist on Inspection type

      if (!workloadMap.has(inspectorId)) {
        workloadMap.set(inspectorId, {
          inspectorId,
          inspectorName,
          totalInspections: 0,
          completedInspections: 0,
          pendingInspections: 0,
          overdueInspections: 0,
          avgCompletionTime: 0
        });
      }

      const workload = workloadMap.get(inspectorId)!;
      workload.totalInspections++;

      if (inspection.status === InspectionStatus.COMPLETED) {
        workload.completedInspections++;
      } else if (inspection.status === InspectionStatus.SCHEDULED || inspection.status === InspectionStatus.IN_PROGRESS) {
        workload.pendingInspections++;
        
        if (inspection.scheduledDate && new Date(inspection.scheduledDate) < new Date()) {
          workload.overdueInspections++;
        }
      }
    });

    // Calculate average completion time per inspector
    workloadMap.forEach(workload => {
      const inspectorInspections = inspections.filter(i => 
        i.inspectorName === workload.inspectorName && 
        i.status === InspectionStatus.COMPLETED && 
        i.scheduledDate && 
        i.completedDate
      );

      if (inspectorInspections.length > 0) {
        workload.avgCompletionTime = inspectorInspections.reduce((sum, i) => {
          const scheduled = new Date(i.scheduledDate!);
          const completed = new Date(i.completedDate!);
          return sum + (completed.getTime() - scheduled.getTime()) / (1000 * 60 * 60);
        }, 0) / inspectorInspections.length;
      }
    });

    return Array.from(workloadMap.values());
  }, [inspections]);

  const handleInspectionComplete = async (inspectionId: string) => {
    completeInspectionMutation.mutate(inspectionId);
  };

  const quickStats = metrics ? [
    {
      label: "Total Inspections",
      value: metrics.totalInspections,
      icon: <IconCalendar size={20} stroke={2} className="h-5 w-5" />,
      color: "text-blue-600 bg-blue-100"
    },
    {
      label: "Completed",
      value: metrics.completedInspections,
      icon: <IconCircleCheck size={20} stroke={2} className="h-5 w-5" />,
      color: "text-green-600 bg-green-100"
    },
    {
      label: "Pending",
      value: metrics.pendingInspections,
      icon: <IconClock size={20} stroke={2} className="h-5 w-5" />,
      color: "text-yellow-600 bg-yellow-100"
    },
    {
      label: "Overdue",
      value: metrics.overdueInspections,
      icon: <IconAlertCircle size={20} stroke={2} className="h-5 w-5" />,
      color: "text-red-600 bg-red-100"
    }
  ] : [];

  const inspectionStatusBreakdown = [
    {
      label: "Completed",
      value: inspections.filter(i => i.status === InspectionStatus.COMPLETED).length,
      color: "bg-green-100 text-green-800",
      icon: <IconCircleCheck size={20} stroke={2} className="h-4 w-4" />
    },
    {
      label: "In Progress",
      value: inspections.filter(i => i.status === InspectionStatus.IN_PROGRESS).length,
      color: "bg-blue-100 text-blue-800",
      icon: <IconClock size={20} stroke={2} className="h-4 w-4" />
    },
    {
      label: "Scheduled",
      value: inspections.filter(i => i.status === InspectionStatus.SCHEDULED).length,
      color: "bg-yellow-100 text-yellow-800",
      icon: <IconCalendar size={20} stroke={2} className="h-4 w-4" />
    },
    {
      label: "Cancelled",
      value: inspections.filter(i => i.status === InspectionStatus.CANCELLED).length,
      color: "bg-gray-100 text-gray-800",
      icon: <IconAlertCircle size={20} stroke={2} className="h-4 w-4" />
    }
  ];

  return (
    <PageLoader
      isLoading={isLoading}
      error={error}
      isEmpty={!inspections.length && !isLoading}
      emptyTitle="No inspections found"
      emptyMessage={loanId ? "This loan has no inspections yet." : "No inspections have been scheduled yet."}
      onRetry={refetchInspections}
    >
    <DashboardLayout 
      title="Inspection Dashboard" 
      subtitle={loanId ? `Loan ${loanId}` : "All Inspections"}
      actions={
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
            {!viewOnly && (
          <Button>
            <IconPlus size={20} stroke={2} className="h-4 w-4 mr-2" />
            Schedule Inspection
          </Button>
            )}
        </div>
      }
      className={className}
    >
      {/* Quick Stats */}
      <QuickStats stats={quickStats} />

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Inspections"
          value={metrics?.totalInspections || 0}
          change={{
            value: 15.3,
            type: 'increase',
            period: 'last month'
          }}
          icon={METRIC_CONFIGS.inspection.icon}
        />
        
        <MetricCard
          title="Success Rate"
          value={`${metrics?.inspectionSuccessRate.toFixed(1) || '0'}%`}
          change={{
            value: 3.2,
            type: 'increase',
            period: 'last month'
          }}
          icon={<IconCircleCheck size={20} stroke={2} className="h-4 w-4" />}
        />

        <StatusMetric
          title="Inspection Status"
          total={inspections.length}
          breakdown={inspectionStatusBreakdown}
        />

        <MetricCard
          title="Avg Completion Time"
          value={`${metrics?.avgCompletionTime.toFixed(1) || '0'}h`}
          description="From scheduled to completed"
          icon={<IconClock size={20} stroke={2} className="h-4 w-4" />}
        />
      </div>

      {/* Inspector Workload Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Inspector Workload Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inspectorWorkload.map((workload) => (
              <div key={workload.inspectorId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconUsers size={20} stroke={2} className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{workload.inspectorName}</h3>
                      <p className="text-sm text-gray-600">Inspector ID: {workload.inspectorId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{workload.totalInspections}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{workload.completedInspections}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">{workload.pendingInspections}</div>
                    <div className="text-xs text-gray-600">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{workload.overdueInspections}</div>
                    <div className="text-xs text-gray-600">Overdue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{workload.avgCompletionTime.toFixed(1)}h</div>
                    <div className="text-xs text-gray-600">Avg Time</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${workload.totalInspections > 0 ? (workload.completedInspections / workload.totalInspections) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Inspections and Scheduling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inspections.slice(0, 5).map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <IconMapPin size={20} stroke={2} className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Inspection #{inspection.id.slice(-6)}</h4>
                      <p className="text-xs text-gray-600">{inspection.drawId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      inspection.status === InspectionStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                      inspection.status === InspectionStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                      inspection.status === InspectionStatus.SCHEDULED ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {inspection.status}
                    </Badge>
                    {inspection.photos && inspection.photos.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <IconCamera size={12} stroke={2} className="h-3 w-3" />
                        {inspection.photos.length}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {!viewOnly && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Inspection</CardTitle>
          </CardHeader>
          <CardContent>
            <InspectionScheduler
              loanId={loanId}
                onInspectionScheduled={refetchInspections}
            />
          </CardContent>
        </Card>
        )}
      </div>

      {/* Mobile Inspector Link */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Inspector</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <IconMapPin size={20} stroke={2} className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Field Inspection App</h3>
            <p className="text-gray-600 mb-4">
              Use the mobile inspector app for field inspections with offline support
            </p>
            <Button asChild>
              <a href="/inspector" target="_blank">
                Open Mobile Inspector
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconGitBranch size={20} stroke={2} className="h-5 w-5" />
                Inspection Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowViewer workflowType="inspection" />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <WorkflowStatus 
            workflowType="inspection"
            currentStep="conduct"
            progress={40}
          />
          <WorkflowLegend />
        </div>
      </div>
    </DashboardLayout>
    </PageLoader>
  );
}
