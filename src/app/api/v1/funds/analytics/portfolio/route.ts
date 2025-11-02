import { NextRequest, NextResponse } from "next/server";
import { FundAnalyticsService } from "@/services/fund-analytics.service";
import { requireOrganization } from "@/lib/clerk-server";

/**
 * GET /api/v1/funds/analytics/portfolio
 * 
 * Get portfolio summary across all funds
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireOrganization();

    const summary = await FundAnalyticsService.getPortfolioSummary(session.organizationId);

    if (!summary) {
      return NextResponse.json(
        { code: 404, message: "No funds found for organization", traceId: crypto.randomUUID() },
        { status: 404 },
      );
    }

    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error fetching portfolio analytics:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to fetch portfolio analytics", traceId: crypto.randomUUID() },
      { status: 500 },
    );
  }
}

