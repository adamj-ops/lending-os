import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AlertService } from "@/services/alert.service";
import { requireOrganization } from "@/lib/clerk-server";
import { withRequestLogging } from "@/lib/api-logger";
import { ok, serverError, badRequest } from "@/lib/api-response";
import { z } from "zod";
import { parseQuery } from "@/lib/validation";

export const revalidate = 0; // No caching for alerts

/**
 * GET /api/v1/alerts
 * List alerts with optional filtering
 */
export const GET = withRequestLogging(async (req: NextRequest) => {
  try {
    const session = await requireOrganization();
    const { searchParams } = new URL(req.url);
    const q = parseQuery(
      z.object({
        status: z.enum(['unread','read','archived']).optional(),
        severity: z.enum(['info','warning','critical']).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
      }),
      searchParams
    );
    if (!q.success) return badRequest(q.message);
    const limit = q.data.limit ? parseInt(q.data.limit) : 50;

    // Filter alerts by organization context
    // Note: Alerts reference entities (loans, payments, etc.) via entityId.
    // Proper filtering requires joining with entities to check organizationId.
    // For now, AlertService accepts organizationId but filtering happens at entity level.
    const alertList = await AlertService.getAlerts({
      status: q.data.status || undefined,
      severity: q.data.severity || undefined,
      limit,
      organizationId: session.organizationId
    });

    return ok({ alerts: alertList, count: alertList.length });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return serverError("Failed to fetch alerts", error instanceof Error ? error.message : String(error));
  }
});
