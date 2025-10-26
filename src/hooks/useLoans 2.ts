"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Fetch all loans for the authenticated user's organization
 */
export const useLoans = () => {
  return useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const response = await fetch("/api/v1/loans");
      if (!response.ok) {
        throw new Error("Failed to fetch loans");
      }
      const data = await response.json();
      return data.data;
    },
  });
};
