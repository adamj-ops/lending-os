import { NextResponse } from "next/server";
import { requireOrganization } from "@/lib/clerk-server";
import { FundService } from "@/services/fund.service";
import type { CreateFundDistributionDTO } from "@/types/fund";

type RouteContext = {
  params: Promise<{ fundId: string }>;
};

/**
 * GET /api/v1/funds/[fundId]/distributions
 * 
 * Get all distributions for a fund
 */
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireOrganization(); // No args - keep existing pattern
    const { fundId } = await context.params;

    // Verify fund exists in org first (optional but explicit)
    const fund = await FundService.getFundById(fundId, session.organizationId);
    if (!fund) {
      return NextResponse.json(
        { code: 404, message: "Fund not found", traceId: crypto.randomUUID() },
        { status: 404 }
      );
    }

    const distributions = await FundService.getFundDistributions(
      fundId,
      session.organizationId
    );

    return NextResponse.json({
      distributions,
      count: distributions.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error fetching fund distributions:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to fetch distributions", traceId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/funds/[fundId]/distributions
 * 
 * Record a new distribution
 */
export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireOrganization();
    const { fundId } = await context.params;
    const body = await request.json();

    // Validate required fields
    if (!body.totalAmount || !body.distributionType || !body.distributionDate) {
      return NextResponse.json(
        { code: 400, message: "Missing required fields: totalAmount, distributionType, distributionDate", traceId: crypto.randomUUID() },
        { status: 400 }
      );
    }

    const distributionData: CreateFundDistributionDTO = {
      fundId,
      distributionDate: new Date(body.distributionDate),
      totalAmount: body.totalAmount,
      distributionType: body.distributionType,
      notes: body.notes,
    };

    const distribution = await FundService.recordDistribution(distributionData);

    return NextResponse.json(distribution, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error recording distribution:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to record distribution", traceId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}
