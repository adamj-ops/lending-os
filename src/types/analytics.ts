/**
 * Analytics Domain Types
 * 
 * TypeScript types for analytics filters, snapshots, and drill-down entities
 */

/**
 * Analytics Filter Configuration
 */
export interface AnalyticsFilters {
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
  loanIds?: string[];
  propertyIds?: string[];
  statuses?: string[];
  fundIds?: string[];
}

/**
 * Drill-down Entity Types
 */
export type DrillDownEntityType = 'loan' | 'payment' | 'inspection' | 'fund' | 'snapshot';

/**
 * Quick Filter Preset Types
 */
export type FilterPreset = '7d' | '30d' | '90d' | 'quarter' | 'year' | 'all' | 'custom';

/**
 * Fund Snapshot Data
 */
export interface FundSnapshot {
  id: string;
  snapshotDate: string;
  totalCommitments: string;
  capitalDeployed: string;
  avgInvestorYield: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * Loan Snapshot Data
 */
export interface LoanSnapshot {
  id: string;
  snapshotDate: string;
  activeCount: number;
  delinquentCount: number;
  avgLtv: string | null;
  totalPrincipal: string;
  interestAccrued: string;
  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * Payment Snapshot Data
 */
export interface PaymentSnapshot {
  id: string;
  snapshotDate: string;
  amountReceived: string;
  amountScheduled: string;
  lateCount: number;
  avgCollectionDays: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * Inspection Snapshot Data
 */
export interface InspectionSnapshot {
  id: string;
  snapshotDate: string;
  scheduledCount: number;
  completedCount: number;
  avgCompletionHours: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * Comprehensive Snapshot Data (from /api/v1/analytics/snapshots/[date])
 */
export interface SnapshotData {
  snapshotDate: string;
  snapshots: {
    fund: FundSnapshot | null;
    loan: LoanSnapshot | null;
    payment: PaymentSnapshot | null;
    inspection: InspectionSnapshot | null;
  };
  trends: {
    fund: FundSnapshot[];
    loan: LoanSnapshot[];
    payment: PaymentSnapshot[];
    inspection: InspectionSnapshot[];
  };
}

/**
 * Fund Analytics KPI Response
 */
export interface FundAnalyticsKpis {
  snapshotDate: string | null;
  totalCommitments: string;
  capitalDeployed: string;
  avgInvestorYield: string | null;
}

/**
 * Loan Analytics KPI Response
 */
export interface LoanAnalyticsKpis {
  snapshotDate: string | null;
  activeCount: number;
  delinquentCount: number;
  avgLtv: string | null;
  totalPrincipal: string;
  interestAccrued: string;
}

/**
 * Payment Analytics KPI Response
 */
export interface PaymentAnalyticsKpis {
  snapshotDate: string | null;
  amountReceived: string;
  amountScheduled: string;
  lateCount: number;
  avgCollectionDays: string | null;
}

/**
 * Inspection Analytics KPI Response
 */
export interface InspectionAnalyticsKpis {
  snapshotDate: string | null;
  scheduledCount: number;
  completedCount: number;
  avgCompletionHours: string | null;
}

/**
 * Fund Analytics API Response
 */
export interface FundAnalyticsResponse {
  kpis: FundAnalyticsKpis;
  series: FundSnapshot[];
}

/**
 * Loan Analytics API Response
 */
export interface LoanAnalyticsResponse {
  kpis: LoanAnalyticsKpis;
  series: LoanSnapshot[];
}

/**
 * Payment Analytics API Response
 */
export interface PaymentAnalyticsResponse {
  kpis: PaymentAnalyticsKpis;
  series: PaymentSnapshot[];
}

/**
 * Inspection Analytics API Response
 */
export interface InspectionAnalyticsResponse {
  kpis: InspectionAnalyticsKpis;
  series: InspectionSnapshot[];
}

/**
 * Entity Details for Drill-down Modal
 */
export interface EntityDetails {
  id: string;
  [key: string]: unknown;
}

/**
 * Drill-down Modal Props
 */
export interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: DrillDownEntityType;
  entityId: string;
}

/**
 * Analytics Filters Component Props
 */
export interface AnalyticsFiltersProps {
  onFilterChange: (filters: AnalyticsFilters) => void;
  initialFilters?: AnalyticsFilters;
}

