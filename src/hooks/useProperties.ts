"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Property {
  id: string;
  address: string;
  type: string;
  value: number;
  status: string;
  // Add other property fields as needed
}

interface PropertyMetrics {
  totalProperties: number;
  totalValue: number;
  avgPropertyValue: number;
  activeProperties: number;
  pendingProperties: number;
}

/**
 * Fetch all properties for the authenticated user's organization
 * Optionally filter by various parameters
 */
export const useProperties = (params?: {
  loanId?: string;
  status?: string;
  type?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["properties", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.loanId) searchParams.set("loanId", params.loanId);
      if (params?.status) searchParams.set("status", params.status);
      if (params?.type) searchParams.set("type", params.type);
      if (params?.search) searchParams.set("search", params.search);

      const url = `/api/v1/properties${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();
      return (data.data || data.properties || []) as Property[];
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetch a single property by ID
 */
export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ["properties", id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/properties/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch property");
      }
      const data = await response.json();
      return data as Property;
    },
    enabled: !!id,
    staleTime: 30000,
  });
};

/**
 * Fetch property metrics
 */
export const usePropertyMetrics = (params?: {
  timeRange?: '7d' | '30d' | '90d' | '1y';
}) => {
  return useQuery({
    queryKey: ["properties", "metrics", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.timeRange) searchParams.set("timeRange", params.timeRange);

      const url = `/api/v1/properties/analytics${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch property metrics");
      }

      const data = await response.json();
      return data as PropertyMetrics;
    },
    staleTime: 60000, // Metrics can be cached longer
  });
};

/**
 * Fetch properties associated with a specific loan
 */
export const useLoanProperties = (loanId: string) => {
  return useQuery({
    queryKey: ["properties", "loan", loanId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/loans/${loanId}/properties`);
      if (!response.ok) {
        throw new Error("Failed to fetch loan properties");
      }
      const data = await response.json();
      return (data.data || data.properties || []) as Property[];
    },
    enabled: !!loanId,
    staleTime: 30000,
  });
};

/**
 * Create a new property
 */
export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Property>) => {
      const response = await fetch("/api/v1/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create property");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties", "metrics"] });
      toast.success("Property created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create property");
    },
  });
};

/**
 * Update an existing property
 */
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Property> }) => {
      const response = await fetch(`/api/v1/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update property");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["properties", "metrics"] });
      toast.success("Property updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update property");
    },
  });
};

/**
 * Delete a property
 */
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/properties/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete property");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties", "metrics"] });
      toast.success("Property deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete property");
    },
  });
};

/**
 * Associate a property with a loan
 */
export const useAssociatePropertyWithLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ propertyId, loanId }: { propertyId: string; loanId: string }) => {
      const response = await fetch(`/api/v1/properties/${propertyId}/associate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to associate property with loan");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties", variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ["properties", "loan", variables.loanId] });
      queryClient.invalidateQueries({ queryKey: ["loans", variables.loanId] });
      toast.success("Property associated with loan successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to associate property with loan");
    },
  });
};

/**
 * Update property valuation
 */
export const useUpdatePropertyValuation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, value, valuationDate }: { id: string; value: number; valuationDate?: string }) => {
      const response = await fetch(`/api/v1/properties/${id}/valuation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, valuationDate: valuationDate || new Date().toISOString() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update property valuation");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["properties", "metrics"] });
      toast.success("Property valuation updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update property valuation");
    },
  });
};
