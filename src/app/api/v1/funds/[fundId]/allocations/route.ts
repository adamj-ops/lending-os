import { NextResponse } from "next/server";
import { requireOrganization } from "@/lib/clerk-server";
import { FundService } from "@/services/fund.service";
import type { CreateFundAllocationDTO } from "@/types/fund";

type RouteContext = {
  params: Promise<{ fundId: string }>;
};

/**
 * GET /api/v1/funds/[fundId]/allocations
 * 
 * Get all loan allocations for a fund
 */
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireOrganization();
    const { fundId } = await context.params;

    const allocations = await FundService.getFundAllocations(fundId);

    return NextResponse.json({
      allocations,
      count: allocations.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error fetching fund allocations:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to fetch allocations", traceId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/funds/[fundId]/allocations
 * 
 * Allocate capital from fund to a loan
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
    if (!body.loanId || !body.allocatedAmount) {
      return NextResponse.json(
        { code: 400, message: "Missing required fields: loanId, allocatedAmount", traceId: crypto.randomUUID() },
        { status: 400 }
      );
    }

    const allocationData: CreateFundAllocationDTO = {
      fundId,
      loanId: body.loanId,
      allocatedAmount: body.allocatedAmount,
      allocationDate: body.allocationDate ? new Date(body.allocationDate) : new Date(),
    };

    const allocation = await FundService.allocateToLoan(allocationData);

    return NextResponse.json(allocation, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error creating allocation:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to create allocation", traceId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}
