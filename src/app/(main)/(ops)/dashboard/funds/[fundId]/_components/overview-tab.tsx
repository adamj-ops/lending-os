"use client";

import { IconTrendingUp, IconCurrencyDollar, IconUsers, IconCircleX } from "@tabler/icons-react";
import { Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { QuickStats } from "@/components/shared/dashboard-layout";
import { useCloseFund } from "@/hooks/useFunds";
import { formatCurrency } from "@/lib/fund-utils";
import type { FundWithMetrics } from "@/types/fund";

interface OverviewTabProps {
  fund: FundWithMetrics;
}

export function OverviewTab({ fund }: OverviewTabProps) {
  const closeFund = useCloseFund();

  const handleCloseFund = async () => {
    await closeFund.mutateAsync({ id: fund.id });
  };

  const quickStatsData = [
    {
      label: "Total Capacity",
      value: formatCurrency(parseFloat(fund.totalCapacity)),
      icon: <Target className="h-4 w-4" />,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Committed",
      value: formatCurrency(parseFloat(fund.totalCommitted)),
      icon: <IconUsers size={20} stroke={2} className="h-4 w-4" />,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Deployed",
      value: formatCurrency(parseFloat(fund.totalDeployed)),
      icon: <IconTrendingUp size={20} stroke={2} className="h-4 w-4" />,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Returned",
      value: formatCurrency(parseFloat(fund.totalReturned)),
      icon: <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4" />,
      color: "text-yellow-600 bg-yellow-100",
    },
  ];

  const deploymentBadge = fund.deploymentRate >= 80 ? "success" : fund.deploymentRate >= 50 ? "warning" : "secondary";
  const returnBadge = fund.returnRate >= 50 ? "success" : fund.returnRate >= 20 ? "warning" : "secondary";

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <QuickStats stats={quickStatsData} />

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deployment Rate</CardTitle>
            <CardDescription>Percentage of committed capital deployed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-bold">{fund.deploymentRate.toFixed(1)}%</div>
              <Badge variant={deploymentBadge}>
                {parseFloat(fund.totalDeployed).toLocaleString()} deployed
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              Available to deploy: {formatCurrency(fund.availableCapital)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Return Rate</CardTitle>
            <CardDescription>Percentage of deployed capital returned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-bold">{fund.returnRate.toFixed(1)}%</div>
              <Badge variant={returnBadge}>
                {parseFloat(fund.totalReturned).toLocaleString()} returned
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              Outstanding: {formatCurrency(parseFloat(fund.totalDeployed) - parseFloat(fund.totalReturned))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fund Details */}
      <Card>
        <CardHeader>
          <CardTitle>Fund Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-muted-foreground text-sm">Inception Date</dt>
              <dd className="font-medium">{new Date(fund.inceptionDate).toLocaleDateString()}</dd>
            </div>
            {fund.closingDate && (
              <div>
                <dt className="text-muted-foreground text-sm">Closing Date</dt>
                <dd className="font-medium">{new Date(fund.closingDate).toLocaleDateString()}</dd>
              </div>
            )}
            {fund.targetReturn && (
              <div>
                <dt className="text-muted-foreground text-sm">Target Return</dt>
                <dd className="font-medium">{parseFloat(fund.targetReturn).toFixed(2)}%</dd>
              </div>
            )}
            {fund.managementFeeBps > 0 && (
              <div>
                <dt className="text-muted-foreground text-sm">Management Fee</dt>
                <dd className="font-medium">{(fund.managementFeeBps / 100).toFixed(2)}%</dd>
              </div>
            )}
            {fund.performanceFeeBps > 0 && (
              <div>
                <dt className="text-muted-foreground text-sm">Performance Fee</dt>
                <dd className="font-medium">{(fund.performanceFeeBps / 100).toFixed(2)}%</dd>
              </div>
            )}
            {fund.strategy && (
              <div className="md:col-span-2">
                <dt className="text-muted-foreground text-sm">Investment Strategy</dt>
                <dd className="font-medium mt-1">{fund.strategy}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Activity Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{fund.investorCount}</div>
              <div className="text-muted-foreground text-sm">Investors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{fund.allocationCount}</div>
              <div className="text-muted-foreground text-sm">Loan Allocations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{fund.activeCallCount}</div>
              <div className="text-muted-foreground text-sm">Active Calls</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {fund.status === "active" && (
        <Card>
          <CardHeader>
            <CardTitle>Fund Actions</CardTitle>
            <CardDescription>Manage fund lifecycle</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <IconCircleX className="mr-2 size-4" />
                  Close Fund
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Close Fund</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to close "{fund.name}"? This will prevent new commitments from being added.
                    Existing commitments, calls, and allocations will remain active.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCloseFund}>
                    Close Fund
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

