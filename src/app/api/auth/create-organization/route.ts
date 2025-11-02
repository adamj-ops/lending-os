import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { appUsers, organizations, userPortalAccess } from "@/db/schema";
import { portalAccessCache } from "@/lib/portal-access-cache";
import { eq } from "drizzle-orm";

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
 * POST /api/auth/create-organization
 * Creates a new organization and assigns portal access to the current user
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
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    // Create org + portal access in transaction
    const result = await db.transaction(async (tx) => {
      // Create organization
      const [newOrg] = await tx.insert(organizations).values({
        name: name.trim(),
      }).returning();

      if (!newOrg) {
        throw new Error("Failed to create organization");
      }

      // Assign portal access (ops portal with admin role)
      await tx.insert(userPortalAccess).values({
        userId,
        organizationId: newOrg.id,
        portalType: "ops",
        role: "admin",
        isActive: true,
      });

      return newOrg;
    });

    // Invalidate portal access cache for this user to ensure fresh data
    portalAccessCache.invalidateUser(userId);

    return NextResponse.json({
      success: true,
      organization: {
        id: result.id,
        name: result.name,
      },
      message: "Organization created and portal access assigned successfully",
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { 
        error: "Failed to create organization",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

