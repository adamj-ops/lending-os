import { NextResponse } from "next/server";
import { FundService } from "@/services/fund.service";
import { requireOrganization } from "@/lib/clerk-server";
import type { UpdateFundDTO } from "@/types/fund";

type RouteContext = {
  params: Promise<{ fundId: string }>;
};

/**
 * GET /api/v1/funds/[fundId]
 * 
 * Get fund details with metrics
 */
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireOrganization();
    const { fundId } = await context.params;

    const fund = await FundService.getFundWithMetrics(fundId, session.organizationId);

    if (!fund) {
      return NextResponse.json(
        { code: 404, message: "Fund not found", traceId: crypto.randomUUID() },
        { status: 404 }
      );
    }

    return NextResponse.json(fund);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error fetching fund:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to fetch fund", traceId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/funds/[fundId]
 * 
 * Update fund details
 */
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireOrganization();
    const { fundId } = await context.params;
    const body = await request.json();

    const updateData: UpdateFundDTO = {
      name: body.name,
      fundType: body.fundType,
      status: body.status,
      totalCapacity: body.totalCapacity,
      strategy: body.strategy,
      targetReturn: body.targetReturn,
      managementFeeBps: body.managementFeeBps,
      performanceFeeBps: body.performanceFeeBps,
      closingDate: body.closingDate ? new Date(body.closingDate) : undefined,
      liquidationDate: body.liquidationDate ? new Date(body.liquidationDate) : undefined,
    };

    const fund = await FundService.updateFund(fundId, updateData, session.organizationId, body.updatedBy);

    if (!fund) {
      return NextResponse.json(
        { code: 404, message: "Fund not found", traceId: crypto.randomUUID() },
        { status: 404 }
      );
    }

    return NextResponse.json(fund);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error updating fund:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to update fund", traceId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}

