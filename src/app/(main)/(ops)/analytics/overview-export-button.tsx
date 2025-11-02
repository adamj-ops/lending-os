"use client";

import { ExportButton } from "@/components/analytics/export-button";

interface OverviewExportButtonProps {
  fundData: any;
  loanData: any;
  paymentData: any;
  inspectionData: any;
}

export function OverviewExportButton({ 
  fundData, 
  loanData, 
  paymentData, 
  inspectionData 
}: OverviewExportButtonProps) {
  // Aggregate all KPIs into a single exportable format
  const aggregatedKpis = {
    // Fund KPIs
    "Fund - Capital Deployed": fundData?.kpis?.capitalDeployed || null,
    
    // Loan KPIs
    "Loan - Active Count": loanData?.kpis?.activeCount || null,
    "Loan - Delinquent Count": loanData?.kpis?.delinquentCount || null,
    "Loan - Average LTV": loanData?.kpis?.avgLtv || null,
    "Loan - Total Principal": loanData?.kpis?.totalPrincipal || null,
    "Loan - Interest Accrued": loanData?.kpis?.interestAccrued || null,
    
    // Payment KPIs
    "Payment - Amount Received": paymentData?.kpis?.amountReceived || null,
    "Payment - Amount Scheduled": paymentData?.kpis?.amountScheduled || null,
    "Payment - Late Count": paymentData?.kpis?.lateCount || null,
    "Payment - Avg Collection Days": paymentData?.kpis?.avgCollectionDays || null,
    
    // Inspection KPIs
    "Inspection - Scheduled Count": inspectionData?.kpis?.scheduledCount || null,
    "Inspection - Completed Count": inspectionData?.kpis?.completedCount || null,
    "Inspection - Avg Completion Hours": inspectionData?.kpis?.avgCompletionHours || null,
    
    // Snapshot date
    "Snapshot Date": fundData?.kpis?.snapshotDate || 
                     loanData?.kpis?.snapshotDate || 
                     paymentData?.kpis?.snapshotDate || 
                     inspectionData?.kpis?.snapshotDate || 
                     null,
  };

  return (
    <ExportButton 
      data={{ kpis: aggregatedKpis }} 
      filename="analytics-overview-kpis"
      exportKpis={true}
    />
  );
}

