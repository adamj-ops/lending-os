"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Draw {
  id: string;
  loanId: string;
  amount: number;
  requestedDate: string;
  status: string;
  // Add other draw fields as needed
}

interface DrawMetrics {
  totalDraws: number;
  totalAmount: number;
  approvedDraws: number;
  pendingDraws: number;
  rejectedDraws: number;
  avgDrawAmount: number;
}

/**
 * Fetch all draws for the authenticated user's organization
 * Optionally filter by loanId and time range
 */
export const useDraws = (params?: {
  loanId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  status?: string;
}) => {
  return useQuery({
    queryKey: ["draws", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.loanId) searchParams.set("loanId", params.loanId);
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);
      if (params?.status) searchParams.set("status", params.status);

      const url = `/api/v1/draws${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch draws");
      }

      const data = await response.json();
      return data.draws as Draw[];
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetch a single draw by ID
 */
export const useDraw = (id: string) => {
  return useQuery({
    queryKey: ["draws", id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/draws/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch draw");
      }
      const data = await response.json();
      return data as Draw;
    },
    enabled: !!id,
    staleTime: 30000,
  });
};

/**
 * Fetch draw metrics
 */
export const useDrawMetrics = (params?: {
  loanId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}) => {
  return useQuery({
    queryKey: ["draws", "metrics", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.loanId) searchParams.set("loanId", params.loanId);
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);

      const url = `/api/v1/draws/analytics${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch draw metrics");
      }

      const data = await response.json();
      return data as DrawMetrics;
    },
    staleTime: 60000, // Metrics can be cached longer
  });
};

/**
 * Fetch draw schedule for a loan
 */
export const useDrawSchedule = (loanId: string) => {
  return useQuery({
    queryKey: ["draws", "schedule", loanId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/loans/${loanId}/draws`);
      if (!response.ok) {
        throw new Error("Failed to fetch draw schedule");
      }
      const data = await response.json();
      return data;
    },
    enabled: !!loanId,
    staleTime: 60000,
  });
};

/**
 * Request a new draw
 */
export const useRequestDraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Draw>) => {
      const response = await fetch("/api/v1/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to request draw");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["draws"] });
      queryClient.invalidateQueries({ queryKey: ["draws", "metrics"] });
      queryClient.invalidateQueries({ queryKey: ["loans"] }); // Loan status may change
      toast.success("Draw requested successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to request draw");
    },
  });
};

/**
 * Update an existing draw
 */
export const useUpdateDraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Draw> }) => {
      const response = await fetch(`/api/v1/draws/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update draw");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draws"] });
      queryClient.invalidateQueries({ queryKey: ["draws", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["draws", "metrics"] });
      toast.success("Draw updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update draw");
    },
  });
};

/**
 * Approve a draw
 */
export const useApproveDraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await fetch(`/api/v1/draws/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve draw");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draws"] });
      queryClient.invalidateQueries({ queryKey: ["draws", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["draws", "metrics"] });
      toast.success("Draw approved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve draw");
    },
  });
};

/**
 * Reject a draw
 */
export const useRejectDraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(`/api/v1/draws/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject draw");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draws"] });
      queryClient.invalidateQueries({ queryKey: ["draws", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["draws", "metrics"] });
      toast.success("Draw rejected");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject draw");
    },
  });
};

/**
 * Disburse an approved draw
 */
export const useDisburseDraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, disbursementDate }: { id: string; disbursementDate?: string }) => {
      const response = await fetch(`/api/v1/draws/${id}/disburse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disbursementDate: disbursementDate || new Date().toISOString() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to disburse draw");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draws"] });
      queryClient.invalidateQueries({ queryKey: ["draws", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["draws", "metrics"] });
      queryClient.invalidateQueries({ queryKey: ["loans"] }); // Loan balance may change
      toast.success("Draw disbursed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to disburse draw");
    },
  });
};
