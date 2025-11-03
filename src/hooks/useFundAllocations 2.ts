"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FundLoanAllocation, FundAllocationWithLoan, CreateFundAllocationDTO } from "@/types/fund";

/**
 * Fetch all loan allocations for a fund
 */
export const useFundAllocations = (fundId: string) => {
  return useQuery({
    queryKey: ["funds", fundId, "allocations"],
    queryFn: async () => {
      const response = await fetch(`/api/v1/funds/${fundId}/allocations`);
      if (!response.ok) {
        throw new Error("Failed to fetch fund allocations");
      }
      const data = await response.json();
      return data.allocations as FundAllocationWithLoan[];
    },
    enabled: !!fundId,
  });
};

/**
 * Allocate capital from fund to a loan
 */
export const useAllocateToLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFundAllocationDTO) => {
      const response = await fetch(`/api/v1/funds/${data.fundId}/allocations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to allocate to loan");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["funds", variables.fundId] });
      queryClient.invalidateQueries({ queryKey: ["funds", variables.fundId, "allocations"] });
      toast.success("Capital allocated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to allocate capital");
    },
  });
};

/**
 * Record capital return from a loan to fund
 */
export const useReturnFromLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ allocationId, fundId, amount, date }: { allocationId: string; fundId: string; amount: number; date: Date }) => {
      const response = await fetch(`/api/v1/allocations/${allocationId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, date }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to record capital return");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["funds", variables.fundId] });
      queryClient.invalidateQueries({ queryKey: ["funds", variables.fundId, "allocations"] });
      toast.success("Capital return recorded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record capital return");
    },
  });
};

