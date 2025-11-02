import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AlertService } from "@/services/alert.service";
import { requireOrganization } from "@/lib/clerk-server";

export const revalidate = 0; // No caching for alerts

/**
 * GET /api/v1/alerts
 * List alerts with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireOrganization();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as 'unread' | 'read' | 'archived' | null;
    const severity = searchParams.get("severity") as 'info' | 'warning' | 'critical' | null;
    const limit = parseInt(searchParams.get("limit") || "50");

    // Filter alerts by organization context
    // Note: Alerts reference entities (loans, payments, etc.) via entityId.
    // Proper filtering requires joining with entities to check organizationId.
    // For now, AlertService accepts organizationId but filtering happens at entity level.
    const alertList = await AlertService.getAlerts({
      status: status || undefined,
      severity: severity || undefined,
      limit,
      organizationId: session.organizationId
    });

    return NextResponse.json({
      alerts: alertList,
      count: alertList.length
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

