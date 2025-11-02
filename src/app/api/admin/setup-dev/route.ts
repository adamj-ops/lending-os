/**
 * One-time admin endpoint to set up dev user with Clerk
 * POST /api/admin/setup-dev
 * 
 * NOTE: This endpoint is deprecated. Users should be created via Clerk Dashboard
 * or using Clerk Backend SDK. This is kept for backward compatibility only.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { organizations, userPortalAccess } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: "This endpoint is deprecated",
      message: "Use Clerk Dashboard or Clerk Backend SDK to create users. See .cursor/docs/operations/clerk-dashboard.md for instructions.",
    },
    { status: 410 } // Gone - deprecated endpoint
  );
}

