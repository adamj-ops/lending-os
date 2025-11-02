"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FundDistribution, CreateFundDistributionDTO } from "@/types/fund";

/**
 * Fetch all distributions for a fund
 */
export const useFundDistributions = (fundId: string) => {
  return useQuery({
    queryKey: ["funds", fundId, "distributions"],
    queryFn: async () => {
      const response = await fetch(`/api/v1/funds/${fundId}/distributions`);
      if (!response.ok) {
        throw new Error("Failed to fetch fund distributions");
      }
      const data = await response.json();
      return data.distributions as FundDistribution[];
    },
    enabled: !!fundId,
  });
};

/**
 * Record a new distribution
 */
export const useRecordDistribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFundDistributionDTO) => {
      const response = await fetch(`/api/v1/funds/${data.fundId}/distributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to record distribution");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["funds", variables.fundId] });
      queryClient.invalidateQueries({ queryKey: ["funds", variables.fundId, "distributions"] });
      toast.success("Distribution recorded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record distribution");
    },
  });
};

