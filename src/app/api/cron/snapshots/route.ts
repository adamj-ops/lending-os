import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/analytics.service";
import { updateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Verify this is coming from Vercel Cron
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting daily snapshot computation...");

    // Compute all snapshots for today
    const results = await AnalyticsService.computeAll();

    console.log("Snapshot computation completed:", results);

    // Revalidate cache tags
    updateTag("analytics:funds");
    updateTag("analytics:loans");
    updateTag("analytics:payments");
    updateTag("analytics:inspections");
    updateTag("analytics:*");

    return NextResponse.json({
      success: true,
      message: "Daily snapshots computed successfully",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Snapshot computation failed:", err);
    return NextResponse.json(
      { 
        error: "Snapshot computation failed", 
        details: err?.message || String(err),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
