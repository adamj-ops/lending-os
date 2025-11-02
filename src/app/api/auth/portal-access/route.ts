/**
 * API endpoint for fetching user's portal access
 * 
 * GET /api/auth/portal-access
 * 
 * Returns the current user's portal access permissions for their organization
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserPortalAccess } from "@/lib/clerk-server";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !session.organizationId) {
      return NextResponse.json(
        { portals: [] },
        { status: 401 }
      );
    }

    const portalAccess = await getUserPortalAccess(
      session.userId,
      session.organizationId
    );

    return NextResponse.json({ portals: portalAccess });
  } catch (error) {
    console.error("Error fetching portal access:", error);
    return NextResponse.json(
      { error: "Failed to fetch portal access" },
      { status: 500 }
    );
  }
}

