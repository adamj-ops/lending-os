"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileInspectionApp, type InspectionData } from "@/components/inspections/mobile-inspection-app";
import { IconCalendar, IconMapPin, IconClock, IconCircleCheck, IconAlertCircle, IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useInspections } from "@/hooks/useInspections";
import { PageLoader } from "@/components/shared";
import { InspectionStatusValues as InspectionStatus } from "@/db/schema/draws";

interface InspectorDashboardProps {
  className?: string;
}

export default function InspectorDashboard({ className }: InspectorDashboardProps) {
  const { data: inspections = [], isLoading, error, refetch } = useInspections();
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'today'>('all');

  const filteredInspections = inspections.filter(inspection => {
    switch (filter) {
      case 'pending':
        return inspection.status === InspectionStatus.SCHEDULED || inspection.status === InspectionStatus.IN_PROGRESS;
      case 'completed':
        return inspection.status === InspectionStatus.COMPLETED;
      case 'today':
        return inspection.scheduledDate === new Date().toISOString().split('T')[0];
      default:
        return true;
    }
  });

  const getStatusVariant = (status: string): "success" | "info" | "warning" | "destructive" | "secondary" => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'scheduled': return 'warning';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <IconCircleCheck size={20} stroke={2} className="h-4 w-4" />;
      case 'in-progress': return <IconClock size={20} stroke={2} className="h-4 w-4" />;
      case 'scheduled': return <IconCalendar size={20} stroke={2} className="h-4 w-4" />;
      case 'cancelled': return <IconAlertCircle size={20} stroke={2} className="h-4 w-4" />;
      default: return <IconCalendar size={20} stroke={2} className="h-4 w-4" />;
    }
  };

  const handleNewInspection = () => {
    setSelectedInspection('new');
  };

  const handleInspectionSelect = (inspectionId: string) => {
    setSelectedInspection(inspectionId);
  };

  const handleInspectionSave = (_inspection: InspectionData) => {
    refetch(); // React Query will automatically refetch the list
  };

  const handleInspectionComplete = (_inspection: InspectionData) => {
    setSelectedInspection(null);
    refetch();
  };

  if (selectedInspection) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-card border-border border-b p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setSelectedInspection(null)}
            className="text-primary"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-lg font-semibold">
            {selectedInspection === 'new' ? 'New Inspection' : `Inspection #${selectedInspection.slice(-6)}`}
          </h1>
        </div>
        
        <MobileInspectionApp
          inspectionId={selectedInspection === 'new' ? undefined : selectedInspection}
          loanId="default-loan"
          onSave={handleInspectionSave}
          onComplete={handleInspectionComplete}
        />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      <div className="bg-card border-border border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Inspector Dashboard</h1>
            <p className="text-sm text-muted-foreground">Field inspection management</p>
          </div>
          <Button onClick={handleNewInspection} variant="primary">
            <IconPlus size={20} stroke={2} className="h-4 w-4 mr-2" />
            New Inspection
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'today', label: 'Today' },
            { key: 'completed', label: 'Completed' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(key as 'all' | 'pending' | 'completed' | 'today')}
              className="text-xs"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Inspections List */}
      <PageLoader
        isLoading={isLoading}
        error={error}
        isEmpty={filteredInspections.length === 0}
        emptyTitle="No inspections found"
        emptyMessage={
          filter === 'all' 
            ? "You don't have any inspections yet."
            : `No ${filter} inspections found.`
        }
        emptyAction={{ label: "Create First Inspection", onClick: handleNewInspection }}
        onRetry={refetch}
      >
        <div className="p-4 space-y-3">
          {filteredInspections.map((inspection) => (
            <Card 
              key={inspection.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleInspectionSelect(inspection.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">Inspection #{inspection.id.slice(-6)}</h3>
                      <Badge variant={getStatusVariant(inspection.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(inspection.status)}
                          {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{(inspection as any).location?.address || 'No location'}</p>
                  </div>
                  {!(inspection as any).synced && (
                    <Badge variant="outline" className="text-xs">
                      Offline
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <IconCalendar size={20} stroke={2} className="h-4 w-4" />
                    {inspection.scheduledDate ? new Date(inspection.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                  </div>
                  <div className="flex items-center gap-1">
                    <IconClock size={20} stroke={2} className="h-4 w-4" />
                    {inspection.inspectorName || 'Unassigned'}
                  </div>
                  {inspection.photos && inspection.photos.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>{inspection.photos.length} photos</span>
                    </div>
                  )}
                </div>

                {inspection.findings && (
                  <div className="mt-3 p-2 bg-muted rounded text-sm text-foreground">
                    {inspection.findings.length > 100
                      ? `${inspection.findings.substring(0, 100)}...`
                      : inspection.findings
                    }
                  </div>
                )}

                {/* Progress Bar - Using findings as proxy for progress */}
                {(inspection as any).checklist && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>
                      {(inspection as any).checklist.filter((item: any) => item.status !== 'pending').length} / {(inspection as any).checklist.length}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((inspection as any).checklist.filter((item: any) => item.status !== 'pending').length / (inspection as any).checklist.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </PageLoader>

      {/* Quick Stats */}
      <div className="p-4 bg-card border-border border-t">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {inspections.filter(i => i.status === InspectionStatus.SCHEDULED || i.status === InspectionStatus.IN_PROGRESS).length}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div>
            <div className="text-lg font-bold text-brand-success">
              {inspections.filter(i => i.status === InspectionStatus.COMPLETED).length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-brand-accent">
              {inspections.filter(i => !(i as any).synced).length}
            </div>
            <div className="text-xs text-muted-foreground">Offline</div>
          </div>
        </div>
      </div>
    </div>
  );
}
