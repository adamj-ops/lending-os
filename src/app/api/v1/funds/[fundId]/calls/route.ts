import { NextResponse } from "next/server";
import { requireOrganization } from "@/lib/clerk-server";
import { FundService } from "@/services/fund.service";
import type { CreateFundCallDTO } from "@/types/fund";

type RouteContext = {
  params: Promise<{ fundId: string }>;
};

/**
 * GET /api/v1/funds/[fundId]/calls
 * 
 * Get all capital calls for a fund
 */
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireOrganization();
    const { fundId } = await context.params;

    const calls = await FundService.getFundCalls(fundId);

    return NextResponse.json({
      calls,
      count: calls.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error fetching fund calls:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to fetch calls", traceId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/funds/[fundId]/calls
 * 
 * Issue a new capital call
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
    if (!body.callNumber || !body.callAmount || !body.dueDate) {
      return NextResponse.json(
        { code: 400, message: "Missing required fields: callNumber, callAmount, dueDate", traceId: crypto.randomUUID() },
        { status: 400 }
      );
    }

    const callData: CreateFundCallDTO = {
      fundId,
      callNumber: body.callNumber,
      callAmount: body.callAmount,
      dueDate: new Date(body.dueDate),
      purpose: body.purpose,
      notes: body.notes,
    };

    const call = await FundService.callCapital(callData);

    return NextResponse.json(call, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error creating capital call:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to create capital call", traceId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}
