"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout, MetricCard, StatusMetric, QuickStats, METRIC_CONFIGS } from "@/components/shared/dashboard-layout";
import { IconCalendar, IconTrendingUp, IconAlertCircle, IconCircleCheck, IconClock, IconCurrencyDollar, IconPlus, IconFilter, IconActivity, IconGitBranch } from "@tabler/icons-react";
import { Draw, Inspection } from "@/types/draw";
import { DrawStatusValues as DrawStatus } from "@/db/schema";
import { useDraws, useDrawMetrics, useApproveDraw, useRejectDraw } from "@/hooks/useDraws";
import { useInspections } from "@/hooks/useInspections";
import { PageLoader } from "@/components/shared/page-loader";
import { WorkflowViewer, WorkflowStatus, WorkflowLegend } from "@/components/workflows";

// TODO: Create these missing components
const DrawRequestList = ({ draws, onViewDetails, onDrawAction, viewOnly }: any) => <div>DrawRequestList Component (TODO)</div>;
const DrawApprovalWorkflow = ({ drawId, draw, onApprove, onReject, viewOnly }: any) => <div>DrawApprovalWorkflow Component (TODO)</div>;
const DrawStatusTracker = ({ draw }: any) => <div>DrawStatusTracker Component (TODO)</div>;
const DrawScheduleView = ({ loanId }: any) => <div>DrawScheduleView Component (TODO)</div>;
const DrawProgressChart = ({ draws }: any) => <div>DrawProgressChart Component (TODO)</div>;

// Helper function to normalize dates to strings
function normalizeDateToString(date: Date | string | null | undefined): string {
  if (!date) return '';
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  return '';
}

interface DrawDashboardProps {
  loanId: string;
  className?: string;
  viewOnly?: boolean;
}

interface DrawActivity {
  id: string;
  type: 'request' | 'approval' | 'inspection' | 'payment' | 'rejection';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  drawId: string;
  amount?: number;
}

