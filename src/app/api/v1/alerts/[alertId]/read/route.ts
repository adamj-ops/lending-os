import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AlertService } from "@/services/alert.service";
import { requireOrganization } from "@/lib/clerk-server";
import { withRequestLogging } from "@/lib/api-logger";
import { ok, notFound, serverError } from "@/lib/api-response";

/**
 * POST /api/v1/alerts/[alertId]/read
 * Mark an alert as read
 */
export const POST = withRequestLogging(async (
  req: NextRequest,
  { params }: { params: Promise<{ alertId: string }> }
) => {
  try {
    const session = await requireOrganization();
    const { alertId } = await params;

    // Verify alert belongs to user's organization by checking the entity it references
    // AlertService will verify entity ownership before marking as read
    const alert = await AlertService.markAsRead(alertId, session.organizationId);

    return ok({ success: true, alert });
  } catch (error) {
    console.error("Error marking alert as read:", error);

    if (error instanceof Error && error.message === 'Alert not found') {
      return notFound("Alert not found");
    }

    return serverError("Failed to mark alert as read", error instanceof Error ? error.message : String(error));
  }
});
