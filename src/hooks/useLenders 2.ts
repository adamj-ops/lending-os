"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Lender, CreateLenderDTO, UpdateLenderDTO } from "@/types/lender";

/**
 * Fetch all lenders for the authenticated user's organization
 */
export const useLenders = () => {
  return useQuery({
    queryKey: ["lenders"],
    queryFn: async () => {
      const response = await fetch("/api/v1/lenders");
      if (!response.ok) {
        throw new Error("Failed to fetch lenders");
      }
      const data = await response.json();
      return data.data as Lender[];
    },
  });
};

/**
 * Fetch a single lender by ID
 */
export const useLender = (id: string) => {
  return useQuery({
    queryKey: ["lenders", id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/lenders/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch lender");
      }
      const data = await response.json();
      return data.data as Lender;
    },
    enabled: !!id,
  });
};

/**
 * Create a new lender
 */
export const useCreateLender = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<CreateLenderDTO, "organizationId">) => {
      const response = await fetch("/api/v1/lenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create lender");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lenders"] });
      toast.success("Lender created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create lender");
    },
  });
};

/**
 * Update an existing lender
 */
export const useUpdateLender = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLenderDTO }) => {
      const response = await fetch(`/api/v1/lenders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update lender");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lenders"] });
      queryClient.invalidateQueries({ queryKey: ["lenders", variables.id] });
      toast.success("Lender updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update lender");
    },
  });
};

/**
 * Delete a lender
 */
export const useDeleteLender = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/lenders/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete lender");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lenders"] });
      toast.success("Lender deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete lender");
    },
  });
};

/**
 * Fetch loans associated with a lender
 */
export const useLenderLoans = (lenderId: string) => {
  return useQuery({
    queryKey: ["lenders", lenderId, "loans"],
    queryFn: async () => {
      const response = await fetch(`/api/v1/lenders/${lenderId}/loans`);
      if (!response.ok) {
        throw new Error("Failed to fetch lender loans");
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!lenderId,
  });
};

/**
 * Sync loans for a lender (replace all relationships)
 */
export const useSyncLenderLoans = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lenderId, loanIds }: { lenderId: string; loanIds: string[] }) => {
      const response = await fetch(`/api/v1/lenders/${lenderId}/loans`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sync lender loans");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lenders"] });
      queryClient.invalidateQueries({ queryKey: ["lenders", variables.lenderId, "loans"] });
      toast.success("Lender loans synced successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to sync lender loans");
    },
  });
};
