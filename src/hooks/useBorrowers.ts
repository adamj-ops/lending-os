"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Borrower, CreateBorrowerDTO, UpdateBorrowerDTO } from "@/types/borrower";

/**
 * Fetch all borrowers for the authenticated user's organization
 */
export const useBorrowers = () => {
  return useQuery({
    queryKey: ["borrowers"],
    queryFn: async () => {
      const response = await fetch("/api/v1/borrowers");
      if (!response.ok) {
        throw new Error("Failed to fetch borrowers");
      }
      const data = await response.json();
      return data.data as Borrower[];
    },
  });
};

/**
 * Fetch a single borrower by ID
 */
export const useBorrower = (id: string) => {
  return useQuery({
    queryKey: ["borrowers", id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/borrowers/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch borrower");
      }
      const data = await response.json();
      return data.data as Borrower;
    },
    enabled: !!id,
  });
};

/**
 * Create a new borrower
 */
export const useCreateBorrower = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<CreateBorrowerDTO, "organizationId">) => {
      const response = await fetch("/api/v1/borrowers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create borrower");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowers"] });
      toast.success("Borrower created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create borrower");
    },
  });
};

/**
 * Update an existing borrower
 */
export const useUpdateBorrower = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBorrowerDTO }) => {
      const response = await fetch(`/api/v1/borrowers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update borrower");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["borrowers"] });
      queryClient.invalidateQueries({ queryKey: ["borrowers", variables.id] });
      toast.success("Borrower updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update borrower");
    },
  });
};

/**
 * Delete a borrower
 */
export const useDeleteBorrower = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/borrowers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete borrower");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowers"] });
      toast.success("Borrower deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete borrower");
    },
  });
};

/**
 * Fetch loans associated with a borrower
 */
export const useBorrowerLoans = (borrowerId: string) => {
  return useQuery({
    queryKey: ["borrowers", borrowerId, "loans"],
    queryFn: async () => {
      const response = await fetch(`/api/v1/borrowers/${borrowerId}/loans`);
      if (!response.ok) {
        throw new Error("Failed to fetch borrower loans");
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!borrowerId,
  });
};

/**
 * Sync loans for a borrower (replace all relationships)
 */
export const useSyncBorrowerLoans = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ borrowerId, loanIds }: { borrowerId: string; loanIds: string[] }) => {
      const response = await fetch(`/api/v1/borrowers/${borrowerId}/loans`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sync borrower loans");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["borrowers"] });
      queryClient.invalidateQueries({ queryKey: ["borrowers", variables.borrowerId, "loans"] });
      toast.success("Borrower loans synced successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to sync borrower loans");
    },
  });
};
