/**
 * Template for creating new custom hooks with React Query
 *
 * Instructions:
 * 1. Copy this template to src/hooks/use[YourEntity].ts
 * 2. Replace [YourEntity] with your entity name (e.g., Projects, Tasks)
 * 3. Replace [yourEntity] with lowercase version
 * 4. Replace [YourType] with your TypeScript type
 * 5. Update API endpoints
 * 6. Remove unused hooks
 * 7. Add entity-specific hooks as needed
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// TODO: Import or define your type
interface [YourType] {
  id: string;
  // Add your fields here
}

/**
 * Fetch all [yourEntity] for the authenticated user's organization
 * Optionally filter by parameters
 */
export const use[YourEntity] = (params?: {
  // Add your filter parameters
  search?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["[yourEntity]", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set("search", params.search);
      if (params?.status) searchParams.set("status", params.status);

      const url = `/api/v1/[yourEntity]${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch [yourEntity]");
      }

      const data = await response.json();
      return data.[yourEntity] as [YourType][];
    },
    staleTime: 30000, // 30 seconds for regular data
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetch a single [yourEntity] by ID
 */
export const use[YourEntity]ById = (id: string) => {
  return useQuery({
    queryKey: ["[yourEntity]", id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/[yourEntity]/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch [yourEntity]");
      }
      const data = await response.json();
      return data as [YourType];
    },
    enabled: !!id,
    staleTime: 30000,
  });
};

/**
 * Create a new [yourEntity]
 */
export const useCreate[YourEntity] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<[YourType]>) => {
      const response = await fetch("/api/v1/[yourEntity]", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create [yourEntity]");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["[yourEntity]"] });
      toast.success("[YourEntity] created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create [yourEntity]");
    },
  });
};

/**
 * Update an existing [yourEntity]
 */
export const useUpdate[YourEntity] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<[YourType]> }) => {
      const response = await fetch(`/api/v1/[yourEntity]/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update [yourEntity]");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["[yourEntity]"] });
      queryClient.invalidateQueries({ queryKey: ["[yourEntity]", variables.id] });
      toast.success("[YourEntity] updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update [yourEntity]");
    },
  });
};

/**
 * Delete a [yourEntity]
 */
export const useDelete[YourEntity] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/[yourEntity]/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete [yourEntity]");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["[yourEntity]"] });
      toast.success("[YourEntity] deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete [yourEntity]");
    },
  });
};
