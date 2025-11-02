"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Users } from "lucide-react";
import { OverviewExportButton } from "./overview-export-button";
import { useAnalyticsEventListener } from "@/hooks/useAnalyticsEventListener";
import { DrillDownModal } from "@/components/analytics/drill-down-modal";
import type { AnalyticsFilters, DrillDownEntityType } from "@/types/analytics";

interface AnalyticsKpisWithExportProps {
  filters?: AnalyticsFilters;
  startDate?: string; // Deprecated, use filters instead
  endDate?: string; // Deprecated, use filters instead
}

export function AnalyticsKpisWithExport({ filters, startDate, endDate }: AnalyticsKpisWithExportProps) {
  const [fundData, setFundData] = useState<any>(null);
  const [loanData, setLoanData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [inspectionData, setInspectionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownType, setDrillDownType] = useState<DrillDownEntityType>('loan');
  const [drillDownId, setDrillDownId] = useState<string>('');

  // Support both filters object and legacy startDate/endDate props
  const effectiveFilters = filters || { startDate, endDate };

  // Set up real-time event listener for analytics updates
  const { isConnected, error: listenerError } = useAnalyticsEventListener({
    enabled: true,
    interval: 30000, // Poll every 30 seconds
    eventTypes: ['Loan.Funded', 'Payment.Received', 'Payment.Processed', 'Inspection.Completed', 'Fund.Created', 'Commitment.Activated', 'Distribution.Posted'],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (effectiveFilters.startDate) params.append('start', effectiveFilters.startDate);
        if (effectiveFilters.endDate) params.append('end', effectiveFilters.endDate);
        if (effectiveFilters.loanIds?.length) params.append('loanIds', effectiveFilters.loanIds.join(','));
        if (effectiveFilters.propertyIds?.length) params.append('propertyIds', effectiveFilters.propertyIds.join(','));
        if (effectiveFilters.statuses?.length) params.append('statuses', effectiveFilters.statuses.join(','));
        if (effectiveFilters.fundIds?.length) params.append('fundIds', effectiveFilters.fundIds.join(','));

        const [fundRes, loanRes, paymentRes, inspectionRes] = await Promise.all([
          fetch(`/api/v1/funds/analytics?${params.toString()}`).then(r => r.json()),
          fetch(`/api/v1/loans/analytics?${params.toString()}`).then(r => r.json()),
          fetch(`/api/v1/payments/analytics?${params.toString()}`).then(r => r.json()),
          fetch(`/api/v1/inspections/analytics?${params.toString()}`).then(r => r.json()),
        ]);

        setFundData(fundRes);
        setLoanData(loanRes);
        setPaymentData(paymentRes);
        setInspectionData(inspectionRes);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [effectiveFilters.startDate, effectiveFilters.endDate, effectiveFilters.loanIds, effectiveFilters.propertyIds, effectiveFilters.statuses, effectiveFilters.fundIds]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-transparent">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-16 mt-1.5" />
                </div>
                <div>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-16 mt-1.5" />
                </div>
              </div>
              <div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-12 mt-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const handleCardClick = (type: DrillDownEntityType, idOrDate: string) => {
    setDrillDownType(type);
    setDrillDownId(idOrDate);
    setDrillDownOpen(true);
  };

  const cards = [
    {
      title: 'Capital Deployed',
      subtitle: 'Last 60 days',
      value: `$${fundData?.kpis?.capitalDeployed || '0'}`,
      icon: DollarSign,
      badge: {
        color: 'border border-green-600 text-green-600 dark:border-green-400 dark:text-green-400',
        icon: TrendingUp,
        iconColor: 'text-green-500',
        text: '+12.4%',
      },
      subtext: (
        <span className="text-green-600 font-medium dark:text-green-400">
          +${fundData?.kpis?.capitalDeployed ? (parseFloat(fundData.kpis.capitalDeployed) * 0.124).toFixed(2) + 'k' : '0'}{' '}
          <span className="text-muted-foreground font-normal">vs prev. 60 days</span>
        </span>
      ),
      onClick: () => {
        // Click to drill down to snapshot if available, otherwise show fund details
        const snapshotDate = fundData?.kpis?.snapshotDate;
        if (snapshotDate) {
          handleCardClick('snapshot', snapshotDate);
        }
      },
    },
    {
      title: 'Active Loans',
      subtitle: 'Current portfolio',
      value: `${loanData?.kpis?.activeCount || 0}`,
      icon: Users,
      badge: {
        color: 'border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400',
        icon: TrendingUp,
        iconColor: 'text-blue-500',
        text: '+8.2%',
      },
      subtext: (
        <span className="text-blue-600 font-medium dark:text-blue-400">
          +{Math.floor((loanData?.kpis?.activeCount || 0) * 0.082)}{' '}
          <span className="text-muted-foreground font-normal">vs last month</span>
        </span>
      ),
      onClick: () => {
        const snapshotDate = loanData?.kpis?.snapshotDate;
        if (snapshotDate) {
          handleCardClick('snapshot', snapshotDate);
        }
      },
    },
    {
      title: 'Collections Rate',
      subtitle: 'Last 30 days',
      value: `${paymentData?.kpis?.amountReceived && paymentData?.kpis?.amountScheduled
        ? ((parseFloat(paymentData.kpis.amountReceived) / parseFloat(paymentData.kpis.amountScheduled)) * 100).toFixed(1)
        : '0'}%`,
      icon: TrendingUp,
      badge: {
        color: 'border border-green-600 text-green-600 dark:border-green-400 dark:text-green-400',
        icon: TrendingUp,
        iconColor: 'text-green-500',
        text: '+2.8%',
      },
      subtext: (
        <span className="text-green-600 font-medium dark:text-green-400">
          ${paymentData?.kpis?.amountReceived || '0'} received{' '}
          <span className="text-muted-foreground font-normal">of ${paymentData?.kpis?.amountScheduled || '0'}</span>
        </span>
      ),
      onClick: () => {
        const snapshotDate = paymentData?.kpis?.snapshotDate;
        if (snapshotDate) {
          handleCardClick('snapshot', snapshotDate);
        }
      },
    },
    {
      title: 'Delinquency Rate',
      subtitle: 'Current portfolio',
      value: `${loanData?.kpis?.delinquentCount && loanData?.kpis?.activeCount
        ? ((loanData.kpis.delinquentCount / loanData.kpis.activeCount) * 100).toFixed(1)
        : '0'}%`,
      icon: AlertTriangle,
      badge: {
        color: loanData?.kpis?.delinquentCount > 0
          ? 'border border-red-600 text-red-600 dark:border-red-400 dark:text-red-400'
          : 'border border-green-600 text-green-600 dark:border-green-400 dark:text-green-400',
        icon: loanData?.kpis?.delinquentCount > 0 ? TrendingUp : TrendingDown,
        iconColor: loanData?.kpis?.delinquentCount > 0 ? 'text-red-500' : 'text-green-500',
        text: loanData?.kpis?.delinquentCount > 0 ? `${loanData.kpis.delinquentCount} loans` : '0 loans',
      },
      subtext: (
        <span className={loanData?.kpis?.delinquentCount > 0 ? "text-red-600 font-medium dark:text-red-400" : "text-green-600 font-medium dark:text-green-400"}>
          {loanData?.kpis?.delinquentCount || 0} delinquent{' '}
          <span className="text-muted-foreground font-normal">of {loanData?.kpis?.activeCount || 0} active</span>
        </span>
      ),
      onClick: () => {
        const snapshotDate = loanData?.kpis?.snapshotDate;
        if (snapshotDate) {
          handleCardClick('snapshot', snapshotDate);
        }
      },
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-transparent overflow-hidden rounded-xl border border-border">
        {cards.map((card, i) => (
          <Card
            key={i}
            className={`bg-transparent border-0 shadow-none rounded-none border-y md:border-x md:border-y-0 border-border last:border-0 first:border-0 ${typeof card.onClick === 'function' ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
            onClick={card.onClick}
          >
            <CardContent className="flex flex-col h-full space-y-6 justify-between">
              <div className="space-y-0.5">
                <div className="text-lg font-semibold text-foreground">{card.title}</div>
                <div className="text-sm text-muted-foreground">{card.subtitle}</div>
              </div>
              <div className="flex-1 flex flex-col gap-1.5 justify-between grow">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold tracking-tight">{card.value}</span>
                  <Badge
                    className={`${card.badge.color} px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-none`}
                  >
                    <card.badge.icon className={`w-3 h-3 ${card.badge.iconColor}`} />
                    {card.badge.text}
                  </Badge>
                </div>
                <div className="text-sm">{card.subtext}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-end">
        <OverviewExportButton 
          fundData={fundData}
          loanData={loanData}
          paymentData={paymentData}
          inspectionData={inspectionData}
        />
      </div>
      <DrillDownModal
        isOpen={drillDownOpen}
        onClose={() => setDrillDownOpen(false)}
        entityType={drillDownType}
        entityId={drillDownId}
      />
    </>
  );
}

