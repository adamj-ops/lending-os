import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromUserId, getUserPortalAccess } from "@/lib/clerk-server";
import {
  isPublicRoute,
  isApiRoute,
  getPortalsForPath,
  getDefaultPortalRoute,
  hasPortalAccess,
  normalizePath,
} from "@/lib/middleware-utils";
import type { PortalType } from "@/db/schema/portal-roles";
import { db } from "@/db/client";
import { appUsers } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

// Create route matcher for public routes
const isPublicRouteMatcher = createRouteMatcher([
  "/auth(.*)",
  "/unauthorized",
  "/api/auth(.*)", // Clerk handles auth routes
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const normalizedPath = normalizePath(pathname);

  // Check if route is public
  if (isPublicRouteMatcher(req)) {
    // Redirect authenticated users away from auth pages
    try {
      const { userId } = await auth();
      if (userId && normalizedPath.startsWith("/auth")) {
        // User is authenticated, get session for portal access check
        const session = await getSessionFromUserId(userId);
        if (session && session.organizationId) {
          try {
            const portalAccess = await getUserPortalAccess(
              session.userId,
              session.organizationId
            );
            if (portalAccess.length > 0) {
              const defaultRoute = getDefaultPortalRoute(portalAccess);
              return NextResponse.redirect(new URL(defaultRoute, req.url));
            }
            // No portal access, redirect to unauthorized
            return NextResponse.redirect(new URL("/unauthorized", req.url));
          } catch (error) {
            console.error("Error checking portal access for redirect:", error);
            // On error, redirect to dashboard anyway
            return NextResponse.redirect(new URL("/dashboard", req.url));
          }
        }
        // No organization, redirect to organization setup (unless already on setup page)
        if (!normalizedPath.startsWith("/auth/setup-organization")) {
          return NextResponse.redirect(new URL("/auth/setup-organization", req.url));
        }
      }
    } catch (error) {
      console.error("Error in public route middleware:", error);
      // Continue if there's an error checking session
    }
    return NextResponse.next();
  }

  // Skip portal checking for API routes (they handle auth internally)
  if (isApiRoute(normalizedPath)) {
    return NextResponse.next();
  }

  // Protected routes require authentication
  const { userId } = await auth();

  if (!userId) {
    // Not authenticated, redirect to login
    const loginUrl = new URL("/auth/v2/login", req.url);
    loginUrl.searchParams.set("from", normalizedPath);
    return NextResponse.redirect(loginUrl);
  }

  // Get session for organization and portal checks
  const session = await getSessionFromUserId(userId);

  if (!session) {
    // Session fetch failed, redirect to login
    const loginUrl = new URL("/auth/v2/login", req.url);
    loginUrl.searchParams.set("from", normalizedPath);
    return NextResponse.redirect(loginUrl);
  }

  // User must have an organization to access protected routes
  if (!session.organizationId) {
    // Check if user exists in app_users
    try {
      const userExists = await db.query.appUsers.findFirst({
        where: eq(appUsers.id, userId),
      });

      if (!userExists) {
        // User not bootstrapped yet - redirect to complete setup
        if (normalizedPath !== "/auth/complete-setup") {
          return NextResponse.redirect(new URL("/auth/complete-setup", req.url));
        }
        return NextResponse.next();
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
      // On error, continue with normal flow
    }

    // User exists but no org - normal setup flow
    if (normalizedPath !== "/auth/setup-organization") {
      return NextResponse.redirect(new URL("/auth/setup-organization", req.url));
    }
    return NextResponse.next();
  }

  // Get portal access for this user-organization pair
  let portalAccess: Array<{ portalType: PortalType; role: string }> = [];
  try {
    portalAccess = await getUserPortalAccess(
      session.userId,
      session.organizationId
    );
  } catch (error) {
    console.error("Error fetching portal access:", error);
    // If portal access check fails, redirect to organization setup (avoid loop)
    if (normalizedPath !== "/auth/setup-organization") {
      return NextResponse.redirect(new URL("/auth/setup-organization", req.url));
    }
    return NextResponse.next();
  }

  if (portalAccess.length === 0) {
    // User has no portal access for this organization, redirect to setup (avoid loop)
    if (normalizedPath !== "/auth/setup-organization") {
      return NextResponse.redirect(new URL("/auth/setup-organization", req.url));
    }
    return NextResponse.next();
  }

  // Get required portals for this route
  const requiredPortals = getPortalsForPath(normalizedPath);

  // Check if user has access to required portals
  const userPortalTypes = portalAccess.map((a) => a.portalType) as PortalType[];
  const hasAccess = hasPortalAccess(userPortalTypes, requiredPortals);

  if (!hasAccess) {
    // User doesn't have required portal access, redirect to their default portal
    const defaultRoute = getDefaultPortalRoute(portalAccess);
    return NextResponse.redirect(new URL(defaultRoute, req.url));
  }

  // User has access, allow request
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * 
     * Note: API routes are included so Clerk's auth() can work properly
     * Our custom logic skips portal checks for API routes (see line 64-67)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
