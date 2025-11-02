/**
 * Template for creating new dashboard pages
 *
 * Instructions:
 * 1. Copy this template to src/app/(main)/[feature]/page.tsx
 * 2. Replace [YourFeature] with your feature name
 * 3. Replace [yourEntity] with your entity name
 * 4. Update the import statements
 * 5. Customize metrics and content
 * 6. Remove sections you don't need
 */

"use client";

import { useState } from "react";
import {
  DashboardLayout,
  MetricCard,
  QuickStats,
  PageLoader,
  EmptyState,
} from "@/components/shared";
import { use[YourEntity] } from "@/hooks/use[YourEntity]";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconPlus, IconFilter, Icon[YourIcon] } from "@tabler/icons-react";

export default function [YourFeature]Page() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: items, isLoading, error, refetch } = use[YourEntity]();

  // Calculate metrics from data
  const metrics = {
    total: items?.length || 0,
    active: items?.filter(item => item.status === 'active').length || 0,
    // Add more metrics
  };

  // Quick stats for the top of the page
  const quickStats = [
    {
      label: "Total [YourEntity]",
      value: metrics.total,
      icon: <Icon[YourIcon] className="h-5 w-5" />,
      color: "text-primary bg-primary/10"
    },
    // Add more quick stats
  ];

  return (
    <DashboardLayout
      title="[YourFeature]"
      subtitle="Manage your [yourEntity]"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <IconFilter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            New [YourEntity]
          </Button>
        </div>
      }
    >
      <PageLoader
        isLoading={isLoading}
        error={error}
        isEmpty={items?.length === 0}
        emptyTitle="No [yourEntity] found"
        emptyMessage="Get started by creating your first [yourEntity]"
        emptyAction={{
          label: "Create [YourEntity]",
          onClick: () => setIsDialogOpen(true),
        }}
        onRetry={refetch}
      >
        {/* Quick Stats */}
        <QuickStats stats={quickStats} />

        {/* Main Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total [YourEntity]"
            value={metrics.total}
            change={{
              value: 12.5,
              type: 'increase',
              period: 'last month'
            }}
            icon={<Icon[YourIcon] className="h-4 w-4" />}
          />

          <MetricCard
            title="Active"
            value={metrics.active}
            icon={<Icon[YourIcon] className="h-4 w-4" />}
          />

          {/* Add more metric cards */}
        </div>

        {/* Main Content Area */}
        <Card>
          <CardHeader>
            <CardTitle>Recent [YourEntity]</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add your main content here */}
            <div className="space-y-4">
              {items?.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </PageLoader>

      {/* Add your dialogs/modals here */}
      {/* <YourDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} /> */}
    </DashboardLayout>
  );
}
