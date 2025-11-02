"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Inspection } from "@/types/inspection";

/**
 * Fetch all inspections for the authenticated user's organization
 * Optionally filter by loanId and time range
 */
export const useInspections = (params?: {
  loanId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  status?: string;
}) => {
  return useQuery({
    queryKey: ["inspections", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.loanId) searchParams.set("loanId", params.loanId);
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);
      if (params?.status) searchParams.set("status", params.status);

      const url = `/api/v1/inspections${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch inspections");
      }

      const data = await response.json();
      return data as Inspection[];
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetch a single inspection by ID
 */
export const useInspection = (id: string) => {
  return useQuery({
    queryKey: ["inspections", id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/inspections/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch inspection");
      }
      const data = await response.json();
      return data as Inspection;
    },
    enabled: !!id,
    staleTime: 30000,
  });
};

/**
 * Fetch inspection metrics
 */
export const useInspectionMetrics = (params?: {
  loanId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}) => {
  return useQuery({
    queryKey: ["inspections", "metrics", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.loanId) searchParams.set("loanId", params.loanId);
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);

      const url = `/api/v1/inspections/analytics${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch inspection metrics");
      }

      const data = await response.json();
      return data;
    },
    staleTime: 60000, // Metrics can be cached longer
  });
};

/**
 * Fetch inspector workload data
 */
export const useInspectorWorkload = (params?: {
  timeRange?: '7d' | '30d' | '90d' | '1y';
}) => {
  return useQuery({
    queryKey: ["inspections", "workload", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);

      const url = `/api/v1/inspections/workload${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch inspector workload");
      }

      const data = await response.json();
      return data;
    },
    staleTime: 60000,
  });
};

/**
 * Schedule a new inspection
 */
export const useScheduleInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Inspection>) => {
      const response = await fetch("/api/v1/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to schedule inspection");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast.success("Inspection scheduled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to schedule inspection");
    },
  });
};

/**
 * Update an existing inspection
 */
export const useUpdateInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Inspection> }) => {
      const response = await fetch(`/api/v1/inspections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update inspection");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      queryClient.invalidateQueries({ queryKey: ["inspections", variables.id] });
      toast.success("Inspection updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update inspection");
    },
  });
};

/**
 * Complete an inspection
 */
export const useCompleteInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/inspections/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 'completed',
          completedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete inspection");
      }

      return response.json();
    },
    onSuccess: (_, inspectionId) => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      queryClient.invalidateQueries({ queryKey: ["inspections", inspectionId] });
      queryClient.invalidateQueries({ queryKey: ["inspections", "metrics"] });
      toast.success("Inspection marked as completed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete inspection");
    },
  });
};

/**
 * Cancel an inspection
 */
export const useCancelInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await fetch(`/api/v1/inspections/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel inspection");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      queryClient.invalidateQueries({ queryKey: ["inspections", variables.id] });
      toast.success("Inspection cancelled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel inspection");
    },
  });
};