export function DrawDashboard({ loanId, className, viewOnly = false }: DrawDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  // Use custom hooks for data fetching
  const { data: draws = [], isLoading: drawsLoading, error: drawsError, refetch: refetchDraws } = useDraws({ loanId, timeRange });
  const { data: drawMetrics, isLoading: metricsLoading, error: metricsError } = useDrawMetrics({ loanId, timeRange });
  const { data: inspections = [], isLoading: inspectionsLoading, error: inspectionsError } = useInspections({ loanId });
  
  const isLoading = drawsLoading || metricsLoading || inspectionsLoading;
  const error = drawsError || metricsError || inspectionsError;

  // Use mutations for draw actions
  const approveDrawMutation = useApproveDraw();
  const rejectDrawMutation = useRejectDraw();

  // Filter inspections related to draws
  const drawRelatedInspections = useMemo(
    () => inspections.filter((inspection) => Boolean(inspection.drawId)),
    [inspections],
  );

  // Generate activity feed from draws and inspections
  const activities = useMemo<DrawActivity[]>(() => {
    const feed: DrawActivity[] = [];

    // Add draw activities
    draws.forEach((rawDraw) => {
      const draw = rawDraw as unknown as Draw;
      const requestedAmount = Number.parseFloat(draw.amountRequested ?? "0");
      feed.push({
        id: `draw-${draw.id}`,
        type: 'request',
        title: `Draw Request #${draw.id.slice(-6)}`,
        description: `Requested $${requestedAmount.toLocaleString()} for draw request`,
        timestamp: normalizeDateToString(draw.requestedDate || draw.createdAt),
        user: draw.requestedBy || 'Unknown',
        drawId: draw.id,
        amount: requestedAmount,
      });

      if (draw.status === DrawStatus.APPROVED) {
        feed.push({
          id: `approval-${draw.id}`,
          type: 'approval',
          title: `Draw Approved #${draw.id.slice(-6)}`,
          description: `Approved for $${requestedAmount.toLocaleString()}`,
          timestamp: normalizeDateToString(draw.approvedDate || draw.updatedAt),
          user: draw.approvedBy || 'Unknown',
          drawId: draw.id,
          amount: requestedAmount,
        });
      }

      if (draw.status === DrawStatus.REJECTED) {
        feed.push({
          id: `rejection-${draw.id}`,
          type: 'rejection',
          title: `Draw Rejected #${draw.id.slice(-6)}`,
          description: draw.rejectionReason || 'Draw request was rejected',
          timestamp: normalizeDateToString(draw.updatedAt),
          user: draw.approvedBy || 'Unknown',
          drawId: draw.id,
          amount: requestedAmount,
        });
      }
    });

    // Add inspection activities
    drawRelatedInspections.forEach((rawInspection) => {
      const inspection = rawInspection as unknown as Inspection;
      feed.push({
        id: `inspection-${inspection.id}`,
        type: 'inspection',
        title: `Inspection Scheduled`,
        description: `Inspection scheduled for draw #${inspection.drawId?.slice(-6)}`,
        timestamp: normalizeDateToString(inspection.scheduledDate || inspection.createdAt),
        user: inspection.inspectorName || 'Unknown',
        drawId: inspection.drawId || ''
      });

      if (inspection.status === 'completed') {
        feed.push({
          id: `inspection-complete-${inspection.id}`,
          type: 'inspection',
          title: `Inspection Completed`,
          description: `Inspection completed for draw #${inspection.drawId?.slice(-6)}`,
          timestamp: normalizeDateToString(inspection.completedDate || inspection.updatedAt),
          user: inspection.inspectorName || 'Unknown',
          drawId: inspection.drawId || ''
        });
      }
    });

    // Sort by timestamp (newest first)
    feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return feed.slice(0, 20); // Show last 20 activities
  }, [draws, drawRelatedInspections]);

  const handleDrawAction = async (drawId: string, action: 'approve' | 'reject', reason?: string) => {
    if (action === 'approve') {
      approveDrawMutation.mutate({ id: drawId, notes: reason });
    } else {
      rejectDrawMutation.mutate({ id: drawId, reason: reason || 'No reason provided' });
    }
  };

  // Calculate metrics
  const totalRequested = draws.reduce((sum, rawDraw) => {
    const draw = rawDraw as unknown as Draw;
    return sum + Number.parseFloat(draw.amountRequested ?? '0');
  }, 0);
  const totalApproved = draws
    .filter((rawDraw) => (rawDraw as unknown as Draw).status === DrawStatus.APPROVED)
    .reduce((sum, rawDraw) => {
      const draw = rawDraw as unknown as Draw;
      return sum + Number.parseFloat(draw.amountRequested ?? '0');
    }, 0);
  
  const pendingDraws = draws.filter((rawDraw) => (rawDraw as unknown as Draw).status === DrawStatus.REQUESTED).length;
  const approvedDraws = draws.filter((rawDraw) => (rawDraw as unknown as Draw).status === DrawStatus.APPROVED).length;
  const rejectedDraws = draws.filter((rawDraw) => (rawDraw as unknown as Draw).status === DrawStatus.REJECTED).length;

  const quickStats = [
    {
      label: "Total Requested",
      value: `$${totalRequested.toLocaleString()}`,
      icon: <IconCurrencyDollar size={20} stroke={2} className="h-5 w-5" />,
      color: "text-blue-600 bg-blue-100"
    },
    {
      label: "Total Approved",
      value: `$${totalApproved.toLocaleString()}`,
      icon: <IconCircleCheck size={20} stroke={2} className="h-5 w-5" />,
      color: "text-brand-success bg-green-100"
    },
    {
      label: "Pending",
      value: pendingDraws,
      icon: <IconClock size={20} stroke={2} className="h-5 w-5" />,
      color: "text-brand-accent bg-yellow-100"
    },
    {
      label: "Rejected",
      value: rejectedDraws,
      icon: <IconAlertCircle size={20} stroke={2} className="h-5 w-5" />,
      color: "text-brand-danger bg-red-100"
    }
  ];

  const drawStatusBreakdown = [
    {
      label: "Approved",
      value: approvedDraws,
      color: "bg-green-100 text-green-800",
      icon: <IconCircleCheck size={20} stroke={2} className="h-4 w-4" />
    },
    {
      label: "Pending",
      value: pendingDraws,
      color: "bg-yellow-100 text-yellow-800",
      icon: <IconClock size={20} stroke={2} className="h-4 w-4" />
    },
    {
      label: "Rejected",
      value: rejectedDraws,
      color: "bg-red-100 text-red-800",
      icon: <IconAlertCircle size={20} stroke={2} className="h-4 w-4" />
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'request': return <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4 text-blue-600" />;
      case 'approval': return <IconCircleCheck size={20} stroke={2} className="h-4 w-4 text-brand-success" />;
      case 'inspection': return <IconCalendar size={20} stroke={2} className="h-4 w-4 text-brand-accent" />;
      case 'rejection': return <IconAlertCircle size={20} stroke={2} className="h-4 w-4 text-brand-danger" />;
      default: return <IconActivity size={20} stroke={2} className="h-4 w-4 text-brand-muted" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'request': return 'border-l-blue-500';
      case 'approval': return 'border-l-green-500';
      case 'inspection': return 'border-l-yellow-500';
      case 'rejection': return 'border-l-red-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <PageLoader
      isLoading={isLoading}
      error={error}
      isEmpty={!draws.length && !isLoading}
      emptyTitle="No draws found"
      emptyMessage="This loan has no draw requests yet."
      onRetry={refetchDraws}
    >
    <DashboardLayout 
      title="Draw Dashboard" 
      subtitle={`Loan ${loanId}`}
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
            New Draw Request
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
          title="Total Draws"
          value={draws.length}
          change={{
            value: 8.2,
            type: 'increase',
            period: 'last month'
          }}
          icon={METRIC_CONFIGS.draw.icon}
        />
        
        <MetricCard
          title="Approval Rate"
          value={`${draws.length > 0 ? ((approvedDraws / draws.length) * 100).toFixed(1) : '0'}%`}
          change={{
            value: 5.3,
            type: 'increase',
            period: 'last month'
          }}
          icon={<IconTrendingUp size={20} stroke={2} className="h-4 w-4" />}
        />

        <StatusMetric
          title="Draw Status"
          total={draws.length}
          breakdown={drawStatusBreakdown}
        />

        <MetricCard
          title="Avg Draw Amount"
          value={`$${draws.length > 0 ? (totalRequested / draws.length).toFixed(0) : '0'}`}
          description="Per draw request"
          icon={METRIC_CONFIGS.draw.icon}
        />
      </div>

      {/* Draw Progress and Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Draw Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <DrawProgressChart draws={draws} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Draw Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <DrawScheduleView loanId={loanId} />
          </CardContent>
        </Card>
      </div>

      {/* Draw Requests and Approval Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Draw Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <DrawRequestList
              draws={draws.slice(0, 5).map((rawDraw) => rawDraw as unknown as Draw)}
              onDrawAction={handleDrawAction}
              viewOnly={viewOnly}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <DrawApprovalWorkflow
              draws={draws
                .filter((rawDraw) => (rawDraw as unknown as Draw).status === DrawStatus.REQUESTED)
                .map((rawDraw) => rawDraw as unknown as Draw)}
              onDrawAction={handleDrawAction}
              viewOnly={viewOnly}
            />
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className={`flex items-start gap-3 p-3 border-l-4 ${getActivityColor(activity.type)} bg-gray-50 rounded-r-lg`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-brand-text">
                      {activity.title}
                    </h4>
                    <span className="text-xs text-brand-muted">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-brand-muted mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-brand-muted">
                      by {activity.user}
                    </span>
                    {activity.amount && (
                      <Badge variant="outline" className="text-xs">
                        ${activity.amount.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
                Draw Request Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowViewer workflowType="draw" />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <WorkflowStatus 
            workflowType="draw"
            currentStep="conduct_inspection"
            progress={60}
          />
          <WorkflowLegend />
        </div>
      </div>
    </DashboardLayout>
    </PageLoader>
  );
}
