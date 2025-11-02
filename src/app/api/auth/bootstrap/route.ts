/**
 * Bootstrap Endpoint
 * 
 * Ensures user exists in database and optionally creates organization with portal access.
 * Called after Clerk registration or when user needs to be synced.
 */

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { appUsers, organizations, userOrganizations, userPortalAccess } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Ensure user exists in app_users with retry logic
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
        console.log(`User ${userId} already exists in database`);
        return; // User exists, we're done
      }

      // Fetch from Clerk
      const clerkUser = await currentUser();
      if (!clerkUser || clerkUser.id !== userId) {
        throw new Error(`Clerk user ${userId} not found or session mismatch`);
      }

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

export async function POST(request: NextRequest) {
  try {
    // Get current Clerk user
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = clerkUser.id;

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { organizationName } = body;

    // Ensure user exists with retry logic
    await ensureUserInDatabase(userId, { maxRetries: 3 });

    let orgId: string | undefined;

    // If organization name provided, create org + access in transaction
    if (organizationName) {
      const result = await db.transaction(async (tx) => {
        const [org] = await tx.insert(organizations).values({
          name: organizationName.trim(),
        }).returning();

        await tx.insert(userOrganizations).values({
          userId,
          organizationId: org.id,
          role: 'admin',
        });

        await tx.insert(userPortalAccess).values({
          userId,
          organizationId: org.id,
          portalType: 'ops',
          role: 'admin',
          isActive: true,
        });

        return org;
      });

      orgId = result.id;
      console.log(`✅ Created organization ${orgId} for user ${userId}`);
    }

    return NextResponse.json({
      success: true,
      organizationId: orgId,
      message: organizationName ? 'User bootstrapped with organization' : 'User bootstrapped',
    });

  } catch (error) {
    console.error('Bootstrap error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to bootstrap user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

