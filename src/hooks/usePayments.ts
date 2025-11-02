"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Payment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  status: string;
  type: string;
  // Add other payment fields as needed
}

interface PaymentMetrics {
  totalPayments: number;
  totalAmount: number;
  onTimePayments: number;
  latePayments: number;
  missedPayments: number;
  avgPaymentAmount: number;
}

/**
 * Fetch all payments for the authenticated user's organization
 * Optionally filter by loanId and time range
 */
export const usePayments = (params?: {
  loanId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  status?: string;
}) => {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.loanId) searchParams.set("loanId", params.loanId);
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);
      if (params?.status) searchParams.set("status", params.status);

      const url = `/api/v1/payments${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const data = await response.json();
      return data.payments as Payment[];
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetch a single payment by ID
 */
export const usePayment = (id: string) => {
  return useQuery({
    queryKey: ["payments", id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/payments/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch payment");
      }
      const data = await response.json();
      return data as Payment;
    },
    enabled: !!id,
    staleTime: 30000,
  });
};

/**
 * Fetch payment metrics
 */
export const usePaymentMetrics = (params?: {
  loanId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}) => {
  return useQuery({
    queryKey: ["payments", "metrics", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.loanId) searchParams.set("loanId", params.loanId);
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);

      const url = `/api/v1/payments/analytics${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch payment metrics");
      }

      const data = await response.json();
      return data as PaymentMetrics;
    },
    staleTime: 60000, // Metrics can be cached longer
  });
};

/**
 * Fetch payment schedule for a loan
 */
export const usePaymentSchedule = (loanId: string) => {
  return useQuery({
    queryKey: ["payments", "schedule", loanId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/loans/${loanId}/payment-schedule`);
      if (!response.ok) {
        throw new Error("Failed to fetch payment schedule");
      }
      const data = await response.json();
      return data;
    },
    enabled: !!loanId,
    staleTime: 60000,
  });
};

/**
 * Fetch payment summary for a loan
 */
export const usePaymentSummary = (loanId: string) => {
  return useQuery({
    queryKey: ["payments", "summary", loanId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/loans/${loanId}/payments/summary`);
      if (!response.ok) {
        throw new Error("Failed to fetch payment summary");
      }
      const data = await response.json();
      return data;
    },
    enabled: !!loanId,
    staleTime: 30000,
  });
};

/**
 * Fetch payments for a specific loan
 */
export const useLoanPayments = (loanId: string) => {
  return useQuery({
    queryKey: ["payments", "loan", loanId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/loans/${loanId}/payments`);
      if (!response.ok) {
        throw new Error("Failed to fetch loan payments");
      }
      const data = await response.json();
      return (data.payments || data.data || []) as Payment[];
    },
    enabled: !!loanId,
    staleTime: 30000,
  });
};

/**
 * Record a new payment
 */
export const useRecordPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Payment>) => {
      const response = await fetch("/api/v1/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to record payment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "metrics"] });
      queryClient.invalidateQueries({ queryKey: ["loans"] }); // Loan status may change
      toast.success("Payment recorded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record payment");
    },
  });
};

/**
 * Update an existing payment
 */
export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Payment> }) => {
      const response = await fetch(`/api/v1/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update payment");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["payments", "metrics"] });
      toast.success("Payment updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update payment");
    },
  });
};

/**
 * Delete a payment
 */
export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/payments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete payment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "metrics"] });
      toast.success("Payment deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete payment");
    },
  });
};

/**
 * Void a payment (mark as cancelled but keep record)
 */
export const useVoidPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await fetch(`/api/v1/payments/${id}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to void payment");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["payments", "metrics"] });
      toast.success("Payment voided successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to void payment");
    },
  });
};
