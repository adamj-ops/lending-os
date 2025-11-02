import { auth, currentUser } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { userPortalAccess, organizations, appUsers } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { PortalType } from "@/db/schema/portal-roles";
import { portalAccessCache } from "./portal-access-cache";
import type {
  ClerkSessionData,
  RequireAuthResult,
  RequireOrganizationResult,
  RequirePortalAccessResult,
} from "./clerk-server-types";

/**
 * Ensure user exists in app_users table with retry logic
 * Defensive function to handle race conditions between Clerk and database
 */
async function ensureUserInDatabase(
  userId: string,
  options: { maxRetries?: number } = {}
): Promise<void> {
  const maxRetries = options.maxRetries || 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check if user exists
      const existing = await db.query.appUsers.findFirst({
        where: eq(appUsers.id, userId),
      });

      if (existing) {
        return; // User exists, we're done
      }

      // Fetch from Clerk
      const clerkUser = await serverClerk.users.getUser(userId);

      // Upsert into app_users
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';
      const firstName = clerkUser.firstName || '';
      const lastName = clerkUser.lastName || '';
      const name = [firstName, lastName].filter(Boolean).join(' ') || 
                    clerkUser.username || 
                    'Unknown';

      await db.insert(appUsers).values({
        id: clerkUser.id,
        email,
        name,
        firstName: firstName || null,
        lastName: lastName || null,
        imageUrl: clerkUser.imageUrl || null,
        isActive: !clerkUser.banned && !clerkUser.locked,
      }).onConflictDoNothing();

      console.log(`✅ Ensured user ${userId} exists in database`);
      return;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error(`Failed to ensure user ${userId} after ${maxRetries} attempts:`, error);
        throw error;
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
    }
  }
}

/**
 * Get organization context for a user.
 * Determines active organization by querying user_portal_access table.
 * Returns the first organization found, or null if user has no portal access.
 */
async function getOrganizationContext(
  userId: string
): Promise<{ organizationId: string | null; activeOrganization?: ClerkSessionData["activeOrganization"] }> {
  // Query portal access to find user's organizations
  const access = await db.query.userPortalAccess.findMany({
    where: and(
      eq(userPortalAccess.userId, userId),
      eq(userPortalAccess.isActive, true)
    ),
  });

  if (access.length === 0) {
    return { organizationId: null };
  }

  // Use the first organization found (TODO: implement org switcher for multi-org)
  const firstOrgId = access[0].organizationId;

  // Get organization details
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, firstOrgId),
  });

  // Get role for this organization (from portal access)
  const orgAccess = access.find((a) => a.organizationId === firstOrgId);
  const role = orgAccess?.role || "member";

  return {
    organizationId: firstOrgId,
    activeOrganization: org
      ? {
          id: org.id,
          name: org.name,
          role,
        }
      : undefined,
  };
}

/**
 * Get current session with organization context from userId.
 * Use this in middleware where auth() has already been called.
 * Returns null if not authenticated.
 * 
 * Note: In middleware, we have limited access to user data.
 * Full user details (email, name) should be fetched in getSession().
 */
