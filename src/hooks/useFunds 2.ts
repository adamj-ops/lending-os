"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Fund, FundWithMetrics, CreateFundDTO, UpdateFundDTO } from "@/types/fund";

/**
 * Fetch all funds for the authenticated user's organization
 */
export const useFunds = () => {
  return useQuery({
    queryKey: ["funds"],
    queryFn: async () => {
      const response = await fetch("/api/v1/funds");
      if (!response.ok) {
        throw new Error("Failed to fetch funds");
      }
      const data = await response.json();
      return data.funds as Fund[];
    },
  });
};

/**
 * Fetch a single fund by ID with metrics
 */
export const useFund = (id: string) => {
  return useQuery({
    queryKey: ["funds", id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/funds/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch fund");
      }
      const data = await response.json();
      return data as FundWithMetrics;
    },
    enabled: !!id,
  });
};

/**
 * Create a new fund
 */
export const useCreateFund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<CreateFundDTO, "organizationId">) => {
      const response = await fetch("/api/v1/funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create fund");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      toast.success("Fund created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create fund");
    },
  });
};

/**
 * Update an existing fund
 */
export const useUpdateFund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFundDTO }) => {
      const response = await fetch(`/api/v1/funds/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update fund");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["funds", variables.id] });
      toast.success("Fund updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update fund");
    },
  });
};

/**
 * Close a fund (no longer accepting commitments)
 */
export const useCloseFund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, closedBy }: { id: string; closedBy?: string }) => {
      const response = await fetch(`/api/v1/funds/${id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closedBy }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to close fund");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["funds", variables.id] });
      toast.success("Fund closed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to close fund");
    },
  });
};

