import type { FundType, FundStatus } from "@/types/fund";

/**
 * Fund Domain Utility Functions
 * 
 * Centralized helpers for fund-related formatting and calculations
 */

export const FUND_TYPE_LABELS: Record<FundType, string> = {
  private: "Private Fund",
  syndicated: "Syndicated Fund",
  institutional: "Institutional Fund",
};

export const FUND_STATUS_LABELS: Record<FundStatus, string> = {
  active: "Active",
  closed: "Closed",
  liquidated: "Liquidated",
};

/**
 * Format currency with consistent styling (no decimals)
 */
export function formatFundCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Alias for formatFundCurrency
 */
export const formatCurrency = formatFundCurrency;

/**
 * Calculate pro-rata share for an investor
 * 
 * @param totalPool - Total commitments in the fund
 * @param individualCommitment - Individual investor's commitment
 * @param amountToDeploy - Amount being deployed/called
 * @returns Pro-rata share for the investor
 */
export function calculateProRataShare(
  totalPool: number,
  individualCommitment: number,
  amountToDeploy: number
): number {
  if (totalPool === 0) return 0;
  return (individualCommitment / totalPool) * amountToDeploy;
}

/**
 * Format percentage with consistent decimal places
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format basis points to percentage
 * 
 * @param bps - Basis points (e.g., 200)
 * @returns Formatted percentage (e.g., "2.00%")
 */
export function bpsToPercentage(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

/**
 * Calculate deployment rate
 */
export function calculateDeploymentRate(deployed: number, committed: number): number {
  if (committed === 0) return 0;
  return (deployed / committed) * 100;
}

/**
 * Calculate return rate
 */
export function calculateReturnRate(returned: number, deployed: number): number {
  if (deployed === 0) return 0;
  return (returned / deployed) * 100;
}

/**
 * Get fund type badge variant
 */
export function getFundTypeBadgeVariant(
  type: FundType
): "default" | "secondary" | "outline" | "destructive" {
  const variants: Record<FundType, "default" | "secondary" | "outline"> = {
    private: "default",
    syndicated: "secondary",
    institutional: "outline",
  };
  return variants[type] || "default";
}

/**
 * Get fund status badge variant
 */
export function getFundStatusBadgeVariant(
  status: FundStatus
): "success" | "secondary" | "destructive" | "default" {
  const variants: Record<FundStatus, "success" | "secondary" | "destructive"> = {
    active: "success",
    closed: "secondary",
    liquidated: "destructive",
  };
  return variants[status] || "secondary";
}

