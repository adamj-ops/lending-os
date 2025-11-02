"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Alert } from "@/db/schema/alerts";

/**
 * Fetch alerts with optional filtering and automatic polling
 * This hook supports real-time updates via polling
 */
export const useAlerts = (params?: {
  status?: 'read' | 'unread' | 'all';
  severity?: 'info' | 'warning' | 'critical';
  entityType?: string;
  entityId?: string;
  limit?: number;
  refetchInterval?: number; // Polling interval in milliseconds (default: 30000)
}) => {
  const { refetchInterval = 30000, ...queryParams } = params || {};

  return useQuery({
    queryKey: ["alerts", queryParams],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (queryParams.status) searchParams.set("status", queryParams.status);
      if (queryParams.severity) searchParams.set("severity", queryParams.severity);
      if (queryParams.entityType) searchParams.set("entityType", queryParams.entityType);
      if (queryParams.entityId) searchParams.set("entityId", queryParams.entityId);
      if (queryParams.limit) searchParams.set("limit", queryParams.limit.toString());

      const url = `/api/v1/alerts${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();
      return data.alerts as Alert[];
    },
    staleTime: 15000, // Consider data fresh for 15 seconds
    refetchInterval, // Enable polling
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetch a single alert by ID
 */
export const useAlert = (id: string) => {
  return useQuery({
    queryKey: ["alerts", id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/alerts/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch alert");
      }
      const data = await response.json();
      return data as Alert;
    },
    enabled: !!id,
    staleTime: 30000,
  });
};

/**
 * Fetch unread alert count
 * Useful for badge displays
 */
export const useUnreadAlertCount = (refetchInterval = 30000) => {
  return useQuery({
    queryKey: ["alerts", "unread-count"],
    queryFn: async () => {
      const response = await fetch('/api/v1/alerts?status=unread&limit=100');
      if (!response.ok) {
        throw new Error("Failed to fetch unread alerts");
      }
      const data = await response.json();
      return (data.alerts as Alert[]).length;
    },
    staleTime: 15000,
    refetchInterval,
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetch alert metrics/analytics
 */
export const useAlertMetrics = (params?: {
  timeRange?: '7d' | '30d' | '90d' | '1y';
}) => {
  return useQuery({
    queryKey: ["alerts", "metrics", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);

      const url = `/api/v1/alerts/analytics${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch alert metrics");
      }

      const data = await response.json();
      return data;
    },
    staleTime: 60000, // Metrics can be cached longer
  });
};

/**
 * Mark an alert as read
 */
export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/v1/alerts/${alertId}/read`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mark alert as read");
      }

      return response.json();
    },
    onMutate: async (alertId) => {
      // Optimistic update: immediately remove from unread list
      await queryClient.cancelQueries({ queryKey: ["alerts"] });

      const previousAlerts = queryClient.getQueryData(["alerts"]);

      queryClient.setQueriesData(
        { queryKey: ["alerts"] },
        (old: any) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return old.filter((alert: Alert) => alert.id !== alertId);
          }
          return old;
        }
      );

      return { previousAlerts };
    },
    onError: (err, alertId, context) => {
      // Rollback on error
      if (context?.previousAlerts) {
        queryClient.setQueryData(["alerts"], context.previousAlerts);
      }
      toast.error("Failed to mark alert as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts", "unread-count"] });
    },
  });
};

/**
 * Mark multiple alerts as read
 */
export const useMarkAlertsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertIds: string[]) => {
      const response = await fetch('/api/v1/alerts/bulk-read', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mark alerts as read");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts", "unread-count"] });
      toast.success("Alerts marked as read");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark alerts as read");
    },
  });
};

/**
 * Mark all alerts as read
 */
export const useMarkAllAlertsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/v1/alerts/mark-all-read', {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mark all alerts as read");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts", "unread-count"] });
      toast.success("All alerts marked as read");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark all alerts as read");
    },
  });
};

/**
 * Dismiss/delete an alert
 */
export const useDismissAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/v1/alerts/${alertId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to dismiss alert");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts", "unread-count"] });
      toast.success("Alert dismissed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to dismiss alert");
    },
  });
};

/**
 * Create a custom alert (for manual/system alerts)
 */
export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Alert>) => {
      const response = await fetch('/api/v1/alerts', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create alert");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts", "unread-count"] });
      toast.success("Alert created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create alert");
    },
  });
};
