"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FundCall, CreateFundCallDTO } from "@/types/fund";

/**
 * Fetch all capital calls for a fund
 */
export const useFundCalls = (fundId: string) => {
  return useQuery({
    queryKey: ["funds", fundId, "calls"],
    queryFn: async () => {
      const response = await fetch(`/api/v1/funds/${fundId}/calls`);
      if (!response.ok) {
        throw new Error("Failed to fetch fund calls");
      }
      const data = await response.json();
      return data.calls as FundCall[];
    },
    enabled: !!fundId,
  });
};

/**
 * Create a new capital call
 */
export const useCreateCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFundCallDTO) => {
      const response = await fetch(`/api/v1/funds/${data.fundId}/calls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create capital call");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["funds", variables.fundId] });
      queryClient.invalidateQueries({ queryKey: ["funds", variables.fundId, "calls"] });
      toast.success("Capital call created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create capital call");
    },
  });
};

