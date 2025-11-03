"use client";

import { useQuery } from "@tanstack/react-query";

interface AnalyticsParams {
  timeRange?: '7d' | '30d' | '90d' | '1y' | 'all';
  entityType?: 'loan' | 'borrower' | 'lender' | 'property' | 'fund';
  entityId?: string;
  metric?: string;
}

/**
 * Fetch general analytics data
 * Supports various entity types and time ranges
 */
export const useAnalytics = (params?: AnalyticsParams) => {
  return useQuery({
    queryKey: ["analytics", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);
      if (params?.entityType) searchParams.set("entityType", params.entityType);
      if (params?.entityId) searchParams.set("entityId", params.entityId);
      if (params?.metric) searchParams.set("metric", params.metric);

      const url = `/api/v1/analytics${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      return data;
    },
    staleTime: 60000, // Analytics data can be cached for 1 minute
    refetchOnWindowFocus: false, // Don't refetch analytics on window focus
  });
};

/**
 * Fetch loan analytics
 */
export const useLoanAnalytics = (params?: {
  timeRange?: '7d' | '30d' | '90d' | '1y';
  loanId?: string;
}) => {
  return useQuery({
    queryKey: ["analytics", "loans", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);
      if (params?.loanId) searchParams.set("loanId", params.loanId);

      const url = `/api/v1/loans/analytics${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch loan analytics");
      }

      const data = await response.json();
      return data;
    },
    staleTime: 60000,
  });
};

/**
 * Fetch portfolio analytics
 */
export const usePortfolioAnalytics = (params?: {
  timeRange?: '7d' | '30d' | '90d' | '1y';
}) => {
  return useQuery({
    queryKey: ["analytics", "portfolio", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);

      const url = `/api/v1/portfolio/analytics${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch portfolio analytics");
      }

      const data = await response.json();
      return data;
    },
    staleTime: 60000,
  });
};

/**
 * Fetch financial metrics
 */
export const useFinancialMetrics = (params?: {
  timeRange?: '7d' | '30d' | '90d' | '1y';
}) => {
  return useQuery({
    queryKey: ["analytics", "financial", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);

      const url = `/api/v1/analytics/financial${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch financial metrics");
      }

      const data = await response.json();
      return data;
    },
    staleTime: 60000,
  });
};

/**
 * Fetch revenue metrics
 */
export const useRevenueMetrics = (params?: {
  timeRange?: '7d' | '30d' | '90d' | '1y';
  breakdown?: 'daily' | 'weekly' | 'monthly';
}) => {
  return useQuery({
    queryKey: ["analytics", "revenue", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);
      if (params?.breakdown) searchParams.set("breakdown", params.breakdown);

      const url = `/api/v1/analytics/revenue${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch revenue metrics");
      }

      const data = await response.json();
      return data;
    },
    staleTime: 60000,
  });
};

/**
 * Fetch risk metrics
 */
export const useRiskMetrics = (params?: {
  timeRange?: '7d' | '30d' | '90d' | '1y';
}) => {
  return useQuery({
    queryKey: ["analytics", "risk", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);

      const url = `/api/v1/analytics/risk${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch risk metrics");
      }

      const data = await response.json();
      return data;
    },
    staleTime: 60000,
  });
};

/**
 * Fetch delinquency analytics
 */
export const useDelinquencyAnalytics = (params?: {
  timeRange?: '7d' | '30d' | '90d' | '1y';
}) => {
  return useQuery({
    queryKey: ["analytics", "delinquency", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);

      const url = `/api/v1/analytics/delinquency${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch delinquency analytics");
      }

      const data = await response.json();
      return data;
    },
    staleTime: 60000,
  });
};

/**
 * Fetch performance trends
 */
export const usePerformanceTrends = (params?: {
  timeRange?: '7d' | '30d' | '90d' | '1y';
  metric?: string;
}) => {
  return useQuery({
    queryKey: ["analytics", "trends", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);
      if (params?.metric) searchParams.set("metric", params.metric);

      const url = `/api/v1/analytics/trends${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch performance trends");
      }

      const data = await response.json();
      return data;
    },
    staleTime: 60000,
  });
};

/**
 * Fetch comparative analytics (compare periods)
 */
export const useComparativeAnalytics = (params?: {
  metric?: string;
  currentPeriod?: string;
  comparisonPeriod?: string;
}) => {
  return useQuery({
    queryKey: ["analytics", "comparative", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.metric) searchParams.set("metric", params.metric);
      if (params?.currentPeriod) searchParams.set("currentPeriod", params.currentPeriod);
      if (params?.comparisonPeriod) searchParams.set("comparisonPeriod", params.comparisonPeriod);

      const url = `/api/v1/analytics/comparative${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch comparative analytics");
      }

      const data = await response.json();
      return data;
    },
    staleTime: 60000,
  });
};
