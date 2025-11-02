/**
 * Admin API endpoint to assign portal access to a user
 * 
 * POST /api/admin/assign-portal-access
 * Body: { email: string, portalType: "ops" | "investor" | "borrower", role?: string, organizationId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { appUsers, userPortalAccess } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/clerk-server";
import type { PortalType } from "@/db/schema/portal-roles";

export async function POST(request: NextRequest) {
  try {
    // Require authentication (admin only - check later)
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, portalType, role = "admin", organizationId } = body;

    if (!email || !portalType || !organizationId) {
      return NextResponse.json(
        { error: "Missing required fields: email, portalType, organizationId" },
        { status: 400 }
      );
    }

    if (!["ops", "investor", "borrower"].includes(portalType)) {
      return NextResponse.json(
        { error: "portalType must be one of: ops, investor, borrower" },
        { status: 400 }
      );
    }

    // Find user by email
    const foundUser = await db.query.appUsers.findFirst({
      where: eq(appUsers.email, email),
    });

    if (!foundUser) {
      return NextResponse.json(
        { error: `User with email ${email} not found` },
        { status: 404 }
      );
    }

    // Check if portal access already exists
    const existing = await db
      .select()
      .from(userPortalAccess)
      .where(
        and(
          eq(userPortalAccess.userId, foundUser.id),
          eq(userPortalAccess.organizationId, organizationId),
          eq(userPortalAccess.portalType, portalType as PortalType)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(userPortalAccess)
        .set({
          role,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(userPortalAccess.id, existing[0].id));

      return NextResponse.json({
        success: true,
        message: "Portal access updated",
        portalAccess: {
          userId: foundUser.id,
          email: foundUser.email,
          portalType,
          role,
          organizationId,
        },
      });
    } else {
      // Create new portal access
      const [newAccess] = await db
        .insert(userPortalAccess)
        .values({
          userId: foundUser.id,
          organizationId,
          portalType: portalType as PortalType,
          role,
          isActive: true,
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: "Portal access created",
        portalAccess: {
          userId: foundUser.id,
          email: foundUser.email,
          portalType,
          role,
          organizationId,
        },
      });
    }
  } catch (error) {
    console.error("Error assigning portal access:", error);
    return NextResponse.json(
      { error: "Failed to assign portal access", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
