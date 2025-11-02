import { NextRequest, NextResponse } from "next/server";
import { FundAnalyticsService } from "@/services/fund-analytics.service";
import { requireOrganization } from "@/lib/clerk-server";

/**
 * GET /api/v1/funds/[fundId]/analytics
 * 
 * Get fund performance analytics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fundId: string }> },
) {
  try {
    const session = await requireOrganization();
    const { fundId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const performance = await FundAnalyticsService.calculateFundPerformance(
      fundId,
      startDate,
      endDate,
    );

    if (!performance) {
      return NextResponse.json(
        { code: 404, message: "Fund not found", traceId: crypto.randomUUID() },
        { status: 404 }
      );
    }

    return NextResponse.json(performance);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error fetching fund analytics:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to fetch fund analytics", traceId: crypto.randomUUID() },
      { status: 500 },
    );
  }
}

