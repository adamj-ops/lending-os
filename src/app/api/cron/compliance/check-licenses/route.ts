import { NextRequest, NextResponse } from "next/server";
import { checkExpiringLicenses } from "@/lib/events/handlers/ComplianceHandlers";

/**
 * GET /api/cron/compliance/check-licenses
 * 
 * Scheduled job to check for expiring licenses and publish License.Expiring events
 * 
 * Note: The checkExpiringLicenses handler is currently a placeholder.
 * This endpoint is functional and properly authenticated, but the handler logic
 * (organization iteration and event publishing) will be implemented in a future phase.
 * 
 * Runs daily at 9 AM UTC (configured in vercel.json)
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Verify this is coming from Vercel Cron
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting compliance license check...");

    // Call the license check handler
    // Note: This is currently a placeholder that logs completion
    // Future implementation will iterate through organizations and publish events
    await checkExpiringLicenses();

    console.log("Compliance license check completed");

    return NextResponse.json({
      success: true,
      message: "License check completed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("License check failed:", err);
    return NextResponse.json(
      {
        error: "License check failed",
        details: err?.message || String(err),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

