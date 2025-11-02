import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/clerk-server";

/**
 * GET /api/auth/me
 * 
 * Get current user session with organization info
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { code: 401, message: "Unauthorized", traceId: crypto.randomUUID() },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        organizationId: session.organizationId,
        role: session.activeOrganization?.role,
      },
    });
  } catch (error) {
    console.error("Error fetching user session:", error);
    return NextResponse.json(
      { code: 401, message: "Unauthorized", traceId: crypto.randomUUID() },
      { status: 401 }
    );
  }
}

