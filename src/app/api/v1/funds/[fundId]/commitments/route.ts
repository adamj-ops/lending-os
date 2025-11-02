import { NextResponse } from "next/server";
import { requireOrganization } from "@/lib/clerk-server";
import { FundService } from "@/services/fund.service";
import type { CreateFundCommitmentDTO } from "@/types/fund";

type RouteContext = {
  params: Promise<{ fundId: string }>;
};

/**
 * GET /api/v1/funds/[fundId]/commitments
 * 
 * Get all commitments for a fund
 */
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireOrganization();
    const { fundId } = await context.params;

    const commitments = await FundService.getFundCommitments(fundId);

    return NextResponse.json({
      commitments,
      count: commitments.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error fetching fund commitments:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to fetch commitments", traceId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/funds/[fundId]/commitments
 * 
 * Add a new commitment to the fund
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
    if (!body.lenderId || !body.committedAmount) {
      return NextResponse.json(
        { code: 400, message: "Missing required fields: lenderId, committedAmount", traceId: crypto.randomUUID() },
        { status: 400 }
      );
    }

    const commitmentData: CreateFundCommitmentDTO = {
      fundId,
      lenderId: body.lenderId,
      committedAmount: body.committedAmount,
      commitmentDate: body.commitmentDate ? new Date(body.commitmentDate) : new Date(),
      status: body.status || "active",
    };

    const commitment = await FundService.addCommitment(commitmentData);

    return NextResponse.json(commitment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error creating commitment:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to create commitment", traceId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}
