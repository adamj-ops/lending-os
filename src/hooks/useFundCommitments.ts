"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FundCommitment, FundCommitmentWithLender, CreateFundCommitmentDTO } from "@/types/fund";

/**
 * Fetch all commitments for a fund
 */
export const useFundCommitments = (fundId: string) => {
  return useQuery({
    queryKey: ["funds", fundId, "commitments"],
    queryFn: async () => {
      const response = await fetch(`/api/v1/funds/${fundId}/commitments`);
      if (!response.ok) {
        throw new Error("Failed to fetch fund commitments");
      }
      const data = await response.json();
      return data.commitments as FundCommitmentWithLender[];
    },
    enabled: !!fundId,
  });
};

/**
 * Add a new commitment to a fund
 */
export const useAddCommitment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFundCommitmentDTO) => {
      const response = await fetch(`/api/v1/funds/${data.fundId}/commitments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add commitment");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["funds", variables.fundId] });
      queryClient.invalidateQueries({ queryKey: ["funds", variables.fundId, "commitments"] });
      toast.success("Commitment added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add commitment");
    },
  });
};

/**
 * Cancel a commitment
 */
export const useCancelCommitment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, fundId, cancelledBy, reason }: { id: string; fundId: string; cancelledBy?: string; reason?: string }) => {
      const response = await fetch(`/api/v1/commitments/${id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelledBy, reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel commitment");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["funds", variables.fundId] });
      queryClient.invalidateQueries({ queryKey: ["funds", variables.fundId, "commitments"] });
      toast.success("Commitment cancelled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel commitment");
    },
  });
};

