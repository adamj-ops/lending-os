import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/clerk-server";
import { db } from "@/db/client";
import { userPortalAccess, organizations } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

/**
 * GET /api/auth/organizations
 * Get list of organizations the current user has access to
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { organizations: [] },
        { status: 200 }
      );
    }

    // Get all organizations the user has portal access to
    const accessRecords = await db
      .select({
        organizationId: userPortalAccess.organizationId,
      })
      .from(userPortalAccess)
      .where(
        and(
          eq(userPortalAccess.userId, session.userId),
          eq(userPortalAccess.isActive, true)
        )
      );

    if (accessRecords.length === 0) {
      return NextResponse.json({
        organizations: [],
      });
    }

    // Get unique organization IDs
    const orgIds = [...new Set(accessRecords.map(a => a.organizationId))];

    // Get organization details using IN clause
    const allOrgs = await db
      .select({
        id: organizations.id,
        name: organizations.name,
      })
      .from(organizations)
      .where(inArray(organizations.id, orgIds));

    return NextResponse.json({
      organizations: allOrgs,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

