"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import type { PortalType } from "@/db/schema/portal-roles";

interface PortalAccessData {
  portalType: PortalType;
  role: string;
}

interface PortalAccess {
  portalType: PortalType | null;
  canEdit: boolean;
  role: string | null;
}

/**
 * Hook to determine the current portal type and access permissions
 * 
 * Determines portal type from route pathname:
 * - Routes starting with /dashboard/funds → checks if user has investor access
 * - Routes starting with /(ops)/ → ops portal
 * - Routes starting with /(investor)/ → investor portal
 * - Routes starting with /(borrower)/ → borrower portal
 * 
 * @returns PortalAccess object with portalType, canEdit flag, and role
 */
export function usePortalAccess(): PortalAccess {
  const { user: clerkUser } = useUser();
  const pathname = usePathname();

  // Fetch portal access from API
  const { data: portalData } = useQuery<{ portals: PortalAccessData[] }>({
    queryKey: ["portal-access", clerkUser?.id],
    queryFn: async () => {
      const response = await fetch("/api/auth/portal-access");
      if (!response.ok) {
        throw new Error("Failed to fetch portal access");
      }
      return response.json();
    },
    enabled: !!clerkUser?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Determine portal type from pathname
  let portalType: PortalType | null = null;
  
  if (pathname) {
    // Check route groups
    if (pathname.includes("/(ops)/")) {
      portalType = "ops";
    } else if (pathname.includes("/(investor)/")) {
      portalType = "investor";
    } else if (pathname.includes("/(borrower)/")) {
      portalType = "borrower";
    } else if (pathname.startsWith("/dashboard/funds")) {
      // For fund routes, check if user has investor access
      // Default to ops if no investor access, but prefer investor if available
      const hasInvestorAccess = portalData?.portals?.some(
        (p) => p.portalType === "investor"
      );
      portalType = hasInvestorAccess ? "investor" : "ops";
    } else {
      // Default to ops for other routes
      portalType = "ops";
    }
  }

  // Find the role for the determined portal type
  const portalAccess = portalData?.portals?.find(
    (p) => p.portalType === portalType
  );

  const canEdit = portalType === "ops";
  const role = portalAccess?.role || null;

  return {
    portalType,
    canEdit,
    role,
  };
}

