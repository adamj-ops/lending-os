import { useQuery } from "@tanstack/react-query";
import type { FundPerformance, FundPortfolioSummary } from "@/types/fund";

/**
 * Hook to get fund performance analytics
 */
export function useFundPerformance(
  fundId: string | null,
  startDate?: Date,
  endDate?: Date,
) {
  return useQuery({
    queryKey: ["fund-performance", fundId, startDate, endDate],
    queryFn: async () => {
      if (!fundId) return null;
      
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());
      
      const response = await fetch(
        `/api/v1/funds/${fundId}/analytics?${params.toString()}`,
      );
      if (!response.ok) throw new Error("Failed to fetch fund performance");
      return (await response.json()) as FundPerformance;
    },
    enabled: !!fundId,
  });
}

/**
 * Hook to get portfolio summary
 */
export function usePortfolioSummary() {
  return useQuery({
    queryKey: ["portfolio-summary"],
    queryFn: async () => {
      const response = await fetch("/api/v1/funds/analytics/portfolio");
      if (!response.ok) throw new Error("Failed to fetch portfolio summary");
      return (await response.json()) as FundPortfolioSummary;
    },
  });
}

