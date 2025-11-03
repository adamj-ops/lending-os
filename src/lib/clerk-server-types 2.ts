import type { PortalType } from "@/db/schema/portal-roles";

/**
 * Session data returned by Clerk auth helpers.
 * Maintains compatibility with existing Better Auth SessionData interface.
 */
export interface ClerkSessionData {
  /** Clerk user ID */
  userId: string;
  
  /** User email address */
  email: string;
  
  /** User full name */
  name: string;
  
  /** Active organization ID (null if user not in any organization) */
  organizationId: string | null;
  
  /** Active organization details */
  activeOrganization?: {
    id: string;
    name: string;
    role: string; // Role from user_portal_access table
  };
  
  /** Portal access for this user */
  portalAccess?: Array<{
    portalType: PortalType;
    organizationId: string;
    role: string;
  }>;
}

/**
 * Result type for requireAuth() - SessionData guaranteed to exist
 */
export type RequireAuthResult = ClerkSessionData;

/**
 * Result type for requireOrganization() - organizationId guaranteed to be string
 */
export type RequireOrganizationResult = ClerkSessionData & { organizationId: string };

/**
 * Result type for requirePortalAccess() - SessionData with portal access verified
 */
export type RequirePortalAccessResult = ClerkSessionData;

