import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AlertService } from "@/services/alert.service";
import { requireOrganization } from "@/lib/clerk-server";

/**
 * POST /api/v1/alerts/[alertId]/read
 * Mark an alert as read
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ alertId: string }> }
) {
  try {
    const session = await requireOrganization();
    const { alertId } = await params;

    // Verify alert belongs to user's organization by checking the entity it references
    // AlertService will verify entity ownership before marking as read
    const alert = await AlertService.markAsRead(alertId, session.organizationId);

    return NextResponse.json({
      success: true,
      alert
    });
  } catch (error) {
    console.error("Error marking alert as read:", error);

    if (error instanceof Error && error.message === 'Alert not found') {
      return NextResponse.json(
        { error: "Alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to mark alert as read", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

