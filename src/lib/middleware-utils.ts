import type { PortalType } from "@/db/schema/portal-roles";

/**
 * Route to portal mapping based on ROUTE-ACCESS-MATRIX.md
 * Maps route paths to their required portal types
 */
const PORTAL_ROUTE_MAP: Record<string, PortalType[]> = {
  // Dashboard routes
  "/dashboard/loans": ["ops"],
  "/dashboard/borrowers": ["ops"],
  "/dashboard/lenders": ["ops"],
  "/dashboard/funds": ["ops", "investor"],
  "/dashboard/properties": ["ops"],
  "/dashboard/finance": ["ops"],
  "/dashboard/crm": ["ops"],
  "/dashboard/default": ["ops"],
  "/dashboard/portfolio": ["ops", "investor", "borrower"], // shared
  "/dashboard/coming-soon": ["ops", "investor", "borrower"], // shared
  "/dashboard": ["ops", "investor", "borrower"], // shared - redirects to portfolio

  // Analytics routes (ops only)
  "/analytics": ["ops"],
  "/analytics/loans": ["ops"],
  "/analytics/collections": ["ops"],
  "/analytics/inspections": ["ops"],

  // Inspector route (ops only)
  "/inspector": ["ops"],

  // Loan feature routes (split between ops and borrower)
  "/loans/draws": ["ops", "borrower"], // split - different implementations
  "/loans/payments": ["ops", "borrower"], // split - different implementations

  // Public routes (no portal required)
  "/auth": [], // public
  "/unauthorized": [], // public
};

/**
 * Public routes that don't require authentication or portal access
 */
const PUBLIC_ROUTES = [
  "/auth",
  "/auth/setup-organization", // Organization setup flow
  "/unauthorized",
  "/api/auth", // Clerk handles auth routes
];

/**
 * Shared routes accessible from multiple portals
 */
const SHARED_ROUTES = [
  "/dashboard",
  "/dashboard/portfolio",
  "/dashboard/coming-soon",
  "/dashboard/[...not-found]",
];

/**
 * API routes that should bypass portal checking
 */
const API_ROUTES = ["/api"];

/**
 * Get the portal type(s) required for a given path
 * Returns empty array if path is public or doesn't require portal access
 */
export function getPortalsForPath(pathname: string): PortalType[] {
  // Normalize pathname (remove trailing slash, ensure leading slash)
  const normalized = pathname.replace(/\/$/, "") || "/";

  // Check exact matches first
  if (PORTAL_ROUTE_MAP[normalized]) {
    return PORTAL_ROUTE_MAP[normalized];
  }

  // Check prefix matches for dynamic routes
  for (const [route, portals] of Object.entries(PORTAL_ROUTE_MAP)) {
    // Handle dynamic segments (e.g., /dashboard/funds/[fundId])
    if (route.includes("[") && normalized.startsWith(route.split("[")[0])) {
      return portals;
    }
  }

  // Check if it's a dashboard route (most dashboard routes are ops)
  if (normalized.startsWith("/dashboard/")) {
    // Default dashboard routes to ops unless specified otherwise
    return ["ops"];
  }

  // Default: no portal required (public route)
  return [];
}

/**
 * Check if a route is public (doesn't require authentication)
 */
export function isPublicRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";

  // Check exact matches
  if (PUBLIC_ROUTES.some((route) => normalized.startsWith(route))) {
    return true;
  }

  // API routes are handled separately (auth checked in API route handlers)
  if (API_ROUTES.some((route) => normalized.startsWith(route))) {
    return true;
  }

  return false;
}

/**
 * Check if a route is shared across multiple portals
 */
export function isSharedRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";

  return SHARED_ROUTES.some((route) => {
    if (route.includes("[")) {
      // Handle dynamic segments
      return normalized.startsWith(route.split("[")[0]);
    }
    return normalized.startsWith(route);
  });
}

/**
 * Check if a route is an API route
 */
export function isApiRoute(pathname: string): boolean {
  return API_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Get the default portal route for a user based on their portal access
 * Priority: ops > investor > borrower
 */
export function getDefaultPortalRoute(
  portalAccess: Array<{ portalType: PortalType; role: string }>
): string {
  const portalTypes = portalAccess.map((a) => a.portalType);

  if (portalTypes.includes("ops")) {
    return "/dashboard/portfolio"; // Default ops route
  }
  if (portalTypes.includes("investor")) {
    return "/dashboard/portfolio"; // Default investor route
  }
  if (portalTypes.includes("borrower")) {
    return "/dashboard/portfolio"; // Default borrower route
  }

  // Fallback to unauthorized if no portal access
  return "/unauthorized";
}

/**
 * Check if user has access to required portals for a path
 */
export function hasPortalAccess(
  userPortals: PortalType[],
  requiredPortals: PortalType[]
): boolean {
  if (requiredPortals.length === 0) {
    return true; // Public route, no portal required
  }

  // User must have at least one of the required portals
  return requiredPortals.some((portal) => userPortals.includes(portal));
}

/**
 * Get portal type from a portal-specific route path
 * e.g Cal /ops/dashboard -> "ops"
 */
export function getPortalFromPath(pathname: string): PortalType | null {
  const normalized = pathname.replace(/\/$/, "") || "/";

  if (normalized.startsWith("/ops/")) {
    return "ops";
  }
  if (normalized.startsWith("/investor/")) {
    return "investor";
  }
  if (normalized.startsWith("/borrower/")) {
    return "borrower";
  }

  return null;
}

/**
 * Normalize route path for matching
 */
export function normalizePath(pathname: string): string {
  return pathname.replace(/\/$/, "") || "/";
}