export async function getSessionFromUserId(
  userId: string | null | undefined
): Promise<ClerkSessionData | null> {
  try {
    if (!userId) {
      return null;
    }

    // In middleware, we can't easily get full user object
    // Return minimal session - organization context will be resolved
    // Full user details will come from getSession() in API routes/components
    const orgContext = await getOrganizationContext(userId);

    return {
      userId,
      email: "", // Not available in middleware - will be fetched in getSession()
      name: "", // Not available in middleware - will be fetched in getSession()
      organizationId: orgContext.organizationId,
      activeOrganization: orgContext.activeOrganization,
    };
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}

/**
 * @deprecated Use getSessionFromUserId instead. This function is kept for backward compatibility.
 * Get current session with organization context from request headers.
 * Use this in middleware where NextRequest headers are available.
 * Returns null if not authenticated.
 * 
 * Note: In middleware, we have limited access to user data.
 * Full user details (email, name) should be fetched in getSession().
 */
export async function getSessionFromHeaders(
  requestHeaders: Headers
): Promise<ClerkSessionData | null> {
  try {
    // Get Clerk auth - in middleware, this works with request headers
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    // Delegate to the userId-based function
    return getSessionFromUserId(userId);
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}

/**
 * Get current session with organization context.
 * Returns null if not authenticated.
 * 
 * This is the main function for server components and API routes.
 */
export async function getSession(): Promise<ClerkSessionData | null> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    // Defensive: ensure user exists in database before querying FKs
    await ensureUserInDatabase(userId);

    // Get full user details from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    // Extract user information from Clerk user object
    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const name = clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser.firstName || clerkUser.lastName || clerkUser.username || "";

    // Get organization context
    const orgContext = await getOrganizationContext(userId);

    // Get portal access for the organization
    const portalAccess = orgContext.organizationId
      ? await getUserPortalAccess(userId, orgContext.organizationId)
      : [];

    return {
      userId,
      email,
      name,
      organizationId: orgContext.organizationId,
      activeOrganization: orgContext.activeOrganization,
      portalAccess: portalAccess.map((pa) => ({
        portalType: pa.portalType,
        organizationId: orgContext.organizationId!,
        role: pa.role,
      })),
    };
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}

/**
 * Require authenticated session or redirect to login.
 * Use this in API routes and server components.
 */
export async function requireAuth(): Promise<RequireAuthResult> {
  const session = await getSession();

  if (!session) {
    redirect("/auth/v2/login");
  }

  return session;
}

/**
 * Require organization context.
 * Throws error if user not in any organization.
 *
 * @throws {Error} If user not assigned to any organization
 */
export async function requireOrganization(): Promise<RequireOrganizationResult> {
  const session = await requireAuth();

  if (!session.organizationId) {
    throw new Error("User not assigned to any organization. Please contact your administrator.");
  }

  return session as RequireOrganizationResult;
}

/**
 * Require specific portal access.
 * Checks user_portal_access table for permission.
 *
 * @param portalType - Which portal to check access for (ops, investor, borrower)
 * @param minRole - Optional minimum role required (e.g., "admin", "manager")
 * @throws {Error} If user doesn't have access to specified portal
 */
export async function requirePortalAccess(
  portalType: PortalType,
  minRole?: string
): Promise<RequirePortalAccessResult> {
  const session = await requireOrganization();

  // Query portal access from DB
  const access = await db.query.userPortalAccess.findFirst({
    where: and(
      eq(userPortalAccess.userId, session.userId),
      eq(userPortalAccess.organizationId, session.organizationId),
      eq(userPortalAccess.portalType, portalType),
      eq(userPortalAccess.isActive, true)
    ),
  });

  if (!access) {
    throw new Error(`No ${portalType} portal access for this user`);
  }

  // Optional: Check minimum role level
  if (minRole && !hasMinimumRole(access.role, minRole)) {
    throw new Error(`Insufficient permissions: ${minRole} role required`);
  }

  return session;
}

/**
 * Helper to check if a role meets minimum requirement.
 * Role hierarchy: admin > manager > analyst > member/viewer
 */
function hasMinimumRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    admin: 4,
    manager: 3,
    analyst: 2,
    member: 1,
    viewer: 1,
  };

  const userLevel = roleHierarchy[userRole.toLowerCase()] || 0;
  const requiredLevel = roleHierarchy[requiredRole.toLowerCase()] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Get user's portal access for organization.
 * Returns empty array if no portal access found.
 * Uses caching to optimize performance (5-minute TTL).
 */
export async function getUserPortalAccess(
  userId: string,
  organizationId: string
): Promise<Array<{ portalType: PortalType; role: string }>> {
  // Check cache first
  const cached = portalAccessCache.get(userId, organizationId);
  if (cached !== null) {
    return cached;
  }

  // Query database if not cached
  const access = await db.query.userPortalAccess.findMany({
    where: and(
      eq(userPortalAccess.userId, userId),
      eq(userPortalAccess.organizationId, organizationId),
      eq(userPortalAccess.isActive, true)
    ),
  });

  const portalAccess = access.map((a) => ({
    portalType: a.portalType,
    role: a.role,
  }));

  // Cache the result
  portalAccessCache.set(userId, organizationId, portalAccess);

  return portalAccess;
}
if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY environment variable is not set");
}

const serverClerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});
