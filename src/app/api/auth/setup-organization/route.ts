import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { appUsers, userPortalAccess, organizations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { portalAccessCache } from "@/lib/portal-access-cache";

/**
 * Ensure user exists in app_users (defensive upsert)
 */
async function ensureUserExists(userId: string, clerkUser: any): Promise<void> {
  await db.insert(appUsers).values({
    id: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || clerkUser.username || 'Unknown',
    firstName: clerkUser.firstName || null,
    lastName: clerkUser.lastName || null,
    imageUrl: clerkUser.imageUrl || null,
    isActive: !clerkUser.banned && !clerkUser.locked,
  }).onConflictDoNothing();
}

/**
 * POST /api/auth/setup-organization
 * Assigns portal access to a user for an existing organization
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = clerkUser.id;

    // Defensive: ensure user exists in app_users
    await ensureUserExists(userId, clerkUser);

    // Parse request body
    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId || typeof organizationId !== "string") {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    // Verify organization exists
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Create portal access in transaction (defensive upsert)
    await db.transaction(async (tx) => {
      // Check if portal access already exists
      const existingAccess = await tx
        .select()
        .from(userPortalAccess)
        .where(
          and(
            eq(userPortalAccess.userId, userId),
            eq(userPortalAccess.organizationId, organizationId),
            eq(userPortalAccess.portalType, "ops")
          )
        )
        .limit(1);

      if (existingAccess.length === 0) {
        // Create portal access entry
        await tx.insert(userPortalAccess).values({
          userId,
          organizationId,
          portalType: "ops",
          role: "admin",
          isActive: true,
        });
      }
    });

    // Invalidate portal access cache for this user to ensure fresh data
    portalAccessCache.invalidateUser(userId);

    return NextResponse.json({
      success: true,
      message: "Portal access assigned successfully",
    });
  } catch (error) {
    console.error("Error setting up organization portal access:", error);
    return NextResponse.json(
      { 
        error: "Failed to assign portal access",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
